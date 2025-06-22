import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import swall from 'sweetalert2';

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
}
