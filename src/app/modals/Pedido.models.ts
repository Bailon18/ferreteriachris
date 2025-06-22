export interface Vendedor {
    id: number;
    name: string;
    lastname: string;
    // ...otros campos si los necesitas
  }



export interface Pedido {
  id?: number;
  cliente: { id: number };
  fechaPedido: string;
  fechaActualizacion: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  observaciones?: string;
  vendedor?: Vendedor;
}
