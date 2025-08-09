import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/core/services/cliente.service';
import swall from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClienteListComponent implements OnInit {
  clientes: any[] = [];
  totalItems: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  mostrarModal = false;
  clienteAEditarId: number | null = null;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes(0, this.pageSize);
  }

  cargarClientes(pageIndex: number, pageSize: number) {
    swall.fire({
      title: "Cargando...",
      html: "Por favor espere mientras se cargan los clientes.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    this.clienteService.getClientes(pageIndex, pageSize).subscribe({
      next: res => {
        if (res && Array.isArray(res.content) && res.content.length > 0) {
          this.clientes = res.content;
          this.totalItems = res.totalElements || 0;
        } else {
          this.clientes = [];
          this.totalItems = 0;
        }
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        swall.close();
      },
      error: err => {
        this.clientes = [];
        this.totalItems = 0;
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onPageChange(page: number) {
    this.cargarClientes(page, this.pageSize);
  }

  abrirModalDetalleCliente(cliente: any) {
    this.clienteAEditarId = cliente.id;
    this.mostrarModal = true;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  clienteDetalleCerrado() {
    this.mostrarModal = false;
  }

  exportarPDF() {
    // Mostrar indicador de carga
    swall.fire({
      title: "Generando PDF...",
      html: "Por favor espere mientras se cargan todos los clientes y se genera el PDF.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Obtener TODOS los clientes de la base de datos
    this.clienteService.getClientesAll().subscribe({
      next: (todosLosClientes) => {
        this.generarPDFConClientes(todosLosClientes);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes para generar el PDF.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  private generarPDFConClientes(clientes: any[]) {
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte Completo de Clientes', 14, 22);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 32);
    doc.text(`Total de clientes: ${clientes.length}`, 14, 37);
    doc.text(`Clientes activos: ${clientes.filter(c => c.estaActivo).length}`, 14, 42);
    doc.text(`Clientes inactivos: ${clientes.filter(c => !c.estaActivo).length}`, 14, 47);

    // Preparar datos para la tabla
    const datosTabla = clientes.map(cliente => [
      cliente.id?.toString() || '-',
      cliente.documentoIdentidad || '-',
      cliente.nombre || '-',
      cliente.apellido || '-',
      cliente.correo || '-',
      cliente.telefono || '-',
      cliente.estaActivo ? 'Activo' : 'Inactivo'
    ]);

    // Configurar la tabla
    autoTable(doc, {
      head: [['ID', 'DNI', 'Nombre', 'Apellidos', 'Email', 'Teléfono', 'Estado']],
      body: datosTabla,
      startY: 55,
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
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 25 }, // DNI
        2: { cellWidth: 30 }, // Nombre
        3: { cellWidth: 35 }, // Apellidos
        4: { cellWidth: 45 }, // Email
        5: { cellWidth: 25 }, // Teléfono
        6: { cellWidth: 20 }  // Estado
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 55, right: 14, bottom: 20, left: 14 }
    });

    // Agregar segunda página con clientes activos si hay muchos clientes
    if (clientes.length > 30) {
      doc.addPage();
      
      const clientesActivos = clientes.filter(c => c.estaActivo);
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Clientes Activos', 14, 22);

      if (clientesActivos.length > 0) {
        const datosActivos = clientesActivos.map(cliente => [
          cliente.id?.toString() || '-',
          cliente.documentoIdentidad || '-',
          `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
          cliente.correo || '-',
          cliente.telefono || '-'
        ]);

        autoTable(doc, {
          head: [['ID', 'DNI', 'Nombre Completo', 'Email', 'Teléfono']],
          body: datosActivos,
          startY: 35,
          styles: {
            fontSize: 9,
            cellPadding: 4
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 30 },
            2: { cellWidth: 50 },
            3: { cellWidth: 50 },
            4: { cellWidth: 35 }
          }
        });
      }
    }

    // Cerrar indicador de carga
    swall.close();

    // Guardar el PDF
    const nombreArchivo = `clientes_completo_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);

    // Mostrar mensaje de éxito que se cierra automáticamente
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
    // Mostrar indicador de carga
    swall.fire({
      title: "Generando Excel...",
      html: "Por favor espere mientras se cargan todos los clientes y se genera el archivo Excel.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Obtener TODOS los clientes de la base de datos
    this.clienteService.getClientesAll().subscribe({
      next: (todosLosClientes) => {
        this.generarExcelConClientes(todosLosClientes);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes para generar el Excel.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar clientes:', err);
      }
    });
  }

  private generarExcelConClientes(clientes: any[]) {
    // Preparar datos para Excel
    const datosExcel = clientes.map(cliente => ({
      'ID': cliente.id,
      'DNI': cliente.documentoIdentidad || '-',
      'Nombre': cliente.nombre || '-',
      'Apellidos': cliente.apellido || '-',
      'Nombre Completo': `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
      'Email': cliente.correo || '-',
      'Teléfono': cliente.telefono || '-',
      'Dirección': cliente.direccion || '-',
      'Estado': cliente.estaActivo ? 'Activo' : 'Inactivo',
      'Fecha de Registro': cliente.fechaCreacion ? new Date(cliente.fechaCreacion).toLocaleDateString('es-PE') : '-'
    }));

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de trabajo principal
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 15 },  // DNI
      { wch: 20 },  // Nombre
      { wch: 25 },  // Apellidos
      { wch: 30 },  // Nombre Completo
      { wch: 30 },  // Email
      { wch: 15 },  // Teléfono
      { wch: 35 },  // Dirección
      { wch: 12 },  // Estado
      { wch: 15 }   // Fecha Registro
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

    // Crear segunda hoja con estadísticas
    const estadisticas = [
      { 'Estadística': 'Total de clientes', 'Valor': clientes.length },
      { 'Estadística': 'Clientes activos', 'Valor': clientes.filter(c => c.estaActivo).length },
      { 'Estadística': 'Clientes inactivos', 'Valor': clientes.filter(c => !c.estaActivo).length },
      { 'Estadística': 'Clientes con teléfono', 'Valor': clientes.filter(c => c.telefono && c.telefono.trim() !== '').length },
      { 'Estadística': 'Clientes con email', 'Valor': clientes.filter(c => c.correo && c.correo.trim() !== '').length },
      { 'Estadística': 'Fecha de generación', 'Valor': new Date().toLocaleDateString('es-PE') }
    ];

    const worksheetStats = XLSX.utils.json_to_sheet(estadisticas);
    worksheetStats['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheetStats, 'Estadísticas');

    // Crear tercera hoja solo con clientes activos
    const clientesActivos = clientes.filter(c => c.estaActivo);
    if (clientesActivos.length > 0) {
      const datosActivos = clientesActivos.map(cliente => ({
        'ID': cliente.id,
        'DNI': cliente.documentoIdentidad || '-',
        'Nombre Completo': `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
        'Email': cliente.correo || '-',
        'Teléfono': cliente.telefono || '-',
        'Dirección': cliente.direccion || '-'
      }));

      const worksheetActivos = XLSX.utils.json_to_sheet(datosActivos);
      worksheetActivos['!cols'] = [
        { wch: 8 }, { wch: 15 }, { wch: 30 }, 
        { wch: 30 }, { wch: 15 }, { wch: 35 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheetActivos, 'Clientes Activos');
    }

    // Crear cuarta hoja con información de contacto
    const clientesConContacto = clientes.filter(c => 
      (c.telefono && c.telefono.trim() !== '') || 
      (c.correo && c.correo.trim() !== '')
    );

    if (clientesConContacto.length > 0) {
      const datosContacto = clientesConContacto.map(cliente => ({
        'Nombre Completo': `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
        'Email': cliente.correo || '-',
        'Teléfono': cliente.telefono || '-',
        'Estado': cliente.estaActivo ? 'Activo' : 'Inactivo'
      }));

      const worksheetContacto = XLSX.utils.json_to_sheet(datosContacto);
      worksheetContacto['!cols'] = [
        { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheetContacto, 'Contactos');
    }

    // Cerrar indicador de carga
    swall.close();

    // Guardar el archivo
    const nombreArchivo = `clientes_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
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
 