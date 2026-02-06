import {
  Operation, Document, Party,
  PERSONA_FISICA_DOCS, PERSONA_MORAL_EMPRESA_DOCS, PERSONA_MORAL_APODERADO_DOCS,
  CIERRE_DOCS, NOTARIO_DOCS, ESCROW_DOCS,
  DocCategory,
} from '@/types';

// Helper to generate docs for a party
function generatePartyDocs(operacionId: string, party: Party, startIdx: number): Document[] {
  const docs: Document[] = [];
  let idx = startIdx;

  if (party.tipo === 'fisica') {
    for (const d of PERSONA_FISICA_DOCS) {
      docs.push({
        id: `doc-${operacionId}-${party.id}-${idx++}`,
        operacion_id: operacionId,
        party_id: party.id,
        categoria: null,
        nombre_doc: d.nombre,
        requerido: d.requerido,
        archivo_url: null,
        subido_por: null,
        fecha_subida: null,
      });
    }
  } else {
    // Persona Moral: empresa docs
    for (const d of PERSONA_MORAL_EMPRESA_DOCS) {
      docs.push({
        id: `doc-${operacionId}-${party.id}-emp-${idx++}`,
        operacion_id: operacionId,
        party_id: party.id,
        categoria: null,
        nombre_doc: d.nombre,
        requerido: d.requerido,
        archivo_url: null,
        subido_por: null,
        fecha_subida: null,
      });
    }
    // Persona Moral: apoderado docs
    for (const d of PERSONA_MORAL_APODERADO_DOCS) {
      docs.push({
        id: `doc-${operacionId}-${party.id}-apo-${idx++}`,
        operacion_id: operacionId,
        party_id: party.id,
        categoria: null,
        nombre_doc: { es: `(Apoderado) ${d.nombre.es}`, en: `(Attorney) ${d.nombre.en}` },
        requerido: d.requerido,
        archivo_url: null,
        subido_por: null,
        fecha_subida: null,
      });
    }
  }
  return docs;
}

function generateGeneralDocs(operacionId: string, categoria: DocCategory, templates: { nombre: { es: string; en: string }; requerido: boolean }[], startIdx: number): Document[] {
  return templates.map((d, i) => ({
    id: `doc-${operacionId}-${categoria}-${startIdx + i}`,
    operacion_id: operacionId,
    party_id: null,
    categoria,
    nombre_doc: d.nombre,
    requerido: d.requerido,
    archivo_url: null,
    subido_por: null,
    fecha_subida: null,
  }));
}

// Example: Coral and Sandy with dynamic parties
const CORAL_SANDY_PARTIES: Party[] = [
  { id: 'p1', nombre: 'Coral', rol: 'comprador', tipo: 'fisica' },
  { id: 'p2', nombre: 'Sandy', rol: 'comprador', tipo: 'fisica' },
  { id: 'p3', nombre: 'Desarrollos Costa SA de CV', rol: 'vendedor', tipo: 'moral' },
];

const INITIAL_OPERATIONS: Operation[] = [
  {
    id: 'op-001',
    nombre: 'Coral and Sandy',
    tipo: 'fideicomiso',
    pin: '143414',
    fecha_creacion: '2026-02-06',
    status: 'activa',
    imagen_fondo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    partes: CORAL_SANDY_PARTIES,
  },
];

// Generate all documents
function buildAllDocs(): Document[] {
  const allDocs: Document[] = [];
  let idx = 0;

  for (const op of INITIAL_OPERATIONS) {
    // Party docs
    for (const party of op.partes) {
      const partyDocs = generatePartyDocs(op.id, party, idx);
      allDocs.push(...partyDocs);
      idx += partyDocs.length;
    }
    // General docs
    allDocs.push(...generateGeneralDocs(op.id, 'cierre', CIERRE_DOCS, idx)); idx += CIERRE_DOCS.length;
    allDocs.push(...generateGeneralDocs(op.id, 'notario', NOTARIO_DOCS, idx)); idx += NOTARIO_DOCS.length;
    allDocs.push(...generateGeneralDocs(op.id, 'escrow', ESCROW_DOCS, idx)); idx += ESCROW_DOCS.length;
  }
  return allDocs;
}

const operations = [...INITIAL_OPERATIONS];
const documents = buildAllDocs();

export const ADMIN_PIN = '143414';

export function getOperations(): Operation[] {
  return operations;
}

export function findOperationByPin(pin: string): Operation | undefined {
  return operations.find((o) => o.pin.toUpperCase() === pin.toUpperCase());
}

export function isAdminPin(pin: string): boolean {
  return pin.toUpperCase() === ADMIN_PIN.toUpperCase();
}

export function getPartyDocs(operationId: string, partyId: string): Document[] {
  return documents.filter((d) => d.operacion_id === operationId && d.party_id === partyId);
}

export function getGeneralDocs(operationId: string, categoria: DocCategory): Document[] {
  return documents.filter((d) => d.operacion_id === operationId && d.categoria === categoria && d.party_id === null);
}

export function getAllDocs(operationId: string): Document[] {
  return documents.filter((d) => d.operacion_id === operationId);
}

export function getProgress(operationId: string): { total: number; completed: number; percent: number } {
  const docs = documents.filter((d) => d.operacion_id === operationId && d.requerido);
  const completed = docs.filter((d) => d.archivo_url !== null);
  const percent = docs.length > 0 ? Math.round((completed.length / docs.length) * 100) : 0;
  return { total: docs.length, completed: completed.length, percent };
}

export function getPartyProgress(operationId: string, partyId: string): { total: number; completed: number; percent: number } {
  const docs = documents.filter((d) => d.operacion_id === operationId && d.party_id === partyId && d.requerido);
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
