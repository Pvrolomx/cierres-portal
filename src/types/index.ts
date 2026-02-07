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

export type PartyRole = 'comprador' | 'vendedor';
export type PartyType = 'fisica' | 'moral';

export const PARTY_ROLE_LABELS: Record<PartyRole, { es: string; en: string }> = {
  comprador: { es: 'Comprador', en: 'Buyer' },
  vendedor: { es: 'Vendedor', en: 'Seller' },
};

export const PARTY_TYPE_LABELS: Record<PartyType, { es: string; en: string }> = {
  fisica: { es: 'Persona Física', en: 'Individual' },
  moral: { es: 'Persona Moral', en: 'Legal Entity' },
};

export type DocCategory = 'cierre' | 'notario' | 'escrow';

export const CATEGORY_LABELS: Record<DocCategory, { es: string; en: string }> = {
  cierre: { es: 'Documentos de Cierre', en: 'Closing Documents' },
  notario: { es: 'Notaría 10 PV', en: 'Notaría 10 PV' },
  escrow: { es: 'Escrow', en: 'Escrow' },
};

export const CATEGORY_ICONS: Record<DocCategory, string> = {
  cierre: '📐',
  notario: '⚖️',
  escrow: '🔐',
};

export type Lang = 'es' | 'en';

export interface Party {
  id: string;
  nombre: string;
  rol: PartyRole;
  tipo: PartyType;
}

export interface Operation {
  id: string;
  nombre: string;
  tipo: OperationType;
  pin: string;
  fecha_creacion: string;
  status: 'activa' | 'cerrada';
  imagen_fondo?: string;
  partes: Party[];
}

export interface Document {
  id: string;
  operacion_id: string;
  party_id: string | null;       // null = doc general (cierre/notario/escrow)
  categoria: DocCategory | null;  // null = doc de parte
  nombre_doc: { es: string; en: string };
  requerido: boolean;
  archivo_url: string | null;
  subido_por: string | null;
  fecha_subida: string | null;
}

// Docs for Persona Física
export const PERSONA_FISICA_DOCS: { nombre: { es: string; en: string }; requerido: boolean }[] = [
  { nombre: { es: 'Pasaporte vigente / INE', en: 'Valid passport / ID' }, requerido: true },
  { nombre: { es: 'Forma migratoria (FM/visa/residencia)', en: 'Immigration form (FM/visa/residency)' }, requerido: false },
  { nombre: { es: 'CURP', en: 'CURP' }, requerido: true },
  { nombre: { es: 'RFC / Cédula Fiscal', en: 'RFC / Tax ID' }, requerido: true },
  { nombre: { es: 'Comprobante domicilio (<1 mes)', en: 'Address proof (<1 month)' }, requerido: true },
  { nombre: { es: 'Acta de Matrimonio', en: 'Marriage Certificate' }, requerido: false },
  { nombre: { es: 'Acta de Nacimiento', en: 'Birth Certificate' }, requerido: false },
  { nombre: { es: 'KYC firmado', en: 'Signed KYC' }, requerido: true },
  { nombre: { es: 'Forma de pago', en: 'Payment method' }, requerido: false },
  { nombre: { es: 'Designación de fideicomisarios sustitutos', en: 'Substitute trustee designation' }, requerido: false },
  { nombre: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
];

// Docs for Persona Moral — Empresa
export const PERSONA_MORAL_EMPRESA_DOCS: { nombre: { es: string; en: string }; requerido: boolean }[] = [
  { nombre: { es: 'Acta Constitutiva', en: 'Articles of Incorporation' }, requerido: true },
  { nombre: { es: 'RFC de la empresa', en: 'Company Tax ID' }, requerido: true },
  { nombre: { es: 'Comprobante domicilio fiscal', en: 'Fiscal address proof' }, requerido: true },
  { nombre: { es: 'Poder Notarial del apoderado', en: 'Notarized Power of Attorney' }, requerido: true },
  { nombre: { es: 'KYC firmado', en: 'Signed KYC' }, requerido: true },
  { nombre: { es: 'Cédula Fiscal', en: 'Tax Certificate' }, requerido: true },
  { nombre: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
];

// Docs for Persona Moral — Apoderado (persona física)
export const PERSONA_MORAL_APODERADO_DOCS: { nombre: { es: string; en: string }; requerido: boolean }[] = [
  { nombre: { es: 'Pasaporte vigente / INE', en: 'Valid passport / ID' }, requerido: true },
  { nombre: { es: 'CURP', en: 'CURP' }, requerido: true },
  { nombre: { es: 'RFC / Cédula Fiscal', en: 'RFC / Tax ID' }, requerido: true },
  { nombre: { es: 'Comprobante domicilio (<1 mes)', en: 'Address proof (<1 month)' }, requerido: true },
  { nombre: { es: 'KYC firmado', en: 'Signed KYC' }, requerido: true },
  { nombre: { es: 'Acta de Matrimonio', en: 'Marriage Certificate' }, requerido: false },
  { nombre: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
];

// General docs (not tied to parties)
export const CIERRE_DOCS: { nombre: { es: string; en: string }; requerido: boolean }[] = [
  { nombre: { es: 'Escritura/Fideicomiso', en: 'Deed/Trust' }, requerido: true },
  { nombre: { es: 'Régimen de Condominio', en: 'Condo Regime' }, requerido: true },
  { nombre: { es: 'Certificado de Libertad de Gravamen', en: 'Lien-Free Certificate' }, requerido: true },
  { nombre: { es: 'Avalúo', en: 'Appraisal' }, requerido: true },
  { nombre: { es: 'Certificado de No Adeudo de Predial', en: 'Property Tax Clearance' }, requerido: true },
  { nombre: { es: 'Constancia de No Adeudo de Cuotas Condominales', en: 'Condo Fees Clearance' }, requerido: true },
  { nombre: { es: 'Permiso de Relaciones Exteriores', en: 'Foreign Affairs Permit' }, requerido: true },
  { nombre: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
];

export const NOTARIO_DOCS: { nombre: { es: string; en: string }; requerido: boolean }[] = [
  { nombre: { es: 'Gastos de cierre', en: 'Closing costs' }, requerido: true },
  { nombre: { es: 'Proyecto de Escritura', en: 'Draft Deed' }, requerido: true },
  { nombre: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
];

export const ESCROW_DOCS: { nombre: { es: string; en: string }; requerido: boolean }[] = [
  { nombre: { es: 'Oferta firmada', en: 'Signed offer' }, requerido: true },
  { nombre: { es: 'Escrow agreement', en: 'Escrow agreement' }, requerido: true },
  { nombre: { es: 'KYC Vendedor', en: 'Seller KYC' }, requerido: true },
  { nombre: { es: "ID's Vendedor", en: "Seller ID's" }, requerido: true },
  { nombre: { es: 'KYC Comprador', en: 'Buyer KYC' }, requerido: true },
  { nombre: { es: "ID's Comprador", en: "Buyer ID's" }, requerido: true },
  { nombre: { es: 'Carta Distribución', en: 'Distribution Letter' }, requerido: true },
  { nombre: { es: 'Documentos adicionales', en: 'Additional documents' }, requerido: false },
];
