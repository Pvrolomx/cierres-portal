export type OperationType = 
  | 'fideicomiso'
  | 'compraventa_escrow'
  | 'compraventa_directa'
  | 'reconocimiento_fideicomisario';

export const OPERATION_LABELS: Record<OperationType, { es: string; en: string }> = {
  fideicomiso: { es: 'Constitución de Fideicomiso', en: 'Trust Constitution' },
  compraventa_escrow: { es: 'Compraventa con Escrow', en: 'Purchase with Escrow' },
  compraventa_directa: { es: 'Compraventa Directa', en: 'Direct Purchase' },
  reconocimiento_fideicomisario: { es: 'Reconocimiento de Fideicomisario', en: 'Trustee Recognition' },
};

export type DocCategory = 'comprador' | 'vendedor' | 'cierre' | 'notario' | 'escrow';

export const CATEGORY_LABELS: Record<DocCategory, { es: string; en: string }> = {
  comprador: { es: 'Comprador', en: 'Buyer' },
  vendedor: { es: 'Vendedor', en: 'Seller' },
  cierre: { es: 'Documentos de Cierre', en: 'Closing Documents' },
  notario: { es: 'Notario', en: 'Notary' },
  escrow: { es: 'Escrow', en: 'Escrow' },
};

export const CATEGORY_ICONS: Record<DocCategory, string> = {
  comprador: '👤',
  vendedor: '🏠',
  cierre: '📐',
  notario: '⚖️',
  escrow: '🔐',
};

export type Lang = 'es' | 'en';

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
  nombre_doc: { es: string; en: string };
  requerido: boolean;
  archivo_url: string | null;
  subido_por: string | null;
  fecha_subida: string | null;
}

export interface Template {
  id: string;
  tipo_operacion: OperationType;
  categoria: DocCategory;
  nombre_doc: { es: string; en: string };
  requerido: boolean;
}

export const FIDEICOMISO_TEMPLATES: Omit<Template, 'id'>[] = [
  // Comprador / Buyer
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'Pasaporte vigente', en: 'Valid passport' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'Forma migratoria (FM/visa/residencia)', en: 'Immigration form (FM/visa/residency)' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'Comprobante domicilio extranjero (<1 mes)', en: 'Foreign address proof (<1 month)' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'KYC firmado', en: 'Signed KYC' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'Acta matrimonio (si aplica)', en: 'Marriage certificate (if applicable)' }, requerido: false },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'Forma de pago', en: 'Payment method' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'comprador', nombre_doc: { es: 'Designación de fideicomisarios sustitutos', en: 'Substitute trustee designation' }, requerido: true },
  // Vendedor / Seller
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: { es: 'INE/Pasaporte', en: 'ID/Passport' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: { es: 'CURP', en: 'CURP' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: { es: 'RFC / Cédula Fiscal', en: 'RFC / Tax ID' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: { es: 'Comprobante domicilio (<1 mes)', en: 'Address proof (<1 month)' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: { es: 'Acta de Matrimonio', en: 'Marriage Certificate' }, requerido: false },
  { tipo_operacion: 'fideicomiso', categoria: 'vendedor', nombre_doc: { es: 'Acta de Nacimiento', en: 'Birth Certificate' }, requerido: true },
  // Documentos de Cierre / Closing Documents
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Escritura/Fideicomiso', en: 'Deed/Trust' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Régimen de Condominio', en: 'Condo Regime' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Certificado de Libertad de Gravamen', en: 'Lien-Free Certificate' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Avalúo', en: 'Appraisal' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Certificado de No Adeudo de Predial', en: 'Property Tax Clearance' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Certificado de No Adeudo de Agua', en: 'Water Bill Clearance' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'cierre', nombre_doc: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
  // Notario / Notary
  { tipo_operacion: 'fideicomiso', categoria: 'notario', nombre_doc: { es: 'Gastos de cierre', en: 'Closing costs' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'notario', nombre_doc: { es: 'Proyecto de Escritura', en: 'Draft Deed' }, requerido: true },
  // Escrow (antes Transacción)
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: 'Oferta firmada', en: 'Signed offer' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: 'Escrow agreement', en: 'Escrow agreement' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: 'KYC Vendedor', en: 'Seller KYC' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: "ID's Vendedor", en: "Seller ID's" }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: 'KYC Comprador', en: 'Buyer KYC' }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: "ID's Comprador", en: "Buyer ID's" }, requerido: true },
  { tipo_operacion: 'fideicomiso', categoria: 'escrow', nombre_doc: { es: 'Carta Distribución', en: 'Distribution Letter' }, requerido: true },
];
