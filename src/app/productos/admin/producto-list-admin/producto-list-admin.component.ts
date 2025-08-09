import { Component, OnInit } from '@angular/core';
import { ProductosService } from 'src/app/core/services/productos.service';
import swall from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-producto-list-admin',
  templateUrl: './producto-list-admin.component.html',
  styleUrls: ['./producto-list-admin.component.css']
})
export class ProductoListAdminComponent implements OnInit {
  productos: any[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  textoBuscar: string = '';

  marcas: any[] = [];
  tiposPintura: any[] = [];
  marcaSeleccionada: number | null = null;
  tipoSeleccionado: number | null = null;

  mostrarModal = false;
  productoAEditarId: number | null = null;

  stockMinimoCount: number = 0;
  mostrarWarningStockMinimo: boolean = false;
  mostrarSoloStockMinimo: boolean = false;

  constructor(private productosService: ProductosService) {}

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarTiposPintura();
    this.cargarProductos(0, this.pageSize);
    this.verificarStockMinimo();
  }

  cargarMarcas() {
    this.productosService.getMarcas().subscribe({
      next: res => this.marcas = res,
      error: () => this.marcas = []
    });
  }

  cargarTiposPintura() {
    this.productosService.getTiposPintura().subscribe({
      next: res => this.tiposPintura = res,
      error: () => this.tiposPintura = []
    });
  }

  verificarStockMinimo() {
    this.productosService.getCountProductosStockMinimo().subscribe({
      next: (count) => {
        this.stockMinimoCount = count;
        this.mostrarWarningStockMinimo = count > 0;
      },
      error: (err) => {
        console.error('Error al verificar stock mínimo:', err);
      }
    });
  }

  filtrarStockMinimo() {
    this.mostrarSoloStockMinimo = true;
    this.mostrarWarningStockMinimo = false;
    this.productosService.getProductosStockMinimo(this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.content)) {
          this.productos = res.content;
          this.totalItems = res.totalElements || 0;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos con stock mínimo:', err);
      }
    });
  }

  quitarFiltroStockMinimo() {
    this.mostrarSoloStockMinimo = false;
    this.cargarProductos(this.pageIndex, this.pageSize);
  }

  cargarProductos(pageIndex: number, pageSize: number) {
    if (this.mostrarSoloStockMinimo) {
      this.productosService.getProductosStockMinimo(pageIndex, pageSize).subscribe({
        next: res => {
          if (res && Array.isArray(res.content)) {
            this.productos = res.content;
            this.totalItems = res.totalElements || 0;
          }
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          this.verificarStockMinimo();
        },
        error: err => {
          console.error('Error al cargar productos:', err);
        }
      });
    } else {
      swall.fire({
        title: "Cargando...",
        html: "Por favor espere mientras se cargan los productos.",
        allowOutsideClick: false,
        didOpen: () => { swall.showLoading(); }
      });

      let params: any = {
        page: pageIndex,
        size: pageSize
      };
      if (this.textoBuscar) params.textoBuscar = this.textoBuscar;
      if (this.marcaSeleccionada) params.marcaId = this.marcaSeleccionada;
      if (this.tipoSeleccionado) params.tipoId = this.tipoSeleccionado;

      this.productosService.filtrarProductosAvanzado(params).subscribe({
        next: res => {
          if (res && Array.isArray(res.content) && res.content.length > 0) {
            this.productos = res.content;
            this.totalItems = res.totalElements || 0;
          } else {
            this.productos = [];
            this.totalItems = 0;
          }
          this.pageSize = pageSize;
          this.pageIndex = pageIndex;
          swall.close();
          this.verificarStockMinimo();
        },
        error: err => {
          this.productos = [];
          this.totalItems = 0;
          swall.close();
          swall.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los productos.',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  }

  onPageChange(page: number) {
    this.cargarProductos(page, this.pageSize);
  }

  onSearch() {
    this.pageIndex = 0;
    this.cargarProductos(0, this.pageSize);
  }

  onFiltrar() {
    this.pageIndex = 0;
    this.cargarProductos(0, this.pageSize);
  }

  abrirModalNuevoProducto() {
    this.productoAEditarId = null;
    this.mostrarModal = true;
  }

  abrirModalEditarProducto(producto: any) {
    this.productoAEditarId = producto.id;
    this.mostrarModal = true;
  }

  productoGuardadoExitoso() {
    this.cargarProductos(this.pageIndex, this.pageSize);
    this.mostrarModal = false;
    this.verificarStockMinimo();
  }

  cambiarEstadoProducto(producto: any) {
    const nuevoEstado = !producto.estaActivo;
    swall.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${nuevoEstado ? 'activar' : 'bloquear'} este producto?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productosService.cambiarEstadoProducto(producto.id, nuevoEstado).subscribe({
          next: () => {
            this.cargarProductos(this.pageIndex, this.pageSize);
            swall.fire({
              icon: 'success',
              title: 'Estado actualizado',
              text: `El producto ha sido ${nuevoEstado ? 'activado' : 'bloqueado'} correctamente.`,
              confirmButtonColor: '#3085d6'
            });
          },
          error: (err) => {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el estado del producto.',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  limpiarFiltros() {
    this.textoBuscar = '';
    this.marcaSeleccionada = null;
    this.tipoSeleccionado = null;
    this.pageIndex = 0;
    this.cargarProductos(0, this.pageSize);
  }

  exportarPDF() {
    // Mostrar indicador de carga
    swall.fire({
      title: "Generando PDF...",
      html: "Por favor espere mientras se cargan todos los productos y se genera el archivo PDF.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Obtener TODOS los productos de la base de datos
    this.productosService.getProductos().subscribe({
      next: (todosLosProductos) => {
        this.generarPDFConProductos(todosLosProductos);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos para generar el PDF.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar productos:', err);
      }
    });
  }

  private generarPDFConProductos(productos: any[]) {
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Matizados Chris - Listado Completo de Productos', 14, 22);
    
    // Fecha de generación
    const fecha = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, 14, 32);
    
    // Nota sobre el contenido completo
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Este reporte contiene todos los productos registrados en la base de datos', 14, 40);

    // Preparar datos para la tabla
    const columnas = [
      'ID',
      'Nombre',
      'Marca',
      'Tipo',
      'Color',
      'Precio (S/)',
      'Stock',
      'Estado'
    ];

    const filas = productos.map(producto => [
      producto.id.toString(),
      producto.nombre,
      producto.marca?.nombre || '-',
      producto.tipoPintura?.nombre || '-',
      producto.color,
      `S/ ${producto.precioVentaGalon}`,
      producto.stockTotal.toString(),
      producto.estaActivo ? 'Activo' : 'Inactivo'
    ]);

    // Crear la tabla
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 50,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // ID
        1: { cellWidth: 35 }, // Nombre
        2: { cellWidth: 25 }, // Marca
        3: { cellWidth: 25 }, // Tipo
        4: { cellWidth: 20 }, // Color
        5: { halign: 'right', cellWidth: 20 }, // Precio
        6: { halign: 'center', cellWidth: 15 }, // Stock
        7: { halign: 'center', cellWidth: 20 } // Estado
      },
      didParseCell: (data: any) => {
        // Resaltar productos con stock mínimo
        if (data.row.index >= 0) {
          const producto = productos[data.row.index];
          if (producto && producto.stockTotal <= producto.stockMinimo) {
            data.cell.styles.fillColor = [255, 235, 235]; // Fondo rojo claro
            data.cell.styles.textColor = [139, 0, 0]; // Texto rojo oscuro
          }
        }
      }
    });

    // Agregar resumen al final
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen:', 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de productos: ${productos.length}`, 14, finalY + 8);
    doc.text(`Productos activos: ${productos.filter(p => p.estaActivo).length}`, 14, finalY + 16);
    doc.text(`Productos inactivos: ${productos.filter(p => !p.estaActivo).length}`, 14, finalY + 24);
    
    const productosStockMinimo = productos.filter(p => p.stockTotal <= p.stockMinimo);
    if (productosStockMinimo.length > 0) {
      doc.setTextColor(139, 0, 0);
      doc.text(`⚠ Productos con stock mínimo: ${productosStockMinimo.length}`, 14, finalY + 32);
    }

    // Cerrar indicador de carga
    swall.close();

    // Guardar el PDF
    const nombreArchivo = `productos_completo_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);

    // Mostrar mensaje de éxito que se cierra automáticamente
    swall.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: `El archivo completo ${nombreArchivo} se ha descargado correctamente.`,
      confirmButtonColor: '#3085d6',
      timer: 3000, // Se cierra automáticamente después de 3 segundos
      timerProgressBar: true, // Muestra una barra de progreso
      showConfirmButton: false // Oculta el botón de confirmación
    });
  }

  exportarExcel() {
    // Mostrar indicador de carga
    swall.fire({
      title: "Generando Excel...",
      html: "Por favor espere mientras se cargan todos los productos y se genera el archivo Excel.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Obtener TODOS los productos de la base de datos
    this.productosService.getProductos().subscribe({
      next: (todosLosProductos) => {
        this.generarExcelConProductos(todosLosProductos);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos para generar el Excel.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar productos:', err);
      }
    });
  }

  private generarExcelConProductos(productos: any[]) {
    // Preparar datos para Excel
    const datosExcel = productos.map(producto => ({
      'ID': producto.id,
      'Nombre': producto.nombre,
      'Marca': producto.marca?.nombre || '-',
      'Tipo': producto.tipoPintura?.nombre || '-',
      'Color': producto.color,
      'Precio Venta (S/)': producto.precioVentaGalon,
      'Stock Total': producto.stockTotal,
      'Stock Mínimo': producto.stockMinimo,
      'Estado': producto.estaActivo ? 'Activo' : 'Inactivo',
      'Fecha Creación': producto.fechaCreacion ? new Date(producto.fechaCreacion).toLocaleDateString('es-PE') : '-',
      'Descripción': producto.descripcion || '-'
    }));

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 25 },  // Nombre
      { wch: 15 },  // Marca
      { wch: 20 },  // Tipo
      { wch: 15 },  // Color
      { wch: 15 },  // Precio
      { wch: 12 },  // Stock Total
      { wch: 12 },  // Stock Mínimo
      { wch: 10 },  // Estado
      { wch: 15 },  // Fecha
      { wch: 30 }   // Descripción
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // Crear una segunda hoja con estadísticas
    const estadisticas = [
      { 'Estadística': 'Total de productos', 'Valor': productos.length },
      { 'Estadística': 'Productos activos', 'Valor': productos.filter(p => p.estaActivo).length },
      { 'Estadística': 'Productos inactivos', 'Valor': productos.filter(p => !p.estaActivo).length },
      { 'Estadística': 'Productos con stock mínimo', 'Valor': productos.filter(p => p.stockTotal <= p.stockMinimo).length },
      { 'Estadística': 'Fecha de generación', 'Valor': new Date().toLocaleDateString('es-PE') }
    ];

    const worksheetStats = XLSX.utils.json_to_sheet(estadisticas);
    worksheetStats['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheetStats, 'Estadísticas');

    // Crear una tercera hoja con productos con stock mínimo
    const productosStockMinimo = productos.filter(p => p.stockTotal <= p.stockMinimo);
    if (productosStockMinimo.length > 0) {
      const datosStockMinimo = productosStockMinimo.map(producto => ({
        'ID': producto.id,
        'Nombre': producto.nombre,
        'Marca': producto.marca?.nombre || '-',
        'Color': producto.color,
        'Stock Actual': producto.stockTotal,
        'Stock Mínimo': producto.stockMinimo,
        'Diferencia': producto.stockTotal - producto.stockMinimo
      }));

      const worksheetStockMin = XLSX.utils.json_to_sheet(datosStockMinimo);
      worksheetStockMin['!cols'] = [
        { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, 
        { wch: 12 }, { wch: 12 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheetStockMin, 'Stock Mínimo');
    }

    // Cerrar indicador de carga
    swall.close();

    // Guardar el archivo
    const nombreArchivo = `productos_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);

    // Mostrar mensaje de éxito que se cierra automáticamente
    swall.fire({
      icon: 'success',
      title: 'Excel Generado',
      text: `El archivo ${nombreArchivo} se ha descargado correctamente.`,
      confirmButtonColor: '#3085d6',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }
}
