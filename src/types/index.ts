export type OperationType = 
  | 'fideicomiso'
  | 'compraventa_escrow'
  | 'compraventa_directa'
  | 'reconocimiento_fideicomisario';

export const OPERATION_LABELS: Record<OperationType, string> = {
  fideicomiso: 'Constitución de Fideicomiso',
  compraventa_escrow: 'Compraventa con Escrow',
  compraventa_directa: 'Compraventa Directa',
  reconocimiento_fideicomisario: 'Reconocimiento de Fideicomisario',
};

export type DocCategory = 'comprador' | 'vendedor' | 'propiedad' | 'transaccion';

export const CATEGORY_LABELS: Record<DocCategory, string> = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  propiedad: 'Propiedad',
  transaccion: 'Transacción',
};

export const CATEGORY_ICONS: Record<DocCategory, string> = {
  comprador: '👤',
  vendedor: '🏠',
  propiedad: '📐',
  transaccion: '📝',
};

export interface Operation {
  id: string;
  nombre: string;
  tipo: OperationType;
  pin: string;
  fecha_creacion: string;
  status: 'activa' | 'cerrada';
  imagen_fondo?: string;
}

export interface Document {
  id: string;
  operacion_id: string;
  categoria: DocCategory;
  nombre_doc: string;
  requerido: boolean;
  archivo_url: string | null;
  subido_por: string | null;
  fecha_subida: string | null;
}

export interface Template {
  id: string;
  tipo_operacion: OperationType;
  categoria: DocCategory;
  nombre_doc: string;
  requerido: boolean;
}

export const FIDEICOMISO_TEMPLATES: Omit<Template, 'id'>[] = [
  // Comprador
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'Pasaporte vigente', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'Forma migratoria (FM/visa/residencia)', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'Comprobante domicilio extranjero (<1 mes)', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'KYC firmado', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'Acta matrimonio (si aplica)', requerido: false },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'Comprobante de fondos', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: 'Designación de fideicomisarios sustitutos', requerido: true },
  // Vendedor
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'INE/Pasaporte', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'CURP', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'RFC / Cédula Fiscal', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'Comprobante domicilio (<1 mes)', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'Escritura de propiedad', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'Predial al corriente', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: 'Avalúo', requerido: true },
  // Propiedad
  { tipo_operacion: 'fideicomiso', categoria: 'propiedad', nombre_doc: 'Reglamento de condominio', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'propiedad', nombre_doc: 'Catastral', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'propiedad', nombre_doc: 'Planos', requerido: true },
  // Transacción
  { tipo_operacion: 'fideicomiso', categoria: 'transaccion', nombre_doc: 'Oferta firmada', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'transaccion', nombre_doc: 'Escrow agreement', requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'transaccion', nombre_doc: 'Proyecto de escritura', requerido: true },
];
