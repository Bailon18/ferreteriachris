export interface Marca {
  id: number;
  nombre: string;
  estaActivo: boolean;
}

export interface TipoPintura {
  id: number;
  nombre: string;
  descripcion: string;
  estaActivo: boolean;
}

export interface Producto {
  id: number;
  marca: Marca;
  tipoPintura: TipoPintura;
  nombre: string;
  color: string;
  descripcion: string;
  foto: string;
  precioCompra: number;
  precioVentaGalon: number;
  permiteGranel: boolean;
  precioMedioGalon: number;
  precioCuartoGalon: number;
  precioOctavoGalon: number;
  precioDieciseisavoGalon: number;
  precioTreintaidosavoGalon: number;
  stockTotal: number;
  stockMinimo: number;
  cantidadCerrados: number;
  cantidadAbiertos: number;
  estante: string;
  fila: string;
  area: string;
  estaActivo: boolean;
  fechaCreacion?: string; // ISO string
  fechaActualizacion?: string; // ISO string
}
