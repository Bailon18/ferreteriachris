import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/core/services/cliente.service';
import swall from 'sweetalert2';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClienteListComponent implements OnInit {
  clientes: any[] = [];
  totalItems: number = 0;
  pageSize: number = 5;
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
}
 