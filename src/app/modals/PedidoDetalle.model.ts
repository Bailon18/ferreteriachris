export interface PedidoDetalle {
  id?: number;
  producto: { id: number }; // O el modelo Producto si lo tienes
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
