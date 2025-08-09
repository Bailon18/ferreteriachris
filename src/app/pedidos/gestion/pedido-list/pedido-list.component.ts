import { Component, OnInit } from '@angular/core';
import { PedidoService } from 'src/app/core/services/Pedido.service';
import { TokenService } from 'src/app/core/services/token.service';
import swall from 'sweetalert2';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'PREPARADO', 'ENTREGADO', 'CANCELADO'];

@Component({
  selector: 'app-pedido-list',
  templateUrl: './pedido-list.component.html',
  styleUrls: ['./pedido-list.component.css']
})
export class PedidoListComponent implements OnInit {
  pedidos: any[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  cargando = false;
  esAdmin = false;
  vendedorId: number | null = null;
  estadoFiltro: string | null = null;
  estados = ESTADOS;
  mostrarModal = false;
  pedidoSeleccionadoId: number | null = null;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  vendedores: any[] = [];
  vendedorFiltro: number | null = null;

  // Propiedad calculada para la validación de fechas
  get fechasValidas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return true;
    
    const fechaIni = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);
    
    return fechaIni <= fechaFin;
  }

  get mensajeErrorFechas(): string {
    if (!this.fechasValidas) {
      return 'La fecha de inicio no puede ser mayor que la fecha final';
    }
    return '';
  }

  constructor(
    private pedidoService: PedidoService,
    private tokenService: TokenService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.tokenService.isAdmin2();
    console.log('esAdmin:', this.esAdmin);
    console.log('roles:', this.tokenService.getAuthorities());
    if (!this.esAdmin) {
      this.vendedorId = this.tokenService.getIdUser();
    } else {
      this.usuarioService.getVendedores().subscribe(res => {
        this.vendedores = res;
        console.log('vendedores:', this.vendedores);
      });
    }
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;
    this.fechaInicio = hoyStr;
    this.fechaFin = hoyStr;
    this.cargarPedidos(0, this.pageSize);
  }

  formatearFecha(fecha: string, fin: boolean = false): string {
    return fecha ? `${fecha} ${fin ? '23:59:59' : '00:00:00'}` : '';
  }

  cargarPedidos(pageIndex: number, pageSize: number) {
    this.cargando = true;
    let estado = this.estadoFiltro;
    let vendedorId = this.esAdmin ? this.vendedorFiltro : this.vendedorId;
    let inicio = this.fechaInicio ? this.formatearFecha(this.fechaInicio, false) : null;
    let fin = this.fechaFin ? this.formatearFecha(this.fechaFin, true) : null;

    // Si no hay ningún filtro, usa el método original
    if (!estado && !inicio && !fin && !vendedorId) {
      if (this.esAdmin) {
        this.pedidoService.getPedidos(pageIndex, pageSize).subscribe(this.handleResponse(pageIndex, pageSize));
      } else if (this.vendedorId) {
        this.pedidoService.getPedidosByVendedor(this.vendedorId, pageIndex, pageSize).subscribe(this.handleResponse(pageIndex, pageSize));
      }
      return;
    }

    this.pedidoService.filtrarPedidos(
      estado,
      vendedorId,
      inicio,
      fin,
      pageIndex,
      pageSize
    ).subscribe(this.handleResponse(pageIndex, pageSize));
  }

  handleResponse(pageIndex: number, pageSize: number) {
    return {
      next: (res: any) => {
        if (res && Array.isArray(res.content) && res.content.length > 0) {
          this.pedidos = res.content;
          this.totalItems = res.totalElements || 0;
        } else {
          this.pedidos = [];
          this.totalItems = 0;
        }
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        this.cargando = false;
      },
      error: (err: any)  => {
        this.pedidos = [];
        this.totalItems = 0;
        this.cargando = false;
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los pedidos.',
          confirmButtonColor: '#d33'
        });
      }
    };
  }

  onPageChange(page: number) {
    this.cargarPedidos(page, this.pageSize);
  }

  onEstadoChange(estado: string | null) {
    this.estadoFiltro = estado;
    this.pageIndex = 0;
    this.cargarPedidos(0, this.pageSize);
  }

  onFiltrarPorFecha() {
    // Validar que fecha inicio no sea mayor que fecha fin
    if (!this.fechasValidas) {
      swall.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'La fecha de inicio no puede ser mayor que la fecha final.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    this.pageIndex = 0;
    this.cargarPedidos(0, this.pageSize);
  }

  limpiarFiltroFecha() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.cargarPedidos(0, this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  abrirModalDetalle(pedidoId: number) {
    this.pedidoSeleccionadoId = pedidoId;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pedidoSeleccionadoId = null;
  }

  pedidoActualizado() {
    this.cargarPedidos(this.pageIndex, this.pageSize);
    this.cerrarModal();
  }

  onVendedorChange() {
    this.pageIndex = 0;
    this.cargarPedidos(0, this.pageSize);
  }

  onFechaChange() {
    // Este método se ejecuta cuando cambian las fechas para actualizar la validación visual
  }

  // Métodos helper para exportación
  tieneAlgunFiltroActivo(): boolean {
    return !!(
      this.estadoFiltro || 
      (this.esAdmin && this.vendedorFiltro) ||
      this.fechaInicio || 
      this.fechaFin
    );
  }

  obtenerDescripcionFiltros(): string {
    let filtros = [];
    if (this.estadoFiltro) filtros.push(`Estado: ${this.estadoFiltro}`);
    if (this.esAdmin && this.vendedorFiltro) {
      const vendedor = this.vendedores.find(v => v.id === this.vendedorFiltro);
      filtros.push(`Vendedor: ${vendedor?.name} ${vendedor?.lastname}`);
    }
    if (this.fechaInicio && this.fechaFin) {
      filtros.push(`Fecha: ${this.fechaInicio} - ${this.fechaFin}`);
    }
    return filtros.join(', ');
  }

  exportarPDF() {
    // Mostrar indicador de carga inteligente
    let mensaje = "Generando PDF";
    if (this.tieneAlgunFiltroActivo()) {
      mensaje += " con los filtros aplicados";
    } else {
      mensaje += " de todos los pedidos";
    }

    swall.fire({
      title: mensaje + "...",
      html: "Por favor espere mientras se cargan los pedidos y se genera el PDF.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Usar el método de exportación con los filtros actuales
    this.pedidoService.exportarPedidos(
      this.estadoFiltro,
      this.esAdmin ? this.vendedorFiltro : this.vendedorId,
      this.fechaInicio ? this.formatearFecha(this.fechaInicio, false) : null,
      this.fechaFin ? this.formatearFecha(this.fechaFin, true) : null
    ).subscribe({
      next: (pedidos) => {
        swall.close();
        
        if (!pedidos || pedidos.length === 0) {
          swall.fire({
            icon: 'info',
            title: 'Sin datos para exportar',
            text: this.tieneAlgunFiltroActivo() 
              ? 'No hay pedidos que coincidan con los filtros aplicados.'
              : 'No hay pedidos registrados en el sistema.',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
        
        this.generarPDFConPedidos(pedidos);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los pedidos para generar el PDF.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar pedidos:', err);
      }
    });
  }

  private generarPDFConPedidos(pedidos: any[]) {
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte de Pedidos', 14, 22);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 32);
    doc.text(`Usuario: ${this.tokenService.getUserName() || 'N/A'}`, 14, 37);
    doc.text(`Total de pedidos: ${pedidos.length}`, 14, 42);
    
    if (this.tieneAlgunFiltroActivo()) {
      doc.text(`Filtros aplicados: ${this.obtenerDescripcionFiltros()}`, 14, 47);
    } else {
      doc.text(`Tipo de reporte: Completo`, 14, 47);
    }

    // Calcular estadísticas
    const totalMonto = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    doc.text(`Monto total: S/ ${totalMonto.toFixed(2)}`, 14, 52);

    // Preparar datos para la tabla
    const datosTabla = pedidos.map(pedido => [
      pedido.id?.toString() || '-',
      `${pedido.cliente?.nombre || ''} ${pedido.cliente?.apellido || ''}`.trim() || '-',
      `${pedido.vendedor?.name || ''} ${pedido.vendedor?.lastname || ''}`.trim() || '-',
      pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-PE') : '-',
      pedido.estado || '-',
      `S/ ${(pedido.total || 0).toFixed(2)}`
    ]);

    // Configurar la tabla
    autoTable(doc, {
      head: [['ID', 'Cliente', 'Vendedor', 'Fecha', 'Estado', 'Total']],
      body: datosTabla,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'left'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 40 }, // Cliente
        2: { cellWidth: 40 }, // Vendedor
        3: { cellWidth: 25 }, // Fecha
        4: { cellWidth: 25 }, // Estado
        5: { cellWidth: 25 }  // Total
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 60, right: 14, bottom: 20, left: 14 }
    });

    // Guardar el PDF
    const tipoReporte = this.tieneAlgunFiltroActivo() ? 'filtrado' : 'completo';
    const nombreArchivo = `pedidos_${tipoReporte}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);

    // Mostrar mensaje de éxito
    swall.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: `El archivo ${nombreArchivo} se ha descargado correctamente.`,
      confirmButtonColor: '#3085d6',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }

  exportarExcel() {
    // Mostrar indicador de carga inteligente
    let mensaje = "Generando Excel";
    if (this.tieneAlgunFiltroActivo()) {
      mensaje += " con los filtros aplicados";
    } else {
      mensaje += " de todos los pedidos";
    }

    swall.fire({
      title: mensaje + "...",
      html: "Por favor espere mientras se cargan los pedidos y se genera el archivo Excel.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Usar el método de exportación con los filtros actuales
    this.pedidoService.exportarPedidos(
      this.estadoFiltro,
      this.esAdmin ? this.vendedorFiltro : this.vendedorId,
      this.fechaInicio ? this.formatearFecha(this.fechaInicio, false) : null,
      this.fechaFin ? this.formatearFecha(this.fechaFin, true) : null
    ).subscribe({
      next: (pedidos) => {
        swall.close();
        
        if (!pedidos || pedidos.length === 0) {
          swall.fire({
            icon: 'info',
            title: 'Sin datos para exportar',
            text: this.tieneAlgunFiltroActivo() 
              ? 'No hay pedidos que coincidan con los filtros aplicados.'
              : 'No hay pedidos registrados en el sistema.',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
        
        this.generarExcelConPedidos(pedidos);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los pedidos para generar el Excel.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar pedidos:', err);
      }
    });
  }

  private generarExcelConPedidos(pedidos: any[]) {
    // Preparar datos para Excel
    const datosExcel = pedidos.map(pedido => ({
      'ID': pedido.id,
      'Cliente': `${pedido.cliente?.nombre || ''} ${pedido.cliente?.apellido || ''}`.trim(),
      'DNI Cliente': pedido.cliente?.documentoIdentidad || '-',
      'Vendedor': `${pedido.vendedor?.name || ''} ${pedido.vendedor?.lastname || ''}`.trim(),
      'Fecha': pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-PE') : '-',
      'Estado': pedido.estado || '-',
      'Total': pedido.total || 0,
      'Observaciones': pedido.observaciones || '-'
    }));

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de trabajo principal
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // Cliente
      { wch: 15 },  // DNI
      { wch: 30 },  // Vendedor
      { wch: 12 },  // Fecha
      { wch: 15 },  // Estado
      { wch: 12 },  // Total
      { wch: 40 }   // Observaciones
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    // Crear segunda hoja con estadísticas
    const totalMonto = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
    const estadisticasPorEstado: { [key: string]: number } = {};
    pedidos.forEach(pedido => {
      const estado = pedido.estado || 'SIN_ESTADO';
      estadisticasPorEstado[estado] = (estadisticasPorEstado[estado] || 0) + 1;
    });

    const estadisticas = [
      { 'Estadística': 'Total de pedidos', 'Valor': pedidos.length },
      { 'Estadística': 'Monto total', 'Valor': `S/ ${totalMonto.toFixed(2)}` },
      { 'Estadística': 'Promedio por pedido', 'Valor': `S/ ${(totalMonto / pedidos.length).toFixed(2)}` },
      { 'Estadística': 'Fecha de generación', 'Valor': new Date().toLocaleDateString('es-PE') },
      { 'Estadística': 'Usuario', 'Valor': this.tokenService.getUserName() || 'N/A' }
    ];

    // Agregar estadísticas por estado
    Object.entries(estadisticasPorEstado).forEach(([estado, cantidad]) => {
      estadisticas.push({
        'Estadística': `Pedidos ${estado}`,
        'Valor': cantidad
      });
    });

    if (this.tieneAlgunFiltroActivo()) {
      estadisticas.push({
        'Estadística': 'Filtros aplicados',
        'Valor': this.obtenerDescripcionFiltros()
      });
    }

    const worksheetStats = XLSX.utils.json_to_sheet(estadisticas);
    worksheetStats['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheetStats, 'Estadísticas');

    // Guardar el archivo
    const tipoReporte = this.tieneAlgunFiltroActivo() ? 'filtrado' : 'completo';
    const nombreArchivo = `pedidos_${tipoReporte}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);

    // Mostrar mensaje de éxito
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
