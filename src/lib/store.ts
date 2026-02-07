import {
  Operation, Document, Party, DocCategory,
  PERSONA_FISICA_DOCS, PERSONA_MORAL_EMPRESA_DOCS, PERSONA_MORAL_APODERADO_DOCS,
  CIERRE_DOCS, NOTARIO_DOCS, ESCROW_DOCS,
} from '@/types';
import { supabase } from './supabase';

// ─── Supabase-backed store ───

export const ADMIN_PIN = '143414';

export function isAdminPin(pin: string): boolean {
  return pin.toUpperCase() === ADMIN_PIN.toUpperCase();
}

// Fetch all operations
export async function getOperations(): Promise<Operation[]> {
  if (!supabase) return [];
  const { data: ops } = await supabase.from('operaciones').select('*').order('created_at', { ascending: false });
  if (!ops) return [];

  // Fetch parties for each operation
  const result: Operation[] = [];
  for (const op of ops) {
    const { data: partes } = await supabase.from('partes').select('*').eq('operacion_id', op.id);
    result.push({
      id: op.id,
      nombre: op.nombre,
      tipo: op.tipo,
      pin: op.pin,
      fecha_creacion: op.created_at,
      status: op.status,
      imagen_fondo: op.imagen_fondo,
      partes: (partes || []).map((p: { id: string; nombre: string; rol: string; tipo: string }) => ({
        id: p.id,
        nombre: p.nombre,
        rol: p.rol as Party['rol'],
        tipo: p.tipo as Party['tipo'],
      })),
    });
  }
  return result;
}

export async function findOperationByPin(pin: string): Promise<Operation | undefined> {
  if (!supabase) return undefined;
  const { data: ops } = await supabase.from('operaciones').select('*').ilike('pin', pin);
  if (!ops || ops.length === 0) return undefined;
  const op = ops[0];
  const { data: partes } = await supabase.from('partes').select('*').eq('operacion_id', op.id);
  return {
    id: op.id,
    nombre: op.nombre,
    tipo: op.tipo,
    pin: op.pin,
    fecha_creacion: op.created_at,
    status: op.status,
    imagen_fondo: op.imagen_fondo,
    partes: (partes || []).map((p: { id: string; nombre: string; rol: string; tipo: string }) => ({
      id: p.id, nombre: p.nombre, rol: p.rol as Party['rol'], tipo: p.tipo as Party['tipo'],
    })),
  };
}

// Generate docs for a party from templates (used when no docs exist in DB yet)
function generatePartyDocTemplates(party: Party): { es: string; en: string; requerido: boolean }[] {
  if (party.tipo === 'fisica') {
    return PERSONA_FISICA_DOCS.map(d => ({ es: d.nombre.es, en: d.nombre.en, requerido: d.requerido }));
  } else {
    const empresa = PERSONA_MORAL_EMPRESA_DOCS.map(d => ({ es: d.nombre.es, en: d.nombre.en, requerido: d.requerido }));
    const apoderado = PERSONA_MORAL_APODERADO_DOCS.map(d => ({ es: `(Apoderado) ${d.nombre.es}`, en: `(Attorney) ${d.nombre.en}`, requerido: d.requerido }));
    return [...empresa, ...apoderado];
  }
}

function generalDocTemplates(categoria: DocCategory): { es: string; en: string; requerido: boolean }[] {
  const map = { cierre: CIERRE_DOCS, notario: NOTARIO_DOCS, escrow: ESCROW_DOCS };
  return (map[categoria] || []).map(d => ({ es: d.nombre.es, en: d.nombre.en, requerido: d.requerido }));
}

// Ensure docs exist in DB for an operation (auto-generate from templates if missing)
export async function ensureDocs(operation: Operation): Promise<void> {
  if (!supabase) return;
  const { data: existing } = await supabase.from('documentos').select('id').eq('operacion_id', operation.id).limit(1);
  if (existing && existing.length > 0) return; // docs already exist

  const inserts: { operacion_id: string; party_id: string | null; categoria: string | null; nombre_doc_es: string; nombre_doc_en: string; requerido: boolean }[] = [];

  // Party docs
  for (const party of operation.partes) {
    const templates = generatePartyDocTemplates(party);
    for (const t of templates) {
      inserts.push({ operacion_id: operation.id, party_id: party.id, categoria: null, nombre_doc_es: t.es, nombre_doc_en: t.en, requerido: t.requerido });
    }
  }

  // General docs
  const cats: DocCategory[] = ['cierre', 'notario', 'escrow'];
  for (const cat of cats) {
    const templates = generalDocTemplates(cat);
    for (const t of templates) {
      inserts.push({ operacion_id: operation.id, party_id: null, categoria: cat, nombre_doc_es: t.es, nombre_doc_en: t.en, requerido: t.requerido });
    }
  }

  await supabase.from('documentos').insert(inserts);
}

export async function getPartyDocs(operationId: string, partyId: string): Promise<Document[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('documentos').select('*').eq('operacion_id', operationId).eq('party_id', partyId);
  return (data || []).map(mapDoc);
}

export async function getGeneralDocs(operationId: string, categoria: DocCategory): Promise<Document[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('documentos').select('*').eq('operacion_id', operationId).eq('categoria', categoria).is('party_id', null);
  return (data || []).map(mapDoc);
}

export async function getProgress(operationId: string): Promise<{ total: number; completed: number; percent: number }> {
  if (!supabase) return { total: 0, completed: 0, percent: 0 };
  const { data } = await supabase.from('documentos').select('*').eq('operacion_id', operationId).eq('requerido', true);
  const docs = data || [];
  const completed = docs.filter((d: { archivo_url: string | null }) => d.archivo_url !== null).length;
  const percent = docs.length > 0 ? Math.round((completed / docs.length) * 100) : 0;
  return { total: docs.length, completed, percent };
}

export async function getPartyProgress(operationId: string, partyId: string): Promise<{ total: number; completed: number; percent: number }> {
  if (!supabase) return { total: 0, completed: 0, percent: 0 };
  const { data } = await supabase.from('documentos').select('*').eq('operacion_id', operationId).eq('party_id', partyId).eq('requerido', true);
  const docs = data || [];
  const completed = docs.filter((d: { archivo_url: string | null }) => d.archivo_url !== null).length;
  const percent = docs.length > 0 ? Math.round((completed / docs.length) * 100) : 0;
  return { total: docs.length, completed, percent };
}

export async function uploadDocument(docId: string, file: File): Promise<string | null> {
  if (!supabase) return null;
  const path = `${docId}/${file.name}`;
  const { error } = await supabase.storage.from('cierres-docs').upload(path, file, { upsert: true });
  if (error) { console.error('Upload error:', error); return null; }

  // Store the storage path (not a public URL) since the bucket is private
  await supabase.from('documentos').update({
    archivo_url: path,
    subido_por: 'usuario',
    fecha_subida: new Date().toISOString(),
  }).eq('id', docId);

  return path;
}

// Generate a temporary signed URL for viewing files from the private bucket
export async function getSignedUrl(storagePath: string): Promise<string | null> {
  if (!supabase || !storagePath) return null;
  const { data, error } = await supabase.storage.from('cierres-docs').createSignedUrl(storagePath, 3600);
  if (error) { console.error('Signed URL error:', error); return null; }
  return data.signedUrl;
}

function mapDoc(d: { id: string; operacion_id: string; party_id: string | null; categoria: string | null; nombre_doc_es: string; nombre_doc_en: string; requerido: boolean; archivo_url: string | null; subido_por: string | null; fecha_subida: string | null }): Document {
  return {
    id: d.id,
    operacion_id: d.operacion_id,
    party_id: d.party_id,
    categoria: d.categoria as DocCategory | null,
    nombre_doc: { es: d.nombre_doc_es, en: d.nombre_doc_en },
    requerido: d.requerido,
    archivo_url: d.archivo_url,
    subido_por: d.subido_por,
    fecha_subida: d.fecha_subida,
  };
}
