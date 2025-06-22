import { Pedido } from './Pedido.models';
import { PedidoDetalle } from './PedidoDetalle.model';

export interface PedidoRequest {
  pedido: Pedido;
  detalles: PedidoDetalle[];
}
