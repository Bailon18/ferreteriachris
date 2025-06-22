// ferreteria-app/src/app/productos/cliente/producto-list-cliente/data.ts

export const COLORES_UNICOS: string[] = [
    'Acuarela', 'Alabastro', 'Albaricoque', 'Almendra', 'Amarillo', 'Amarillo Cromo', 'Amarillo Limón', 'Amarillo MD',
    'Amarillo Ocre', 'Amarillo Thorner', 'Amarillo medio', 'Amarillo tropical', 'Aqua', 'Aquamarina', 'Arena', 'Atlantis',
    'Azul', 'Azul Acero', 'Azul Atlántico', 'Azul Calipso', 'Azul Honda', 'Azul Marea', 'Azul Nautica', 'Azul Oriente',
    'Azul Thoner', 'Azul Ultramar', 'Barbie', 'Bayo', 'Beige', 'Bengala', 'Blanco', 'Blanco Humo', 'Blanco Ostra',
    'Cafe Paris', 'Capuchino', 'Caramelo', 'Castaño', 'Celeste', 'Celeste Soñado', 'Champagne', 'Citrón', 'Colonial',
    'Cornalina', 'Crema', 'Damasco', 'Delicia', 'Dorado', 'Fascinación', 'Fantasia', 'Flamenco', 'Frambuesa Silvestre',
    'Fucsia Thoner', 'Girasol', 'Gold Thorner', 'Granito', 'Gris', 'Gris Claro', 'Gris Horizonte', 'Gris Perla',
    'Gris Plata', 'Guinda', 'Guinda Thorner', 'Hierba Buena', 'Lila', 'Maíz', 'Magenta', 'Mango', 'Mar Caribe',
    'Maracuyá', 'Marfil', 'Marfil congo', 'Melocotón', 'Melón', 'Miel', 'Naranja', 'Naranja Coral', 'Naranja Dulce',
    'Naranja Solar', 'Negro', 'No Color', 'Nogal', 'Palo Rosa', 'Proteccion Solar', 'R.Colonial', 'Rojo', 'Rojo Bermellon',
    'Rojo Honda', 'Rojo Oxido', 'Rojo Rubi', 'Rojo Sensual', 'Rojo Teja', 'Rosa Bebe', 'Rosa Tentación', 'Sábila',
    'Salmon', 'Spondylus', 'Sunset', 'Sunset Acento', 'Tabaco', 'Terocal', 'Trasparente', 'Tuna', 'Turqueza', 'Turquesa',
    'Verde', 'Verde Cromo', 'Verde Esmeralda', 'Verde Glamour', 'Verde Jamaica', 'Verde Lima', 'Verde Luz', 'Verde Manzana',
    'Verde Motocar', 'Verde Nilo', 'Verde Pera', 'Verde Perla', 'Verde Tenis', 'Verde Thoner', 'Violeta', 'Violeta activa'
  ];
  
  export interface Marca {
    id: number;
    nombre: string;
  }
  
  export const MARCAS: Marca[] = [
    { id: 1, nombre: 'Anypsa' },
    { id: 2, nombre: 'CPP' },
    { id: 3, nombre: 'Losaro' },
    { id: 4, nombre: 'ISSA' },
    { id: 5, nombre: 'Multicolor' },
    { id: 6, nombre: 'Vencedor' },
    { id: 7, nombre: 'Jhomeron' },
    { id: 8, nombre: 'Diamante' },
    { id: 9, nombre: 'T-Color' },
    { id: 10, nombre: 'Durón' },
    { id: 11, nombre: 'CPP Pato' },
    { id: 12, nombre: 'Anypsa Maestro' },
    { id: 13, nombre: 'ISSA - DURON' },
    { id: 14, nombre: 'Anypsa X3 Gloss' },
    { id: 15, nombre: 'Duron Mass Gloss' },
    { id: 16, nombre: 'Anypsa Satinlast' },
    { id: 17, nombre: 'Jhomeron Satinado' },
    { id: 18, nombre: 'Anypsa Duco' },
    { id: 19, nombre: 'Paracas Duco' },
    { id: 20, nombre: 'ISSA Duco' },
    { id: 21, nombre: 'Decor Tintes Anypsa' },
    { id: 22, nombre: 'Volcano' },
    { id: 23, nombre: 'Anypsa X10' },
    { id: 24, nombre: 'Anypsa x20' },
    { id: 25, nombre: 'Anypsa X4' },
    { id: 26, nombre: 'Anypsa X40' },
    { id: 27, nombre: 'Anypsa x4 Masilla' },
    { id: 28, nombre: 'Anypsa Industrial' },
    { id: 29, nombre: 'Anypsa Kristal' },
    { id: 30, nombre: 'Paracas Kristal' },
    { id: 31, nombre: 'Paracas' },
    { id: 32, nombre: 'Majestad' },
    { id: 33, nombre: 'Tekno' },
    { id: 34, nombre: 'Glucom (Embase azul)' },
    { id: 35, nombre: 'Glucom (Embase Negro)' }
  ].sort((a, b) => a.nombre.localeCompare(b.nombre));
  
  export interface TipoPintura {
    id: number;
    nombre: string;
  }
  
  export const TIPOS_PINTURA: TipoPintura[] = [
    { id: 1, nombre: 'Pintura para pared al agua' },
    { id: 2, nombre: 'Sellador de pared antisalitre' },
    { id: 3, nombre: 'Sellador de pared' },
    { id: 4, nombre: 'Esmalte Sintetico' },
    { id: 5, nombre: 'Esmalte Sintetico Alto Brillo (Alta calidad)' },
    { id: 6, nombre: 'Esmalte Sintetico (economico)' },
    { id: 7, nombre: 'Gloss Secado Rápido' },
    { id: 8, nombre: 'Satinado con acabado brillante' },
    { id: 9, nombre: 'Laca Piroxilina Secado Rápido' },
    { id: 10, nombre: 'Tinte para el teñido de madera' },
    { id: 11, nombre: 'Anticorrosiva para superficies metálicas.' },
    { id: 12, nombre: 'Base antocorrosiva' },
    { id: 13, nombre: 'Base selladora y tapa poros para acabados en madera' },
    { id: 14, nombre: 'Quitar brillo al gloss' },
    { id: 15, nombre: 'Para tapar huecos' },
    { id: 16, nombre: 'Acabado martillado' },
    { id: 17, nombre: 'Para pinturas Duco Protección y brillo' },
    { id: 18, nombre: 'Protección de madera' },
    { id: 19, nombre: 'Proteccion Solar' },
    { id: 20, nombre: 'Esmalte sin brillo' },
    { id: 21, nombre: 'Automotriz' },
    { id: 22, nombre: 'Proección' },
    { id: 23, nombre: 'Laca para acabado' },
    { id: 24, nombre: 'Preservante para madera' },
    { id: 25, nombre: 'Barniz poliuretano' },
    { id: 26, nombre: 'Los tres DD' },
    { id: 27, nombre: 'Impermeabilizante para toche' },
    { id: 28, nombre: 'Terocal' },
    { id: 29, nombre: 'Quita todo tipo de pintura' },
    { id: 30, nombre: 'Sellador para pared' },
    { id: 31, nombre: 'Pegado Veloz' },
    { id: 32, nombre: 'Cola sintetica Ultra Rapida' },
    { id: 33, nombre: 'Cola Clasica' },
    { id: 34, nombre: 'Cola Extra' },
    { id: 35, nombre: 'Pintura para pared' },
    { id: 36, nombre: 'Pintura para pared con brillo' },
    { id: 37, nombre: 'Pintura para pared acabado Mate' }
  ].sort((a, b) => a.nombre.localeCompare(b.nombre));