export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono: string;
  documentoIdentidad: string;
  direccion: string;
  fechaRegistro?: string;
  estaActivo?: boolean;
} 