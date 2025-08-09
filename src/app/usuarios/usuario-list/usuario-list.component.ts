import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import swall from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit {
  usuarios: any[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  textoBuscar: string = '';
  estadoFiltro: boolean | null = null;
  mostrarModal = false;
  usuarioAEditarId: number | null = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios(0, this.pageSize);
  }

  cargarUsuarios(pageIndex: number, pageSize: number) {
    swall.fire({
      title: "Cargando...",
      html: "Por favor espere mientras se cargan los usuarios.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    let observable;
    if (this.textoBuscar) {
      observable = this.usuarioService.filtrarUsuarios(this.textoBuscar, pageIndex, pageSize);
    } else if (this.estadoFiltro !== null) {
      observable = this.usuarioService.getUsuariosPorEstado(this.estadoFiltro, pageIndex, pageSize);
    } else {
      observable = this.usuarioService.getUsuarios(pageIndex, pageSize);
    }

    observable.subscribe({
      next: res => {
        if (res && Array.isArray(res.content) && res.content.length > 0) {
          this.usuarios = res.content;
          console.log("usuarios",this.usuarios);
          this.totalItems = res.totalElements || 0;
        } else {
          this.usuarios = [];
          this.totalItems = 0;
        }
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        swall.close();
      },
      error: err => {
        this.usuarios = [];
        this.totalItems = 0;
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onPageChange(page: number) {
    this.cargarUsuarios(page, this.pageSize);
  }

  onSearch() {
    this.pageIndex = 0;
    this.cargarUsuarios(0, this.pageSize);
  }

  onEstadoChange(estado: boolean | null) {
    this.estadoFiltro = estado;
    this.pageIndex = 0;
    this.cargarUsuarios(0, this.pageSize);
  }

  limpiarFiltros() {
    this.textoBuscar = '';
    this.estadoFiltro = null;
    this.pageIndex = 0;
    this.cargarUsuarios(0, this.pageSize);
  }

  actualizarEstado(id: number, nuevoEstado: boolean) {
    swall.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.actualizarEstado(id, nuevoEstado).subscribe({
          next: () => {
            this.cargarUsuarios(this.pageIndex, this.pageSize);
            swall.fire({
              icon: 'success',
              title: 'Estado actualizado',
              text: 'El estado del usuario ha sido actualizado correctamente.',
              confirmButtonColor: '#3085d6'
            });
          },
          error: (err) => {
            swall.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el estado del usuario.',
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

  usuarioGuardadoExitoso() {
    this.cargarUsuarios(this.pageIndex, this.pageSize);
    this.mostrarModal = false;
  }

  abrirModalNuevoUsuario() {
    this.usuarioAEditarId = null;
    this.mostrarModal = true;
  }

  abrirModalEditarUsuario(usuario: any) {
    this.usuarioAEditarId = usuario.id;
    this.mostrarModal = true;
  }

  exportarPDF() {
    // Mostrar indicador de carga
    swall.fire({
      title: "Generando PDF...",
      html: "Por favor espere mientras se cargan todos los usuarios y se genera el PDF.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Obtener TODOS los usuarios de la base de datos
    this.usuarioService.getUsuariosAll().subscribe({
      next: (todosLosUsuarios) => {
        this.generarPDFConUsuarios(todosLosUsuarios);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios para generar el PDF.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  private generarPDFConUsuarios(usuarios: any[]) {
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Reporte Completo de Usuarios', 14, 22);
    
    // Información del reporte
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 32);
    doc.text(`Total de usuarios: ${usuarios.length}`, 14, 37);
    doc.text(`Usuarios activos: ${usuarios.filter(u => u.active).length}`, 14, 42);
    doc.text(`Usuarios inactivos: ${usuarios.filter(u => !u.active).length}`, 14, 47);

    // Preparar datos para la tabla
    const datosTabla = usuarios.map(usuario => [
      usuario.id?.toString() || '-',
      usuario.document || '-',
      usuario.name || '-',
      usuario.lastname || '-',
      usuario.email || '-',
      usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].rolName : 'Sin rol',
      usuario.active ? 'Activo' : 'Inactivo'
    ]);

    // Configurar la tabla
    autoTable(doc, {
      head: [['ID', 'DNI', 'Nombre', 'Apellidos', 'Email', 'Rol', 'Estado']],
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
        5: { cellWidth: 25 }, // Rol
        6: { cellWidth: 20 }  // Estado
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 55, right: 14, bottom: 20, left: 14 }
    });

    // Agregar segunda página con estadísticas detalladas si hay muchos usuarios
    if (usuarios.length > 30) {
      doc.addPage();
      
      // Estadísticas por rol
      const estadisticasPorRol: { [key: string]: number } = {};
      usuarios.forEach(usuario => {
        const rol = usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].rolName : 'Sin rol';
        estadisticasPorRol[rol] = (estadisticasPorRol[rol] || 0) + 1;
      });

      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Estadísticas Detalladas', 14, 22);

      // Tabla de estadísticas por rol
      const datosEstadisticas = Object.entries(estadisticasPorRol).map(([rol, cantidad]) => [
        rol,
        cantidad.toString(),
        ((cantidad / usuarios.length) * 100).toFixed(1) + '%'
      ]);

      autoTable(doc, {
        head: [['Rol', 'Cantidad', 'Porcentaje']],
        body: datosEstadisticas,
        startY: 35,
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [52, 152, 219],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 }
        }
      });
    }

    // Cerrar indicador de carga
    swall.close();

    // Guardar el PDF
    const nombreArchivo = `usuarios_completo_${new Date().toISOString().split('T')[0]}.pdf`;
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
      html: "Por favor espere mientras se cargan todos los usuarios y se genera el archivo Excel.",
      allowOutsideClick: false,
      didOpen: () => { swall.showLoading(); }
    });

    // Obtener TODOS los usuarios de la base de datos
    this.usuarioService.getUsuariosAll().subscribe({
      next: (todosLosUsuarios) => {
        this.generarExcelConUsuarios(todosLosUsuarios);
      },
      error: (err) => {
        swall.close();
        swall.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios para generar el Excel.',
          confirmButtonColor: '#d33'
        });
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  private generarExcelConUsuarios(usuarios: any[]) {
    // Preparar datos para Excel
    const datosExcel = usuarios.map(usuario => ({
      'ID': usuario.id,
      'DNI': usuario.document || '-',
      'Nombre': usuario.name || '-',
      'Apellidos': usuario.lastname || '-',
      'Email': usuario.email || '-',
      'Rol': usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].rolName : 'Sin rol',
      'Estado': usuario.active ? 'Activo' : 'Inactivo',
      'Teléfono': usuario.phone || '-',
      'Dirección': usuario.address || '-'
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
      { wch: 30 },  // Email
      { wch: 20 },  // Rol
      { wch: 12 },  // Estado
      { wch: 15 },  // Teléfono
      { wch: 30 }   // Dirección
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    // Crear segunda hoja con estadísticas
    const estadisticas = [
      { 'Estadística': 'Total de usuarios', 'Valor': usuarios.length },
      { 'Estadística': 'Usuarios activos', 'Valor': usuarios.filter(u => u.active).length },
      { 'Estadística': 'Usuarios inactivos', 'Valor': usuarios.filter(u => !u.active).length },
      { 'Estadística': 'Fecha de generación', 'Valor': new Date().toLocaleDateString('es-PE') }
    ];

    // Estadísticas por rol
    const estadisticasPorRol: { [key: string]: number } = {};
    usuarios.forEach(usuario => {
      const rol = usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].rolName : 'Sin rol';
      estadisticasPorRol[rol] = (estadisticasPorRol[rol] || 0) + 1;
    });

    Object.entries(estadisticasPorRol).forEach(([rol, cantidad]) => {
      estadisticas.push({
        'Estadística': `Usuarios con rol: ${rol}`,
        'Valor': cantidad
      });
    });

    const worksheetStats = XLSX.utils.json_to_sheet(estadisticas);
    worksheetStats['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheetStats, 'Estadísticas');

    // Crear tercera hoja solo con usuarios activos
    const usuariosActivos = usuarios.filter(u => u.active);
    if (usuariosActivos.length > 0) {
      const datosActivos = usuariosActivos.map(usuario => ({
        'ID': usuario.id,
        'DNI': usuario.document || '-',
        'Nombre Completo': `${usuario.name || ''} ${usuario.lastname || ''}`.trim(),
        'Email': usuario.email || '-',
        'Rol': usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].rolName : 'Sin rol',
        'Teléfono': usuario.phone || '-'
      }));

      const worksheetActivos = XLSX.utils.json_to_sheet(datosActivos);
      worksheetActivos['!cols'] = [
        { wch: 8 }, { wch: 15 }, { wch: 30 }, 
        { wch: 30 }, { wch: 20 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheetActivos, 'Usuarios Activos');
    }

    // Cerrar indicador de carga
    swall.close();

    // Guardar el archivo
    const nombreArchivo = `usuarios_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
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
