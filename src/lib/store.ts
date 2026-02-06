import { Operation, Document, FIDEICOMISO_TEMPLATES, DocCategory } from '@/types';

// Operations with background images and alfanumeric 6-digit PINs
const INITIAL_OPERATIONS: Operation[] = [
  {
    id: 'op-001',
    nombre: 'Coral and Sandy',
    tipo: 'fideicomiso',
    pin: 'CS2026',
    fecha_creacion: '2026-02-06',
    status: 'activa',
    imagen_fondo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
  },
];

const INITIAL_DOCUMENTS: Document[] = FIDEICOMISO_TEMPLATES.map((t, i) => ({
  id: `doc-${String(i + 1).padStart(3, '0')}`,
  operacion_id: 'op-001',
  categoria: t.categoria,
  nombre_doc: t.nombre_doc,
  requerido: t.requerido,
  archivo_url: null,
  subido_por: null,
  fecha_subida: null,
}));

const operations = [...INITIAL_OPERATIONS];
const documents = [...INITIAL_DOCUMENTS];

// Admin PIN - alfanumeric 6 digits
export const ADMIN_PIN = 'ADM926';

export function getOperations(): Operation[] {
  return operations;
}

export function getOperation(id: string): Operation | undefined {
  return operations.find((op) => op.id === id);
}

export function findOperationByPin(pin: string): Operation | undefined {
  return operations.find((o) => o.pin.toUpperCase() === pin.toUpperCase());
}

export function isAdminPin(pin: string): boolean {
  return pin.toUpperCase() === ADMIN_PIN.toUpperCase();
}

export function verifyPin(operationId: string, pin: string): boolean {
  const op = operations.find((o) => o.id === operationId);
  return op?.pin.toUpperCase() === pin.toUpperCase();
}

export function getDocuments(operationId: string): Document[] {
  return documents.filter((d) => d.operacion_id === operationId);
}

export function getDocumentsByCategory(operationId: string, category: DocCategory): Document[] {
  return documents.filter((d) => d.operacion_id === operationId && d.categoria === category);
}

export function getProgress(operationId: string): { total: number; completed: number; percent: number } {
  const docs = documents.filter((d) => d.operacion_id === operationId && d.requerido);
  const completed = docs.filter((d) => d.archivo_url !== null);
  const percent = docs.length > 0 ? Math.round((completed.length / docs.length) * 100) : 0;
  return { total: docs.length, completed: completed.length, percent };
}

export function markDocumentUploaded(docId: string, url: string): void {
  const doc = documents.find((d) => d.id === docId);
  if (doc) {
    doc.archivo_url = url;
    doc.subido_por = 'usuario';
    doc.fecha_subida = new Date().toISOString();
  }
}
