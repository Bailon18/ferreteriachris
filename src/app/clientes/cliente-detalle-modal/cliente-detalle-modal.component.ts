import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/core/services/cliente.service';

@Component({
  selector: 'app-cliente-detalle-modal',
  templateUrl: './cliente-detalle-modal.component.html',
  styleUrls: ['./cliente-detalle-modal.component.css']
})
export class ClienteDetalleModalComponent implements OnInit {
  @Input() clienteId: number | null = null;
  @Output() cerrar = new EventEmitter<void>();

  cliente: any = null;
  cargando = true;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    if (this.clienteId) {
      this.clienteService.getClientePorId(this.clienteId).subscribe({
        next: (res) => {
          // Si el backend devuelve { ...cliente } o { value: cliente }
          this.cliente = res?.value || res;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        }
      });
    }
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}
