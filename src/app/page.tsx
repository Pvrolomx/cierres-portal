"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import {
  Operation, OPERATION_LABELS, DocCategory, CATEGORY_LABELS, CATEGORY_ICONS,
  Document, Lang, Party, PARTY_ROLE_LABELS, PARTY_TYPE_LABELS,
} from "@/types";
import {
  getOperations, getProgress, findOperationByPin, isAdminPin,
  uploadDocument, getPartyDocs, getGeneralDocs, getPartyProgress, ensureDocs, getSignedUrl, deleteDocumentFile,
} from "@/lib/store";

const LangContext = createContext<{ lang: Lang; toggle: () => void }>({ lang: "es", toggle: () => {} });
function useLang() { return useContext(LangContext); }

const UI: Record<string, { es: string; en: string }> = {
  accessTitle: { es: "Acceso al Portal", en: "Portal Access" },
  accessDesc: { es: "Ingresa tu código de acceso para ver los documentos de tu operación", en: "Enter your access code to view your closing documents" },
  accessBtn: { es: "Acceder", en: "Access" },
  accessHelp: { es: "Contacta a tu asesor si no tienes tu código", en: "Contact your advisor if you don't have your code" },
  invalidPin: { es: "PIN no válido", en: "Invalid PIN" },
  exit: { es: "Salir", en: "Exit" },
  docs: { es: "Documentos", en: "Documents" },
  upload: { es: "Subir", en: "Upload" },
  view: { es: "Ver", en: "View" },
  optional: { es: "Opcional", en: "Optional" },
  adminTitle: { es: "Panel de Administración", en: "Admin Panel" },
  activeOps: { es: "operaciones activas", en: "active closings" },
  empresa: { es: "Empresa", en: "Company" },
  apoderado: { es: "Apoderado", en: "Attorney-in-fact" },
  loading: { es: "Cargando...", en: "Loading..." },
  uploading: { es: "Subiendo...", en: "Uploading..." },
};
function t(key: string, lang: Lang): string { return UI[key]?.[lang] || key; }

function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button onClick={toggle} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all text-gray-600">
      <span className={lang === "es" ? "font-bold text-gray-900" : ""}>ES</span>
      <span className="text-gray-300">|</span>
      <span className={lang === "en" ? "font-bold text-gray-900" : ""}>EN</span>
    </button>
  );
}

/* ─── PIN Entry ─── */
function PinEntry({ onAccess }: { onAccess: (op: Operation | "admin", alsoAdmin?: boolean) => void }) {
  const { lang } = useLang();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    const admin = isAdminPin(pin);
    const op = await findOperationByPin(pin);
    if (op) { onAccess(op, admin); }
    else if (admin) { onAccess("admin"); }
    else {
      setError(t("invalidPin", lang)); setShaking(true);
      setTimeout(() => setShaking(false), 500); setPin("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#1e3a5f] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t("accessTitle", lang)}</h2>
          <p className="text-gray-500 mt-2 text-sm">{t("accessDesc", lang)}</p>
        </div>
        <div className={shaking ? "animate-shake" : ""}>
          <input type="text" value={pin}
            onChange={(e) => { setPin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={lang === "es" ? "Código de acceso" : "Access code"} maxLength={6}
            className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 px-6 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none transition-all bg-white placeholder:tracking-normal placeholder:text-base placeholder:text-gray-300" autoFocus />
          {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
          <button onClick={handleSubmit} disabled={pin.length < 4 || loading}
            className="w-full mt-4 py-3.5 bg-[#1e3a5f] text-white rounded-xl font-medium text-sm disabled:opacity-30 hover:bg-[#2a4d7a] transition-all shadow-lg shadow-[#1e3a5f]/20">
            {loading ? t("loading", lang) : t("accessBtn", lang)}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">{t("accessHelp", lang)}</p>
      </div>
    </div>
  );
}

/* ─── Doc Row with real upload ─── */
function DocRow({ doc, onUpload, onDelete }: { doc: Document; onUpload: (id: string, file: File) => void; onDelete: (id: string, path: string) => void }) {
  const { lang } = useLang();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasFile = doc.archivo_url !== null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await onUpload(doc.id, file);
    setUploading(false);
  };

  const handleView = async () => {
    if (!doc.archivo_url) return;
    const url = await getSignedUrl(doc.archivo_url);
    if (url) window.open(url, '_blank');
    else alert(lang === 'es' ? 'Error al abrir archivo' : 'Error opening file');
  };

  const handleDelete = async () => {
    if (!doc.archivo_url) return;
    setDeleting(true);
    await onDelete(doc.id, doc.archivo_url);
    setDeleting(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${hasFile ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-400"}`}>
        {hasFile ? "\u2713" : "\u25cb"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${hasFile ? "text-gray-500 line-through" : "text-gray-900"}`}>{doc.nombre_doc[lang]}</p>
        {doc.fecha_subida && <p className="text-xs text-gray-400 mt-0.5">{new Date(doc.fecha_subida).toLocaleDateString(lang === "es" ? "es-MX" : "en-US")}</p>}
      </div>
      {hasFile ? (
        <div className="flex items-center gap-2">
          <button onClick={handleView}
            className="text-xs text-gray-500 hover:text-[#1e3a5f] px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1e3a5f] transition-colors">
            {t("view", lang)}
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
            {deleting ? "..." : "\u2715"}
          </button>
        </div>
      ) : (
        <label className={`text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer ${uploading ? "bg-gray-300 text-gray-500" : "bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white"}`}>
          {uploading ? t("uploading", lang) : t("upload", lang)}
          <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />
        </label>
      )}
    </div>
  );
}


/* ─── Party Section ─── */
function PartySection({ party, operationId, onRefresh }: { party: Party; operationId: string; onRefresh: () => void }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(true);
  const [docs, setDocs] = useState<Document[]>([]);
  const [prog, setProg] = useState({ total: 0, completed: 0, percent: 0 });

  const loadDocs = useCallback(async () => {
    const d = await getPartyDocs(operationId, party.id);
    setDocs(d);
    const p = await getPartyProgress(operationId, party.id);
    setProg(p);
  }, [operationId, party.id]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async (docId: string, file: File) => {
    await uploadDocument(docId, file);
    await loadDocs();
    onRefresh();
  };

  const handleDelete = async (docId: string, path: string) => {
    await deleteDocumentFile(docId, path);
    await loadDocs();
    onRefresh();
  };

  const icon = party.tipo === "moral" ? "🏢" : party.rol === "comprador" ? "👤" : "🏠";
  const allDone = prog.completed === prog.total && prog.total > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div className="text-left">
            <span className="text-sm font-semibold text-gray-800">{party.nombre}</span>
            <span className="text-xs text-gray-400 ml-2">{PARTY_ROLE_LABELS[party.rol][lang]} · {PARTY_TYPE_LABELS[party.tipo][lang]}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${allDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{prog.completed}/{prog.total}</span>
        </div>
        <span className={`text-gray-400 transition-transform text-xs ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="border-t border-gray-100">
          {party.tipo === "moral" ? (
            <>
              <div className="px-5 py-2 bg-blue-50/50 border-b border-gray-100">
                <span className="text-xs font-semibold text-[#1e3a5f]">🏢 {t("empresa", lang)}</span>
              </div>
              {docs.filter(d => !d.nombre_doc.es.startsWith("(Apoderado)")).map(doc => <DocRow key={doc.id} doc={doc} onUpload={handleUpload} onDelete={handleDelete} />)}
              <div className="px-5 py-2 bg-amber-50/50 border-b border-t border-gray-100">
                <span className="text-xs font-semibold text-amber-700">👤 {t("apoderado", lang)}</span>
              </div>
              {docs.filter(d => d.nombre_doc.es.startsWith("(Apoderado)")).map(doc => <DocRow key={doc.id} doc={doc} onUpload={handleUpload} onDelete={handleDelete} />)}
            </>
          ) : (
            docs.map(doc => <DocRow key={doc.id} doc={doc} onUpload={handleUpload} onDelete={handleDelete} />)
          )}
        </div>
      )}
    </div>
  );
}

/* ─── General Section ─── */
function GeneralSection({ operationId, categoria, onRefresh, label }: { operationId: string; categoria: DocCategory; onRefresh: () => void; label?: string }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(true);
  const [docs, setDocs] = useState<Document[]>([]);

  const loadDocs = useCallback(async () => {
    const d = await getGeneralDocs(operationId, categoria);
    setDocs(d);
  }, [operationId, categoria]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleUpload = async (docId: string, file: File) => {
    await uploadDocument(docId, file);
    await loadDocs();
    onRefresh();
  };

  const handleDelete = async (docId: string, path: string) => {
    await deleteDocumentFile(docId, path);
    await loadDocs();
    onRefresh();
  };

  const completed = docs.filter(d => d.archivo_url !== null).length;
  const allDone = completed === docs.length && docs.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-lg">{CATEGORY_ICONS[categoria]}</span>
          <span className="text-sm font-semibold text-gray-800">{label || CATEGORY_LABELS[categoria][lang]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${allDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{completed}/{docs.length}</span>
        </div>
        <span className={`text-gray-400 transition-transform text-xs ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && <div className="border-t border-gray-100">{docs.map(doc => <DocRow key={doc.id} doc={doc} onUpload={handleUpload} onDelete={handleDelete} />)}</div>}
    </div>
  );
}

/* ─── Operation Dashboard ─── */
function OperationDashboard({ operation, onLogout, isAdmin, onGoAdmin }: { operation: Operation; onLogout: () => void; isAdmin?: boolean; onGoAdmin?: () => void }) {
  const { lang } = useLang();
  const [ready, setReady] = useState(false);
  const generalCats: DocCategory[] = ["cierre", "notario"];

  useEffect(() => {
    (async () => {
      await ensureDocs(operation);
      setReady(true);
    })();
  }, [operation]);

  const refreshDocs = () => {};

  const compradores = operation.partes.filter(p => p.rol === "comprador");
  const vendedores = operation.partes.filter(p => p.rol === "vendedor");

  if (!ready) return <div className="text-center py-20 text-gray-400">{t("loading", lang)}</div>;

  const notarioNames: Record<string, string> = {
    "Artisan 201": "Notaría 10 PV",
    "Naarena 203": "Notaría 29 Bucerias",
  };
  const notarioLabel = notarioNames[operation.nombre];

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
        {operation.imagen_fondo ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${operation.imagen_fondo})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 text-center">
          <button onClick={onLogout} className="absolute top-4 right-4 text-white/70 hover:text-white text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all">{t("exit", lang)}</button>
          {isAdmin && onGoAdmin && (
            <button onClick={onGoAdmin} className="absolute top-4 right-20 text-white/70 hover:text-white text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all">
              {lang === "es" ? "📋 Todos" : "📋 All"}
            </button>
          )}
          <div className="absolute top-4 left-4"><LangToggle /></div>
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{OPERATION_LABELS[operation.tipo][lang]}</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">{operation.nombre}</h1>
        </div>
      </div>

      {compradores.length > 0 && (
        <div className="mb-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{PARTY_ROLE_LABELS.comprador[lang]}{compradores.length > 1 ? (lang === "es" ? "es" : "s") : ""}</h3>
          {compradores.map(p => <PartySection key={p.id} party={p} operationId={operation.id} onRefresh={refreshDocs} />)}
        </div>
      )}
      {vendedores.length > 0 && (
        <div className="mb-1 mt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{PARTY_ROLE_LABELS.vendedor[lang]}{vendedores.length > 1 ? (lang === "es" ? "es" : "s") : ""}</h3>
          {vendedores.map(p => <PartySection key={p.id} party={p} operationId={operation.id} onRefresh={refreshDocs} />)}
        </div>
      )}
      <div className="mt-4">
        {generalCats.map(cat => <GeneralSection key={cat} operationId={operation.id} categoria={cat} onRefresh={refreshDocs} label={cat === "notario" ? notarioLabel : undefined} />)}
      </div>
    </div>
  );
}

/* ─── Admin Panel ─── */
function AdminPanel({ onSelect, onLogout }: { onSelect: (op: Operation) => void; onLogout: () => void }) {
  const { lang } = useLang();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [progresses, setProgresses] = useState<Record<string, { total: number; completed: number; percent: number }>>({});

  useEffect(() => {
    (async () => {
      const ops = await getOperations();
      setOperations(ops);
      const progs: Record<string, { total: number; completed: number; percent: number }> = {};
      for (const op of ops) {
        progs[op.id] = await getProgress(op.id);
      }
      setProgresses(progs);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">{t("loading", lang)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t("adminTitle", lang)}</h2>
          <p className="text-sm text-gray-500 mt-1">{operations.length} {t("activeOps", lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={onLogout} className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">{t("exit", lang)}</button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {operations.map(op => {
          const prog = progresses[op.id] || { percent: 0 };
          return (
            <button key={op.id} onClick={() => onSelect(op)} className="text-left bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="relative h-32 overflow-hidden">
                {op.imagen_fondo ? (
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${op.imagen_fondo})` }} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{op.nombre}</h3>
                  <p className="text-white/60 text-xs">{OPERATION_LABELS[op.tipo][lang]} · {op.partes.length} {lang === "es" ? "partes" : "parties"}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>PIN: {op.pin}</span>
                  <span className="font-medium">{prog.percent}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e3a5f] rounded-full" style={{ width: `${prog.percent}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Home() {
  const [view, setView] = useState<"pin" | "admin" | "operation">("pin");
  const [activeOp, setActiveOp] = useState<Operation | null>(null);
  const [lang, setLang] = useState<Lang>("es");
  const [isAdmin, setIsAdmin] = useState(false);
  const toggleLang = () => setLang(l => l === "es" ? "en" : "es");
  const handleAccess = (result: Operation | "admin", alsoAdmin?: boolean) => {
    if (alsoAdmin) setIsAdmin(true);
    if (result === "admin") { setIsAdmin(true); setView("admin"); }
    else { setActiveOp(result); setView("operation"); }
  };
  const handleLogout = () => { setView("pin"); setActiveOp(null); setIsAdmin(false); };

  return (
    <LangContext.Provider value={{ lang, toggle: toggleLang }}>
      {view === "pin" && <div className="relative"><div className="absolute top-0 right-0"><LangToggle /></div><PinEntry onAccess={handleAccess} /></div>}
      {view === "admin" && <AdminPanel onSelect={op => { setActiveOp(op); setView("operation"); }} onLogout={handleLogout} />}
      {view === "operation" && activeOp && <OperationDashboard operation={activeOp} onLogout={handleLogout} isAdmin={isAdmin} onGoAdmin={() => setView("admin")} />}
    </LangContext.Provider>
  );
}
