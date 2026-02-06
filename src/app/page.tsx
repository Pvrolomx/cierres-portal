"use client";

import { useState, createContext, useContext } from "react";
import {
  Operation,
  OPERATION_LABELS,
  DocCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  Document,
  Lang,
} from "@/types";
import {
  getOperations,
  getDocuments,
  getProgress,
  findOperationByPin,
  isAdminPin,
  markDocumentUploaded,
} from "@/lib/store";

/* ─── i18n Context ─── */
const LangContext = createContext<{ lang: Lang; toggle: () => void }>({ lang: "es", toggle: () => {} });
function useLang() { return useContext(LangContext); }

const UI: Record<string, { es: string; en: string }> = {
  accessTitle: { es: "Acceso al Portal", en: "Portal Access" },
  accessDesc: { es: "Ingresa tu código de acceso para ver los documentos de tu operación", en: "Enter your access code to view your closing documents" },
  accessPlaceholder: { es: "Código de acceso", en: "Access code" },
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
};

function t(key: string, lang: Lang): string {
  return UI[key]?.[lang] || key;
}

/* ─── Language Toggle ─── */
function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all text-gray-600"
    >
      <span className={lang === "es" ? "font-bold text-gray-900" : ""}>ES</span>
      <span className="text-gray-300">|</span>
      <span className={lang === "en" ? "font-bold text-gray-900" : ""}>EN</span>
    </button>
  );
}

/* ─── PIN Entry Screen ─── */
function PinEntry({ onAccess }: { onAccess: (op: Operation | "admin") => void }) {
  const { lang } = useLang();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleSubmit = () => {
    if (pin.length < 4) return;
    if (isAdminPin(pin)) { onAccess("admin"); return; }
    const op = findOperationByPin(pin);
    if (op) { onAccess(op); } else {
      setError(t("invalidPin", lang));
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPin("");
    }
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
        <div className={`${shaking ? "animate-shake" : ""}`}>
          <input
            type="text"
            value={pin}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
              setPin(v); setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={t("accessPlaceholder", lang)}
            maxLength={6}
            className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 px-6 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none transition-all bg-white placeholder:tracking-normal placeholder:text-base placeholder:text-gray-300"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
          <button onClick={handleSubmit} disabled={pin.length < 4}
            className="w-full mt-4 py-3.5 bg-[#1e3a5f] text-white rounded-xl font-medium text-sm disabled:opacity-30 hover:bg-[#2a4d7a] active:bg-[#162d4a] transition-all shadow-lg shadow-[#1e3a5f]/20">
            {t("accessBtn", lang)}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">{t("accessHelp", lang)}</p>
      </div>
    </div>
  );
}

/* ─── Document Row ─── */
function DocRow({ doc, onUpload }: { doc: Document; onUpload: (id: string) => void }) {
  const { lang } = useLang();
  const hasFile = doc.archivo_url !== null;
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${hasFile ? "bg-emerald-100 text-emerald-600" : "bg-red-50 text-red-400"}`}>
        {hasFile ? "✓" : "○"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${hasFile ? "text-gray-500" : "text-gray-900"}`}>{doc.nombre_doc[lang]}</p>
        {doc.fecha_subida && <p className="text-xs text-gray-400 mt-0.5">{new Date(doc.fecha_subida).toLocaleDateString(lang === "es" ? "es-MX" : "en-US")}</p>}
        {!doc.requerido && !hasFile && <p className="text-xs text-amber-500 mt-0.5">{t("optional", lang)}</p>}
      </div>
      {hasFile ? (
        <button className="text-xs text-gray-500 hover:text-[#1e3a5f] px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1e3a5f] transition-colors">{t("view", lang)}</button>
      ) : (
        <button onClick={() => onUpload(doc.id)} className="text-xs bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm">{t("upload", lang)}</button>
      )}
    </div>
  );
}

/* ─── Category Section ─── */
function CategorySection({ category, docs, onUpload }: { category: DocCategory; docs: Document[]; onUpload: (id: string) => void }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(true);
  const completed = docs.filter((d) => d.archivo_url !== null).length;
  const allDone = completed === docs.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-lg">{CATEGORY_ICONS[category]}</span>
          <span className="text-sm font-semibold text-gray-800">{CATEGORY_LABELS[category][lang]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${allDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{completed}/{docs.length}</span>
        </div>
        <span className={`text-gray-400 transition-transform text-xs ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && <div className="border-t border-gray-100">{docs.map((doc) => <DocRow key={doc.id} doc={doc} onUpload={onUpload} />)}</div>}
    </div>
  );
}

/* ─── Operation Dashboard ─── */
function OperationDashboard({ operation, onLogout }: { operation: Operation; onLogout: () => void }) {
  const { lang } = useLang();
  const [docs, setDocs] = useState(() => getDocuments(operation.id));
  const progress = getProgress(operation.id);
  const categories: DocCategory[] = ["comprador", "vendedor", "cierre", "transaccion"];

  const handleUpload = (docId: string) => {
    markDocumentUploaded(docId, `https://storage.example.com/${docId}`);
    setDocs(getDocuments(operation.id));
  };

  return (
    <div>
      {/* Hero — centered name, no date */}
      <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
        {operation.imagen_fondo ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${operation.imagen_fondo})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 text-center">
          <button onClick={onLogout}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all">
            {t("exit", lang)}
          </button>
          <div className="absolute top-4 left-4"><LangToggle /></div>

          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
            {OPERATION_LABELS[operation.tipo][lang]}
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            {operation.nombre}
          </h1>

          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-xs text-white/70 mb-2">
              <span>{t("docs", lang)}</span>
              <span className="font-semibold text-white">{progress.completed}/{progress.total} · {progress.percent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {categories.map((cat) => {
        const catDocs = docs.filter((d) => d.categoria === cat);
        if (catDocs.length === 0) return null;
        return <CategorySection key={cat} category={cat} docs={catDocs} onUpload={handleUpload} />;
      })}
    </div>
  );
}

/* ─── Admin Panel ─── */
function AdminPanel({ onSelect, onLogout }: { onSelect: (op: Operation) => void; onLogout: () => void }) {
  const { lang } = useLang();
  const operations = getOperations();

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
        {operations.map((op) => {
          const prog = getProgress(op.id);
          return (
            <button key={op.id} onClick={() => onSelect(op)}
              className="text-left bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group">
              <div className="relative h-32 overflow-hidden">
                {op.imagen_fondo ? (
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${op.imagen_fondo})` }} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#3b82f6]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">{op.nombre}</h3>
                  <p className="text-white/60 text-xs">{OPERATION_LABELS[op.tipo][lang]}</p>
                </div>
                <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm ${op.status === "activa" ? "bg-emerald-500/80 text-white" : "bg-gray-500/80 text-white"}`}>
                  {op.status === "activa" ? (lang === "es" ? "Activa" : "Active") : (lang === "es" ? "Cerrada" : "Closed")}
                </span>
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

/* ─── Main App ─── */
export default function Home() {
  const [view, setView] = useState<"pin" | "admin" | "operation">("pin");
  const [activeOp, setActiveOp] = useState<Operation | null>(null);
  const [lang, setLang] = useState<Lang>("es");

  const toggleLang = () => setLang((l) => (l === "es" ? "en" : "es"));
  const handleAccess = (result: Operation | "admin") => {
    if (result === "admin") setView("admin");
    else { setActiveOp(result); setView("operation"); }
  };
  const handleLogout = () => { setView("pin"); setActiveOp(null); };

  return (
    <LangContext.Provider value={{ lang, toggle: toggleLang }}>
      {view === "pin" && (
        <div className="relative">
          <div className="absolute top-0 right-0"><LangToggle /></div>
          <PinEntry onAccess={handleAccess} />
        </div>
      )}
      {view === "admin" && <AdminPanel onSelect={(op) => { setActiveOp(op); setView("operation"); }} onLogout={handleLogout} />}
      {view === "operation" && activeOp && <OperationDashboard operation={activeOp} onLogout={handleLogout} />}
    </LangContext.Provider>
  );
}
