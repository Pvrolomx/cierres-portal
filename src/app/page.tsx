"use client";

import { useState } from "react";
import { Operation, OPERATION_LABELS, DocCategory, CATEGORY_LABELS, Document } from "@/types";
import { getOperations, getDocuments, getProgress, verifyPin, markDocumentUploaded, ADMIN_PIN } from "@/lib/store";

function PinModal({ operation, onSuccess, onClose }: { operation: Operation; onSuccess: () => void; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN || verifyPin(operation.id, pin)) {
      onSuccess();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Acceso a operación</h3>
        <p className="text-sm text-gray-500 mb-6">{operation.nombre}</p>
        <div className="flex justify-center gap-2 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
                ${pin.length > i ? "border-[#1e3a5f] bg-blue-50 text-[#1e3a5f]" : "border-gray-200 text-gray-300"}
                ${error ? "border-red-400 bg-red-50" : ""}`}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs text-center mb-3">PIN incorrecto</p>}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((key, i) => (
            <button
              key={i}
              onClick={() => {
                if (key === null) return;
                if (key === "⌫") { setPin((p) => p.slice(0, -1)); setError(false); return; }
                if (pin.length < 4) { setPin((p) => p + key); setError(false); }
              }}
              className={`h-12 rounded-lg text-lg font-medium transition-colors
                ${key === null ? "invisible" : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700"}`}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4}
            className="flex-1 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-[#2a4d7a] transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

function DocRow({ doc, onUpload }: { doc: Document; onUpload: (id: string) => void }) {
  const hasFile = doc.archivo_url !== null;
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <span className={`text-lg ${hasFile ? "" : ""}`}>{hasFile ? "🟢" : "🔴"}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${hasFile ? "text-gray-700" : "text-gray-900 font-medium"}`}>
          {doc.nombre_doc}
        </p>
        {doc.fecha_subida && (
          <p className="text-xs text-gray-400 mt-0.5">
            Subido {new Date(doc.fecha_subida).toLocaleDateString("es-MX")}
          </p>
        )}
        {!doc.requerido && !hasFile && (
          <p className="text-xs text-amber-500 mt-0.5">Opcional</p>
        )}
      </div>
      {hasFile ? (
        <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors">
          📄 Ver
        </button>
      ) : (
        <button
          onClick={() => onUpload(doc.id)}
          className="text-xs bg-[#1e3a5f] hover:bg-[#2a4d7a] text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          ↑ Subir
        </button>
      )}
    </div>
  );
}

function CategorySection({ category, docs, onUpload }: { category: DocCategory; docs: Document[]; onUpload: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const completed = docs.filter((d) => d.archivo_url !== null).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">{CATEGORY_LABELS[category]}</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {completed}/{docs.length}
          </span>
        </div>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="border-t border-gray-100">
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} onUpload={onUpload} />
          ))}
        </div>
      )}
    </div>
  );
}

function OperationDashboard({ operation, onBack }: { operation: Operation; onBack: () => void }) {
  const [docs, setDocs] = useState(() => getDocuments(operation.id));
  const progress = getProgress(operation.id);
  const categories: DocCategory[] = ["comprador", "vendedor", "propiedad", "transaccion"];

  const handleUpload = (docId: string) => {
    // Simulate upload - in production this goes to Supabase Storage
    markDocumentUploaded(docId, `https://storage.example.com/${docId}`);
    setDocs(getDocuments(operation.id));
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#1e3a5f] hover:underline mb-4 flex items-center gap-1">
        ← Operaciones
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{operation.nombre}</h2>
            <p className="text-sm text-gray-500 mt-1">{OPERATION_LABELS[operation.tipo]}</p>
            <p className="text-xs text-gray-400 mt-1">Creada: {new Date(operation.fecha_creacion).toLocaleDateString("es-MX")}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${operation.status === "activa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {operation.status === "activa" ? "Activa" : "Cerrada"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso de documentos</span>
            <span className="font-medium">{progress.completed}/{progress.total} ({progress.percent}%)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#3b82f6] rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Document sections by category */}
      {categories.map((cat) => {
        const catDocs = docs.filter((d) => d.categoria === cat);
        if (catDocs.length === 0) return null;
        return <CategorySection key={cat} category={cat} docs={catDocs} onUpload={handleUpload} />;
      })}
    </div>
  );
}

export default function Home() {
  const operations = getOperations();
  const [activeOp, setActiveOp] = useState<Operation | null>(null);
  const [showPin, setShowPin] = useState<Operation | null>(null);
  const [authenticated, setAuthenticated] = useState<Set<string>>(new Set());

  const handleTabClick = (op: Operation) => {
    if (authenticated.has(op.id)) {
      setActiveOp(op);
    } else {
      setShowPin(op);
    }
  };

  const handlePinSuccess = () => {
    if (showPin) {
      setAuthenticated((prev) => { const next = new Set(prev); next.add(showPin.id); return next; });
      setActiveOp(showPin);
      setShowPin(null);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => handleTabClick(op)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${activeOp?.id === op.id
                ? "border-[#1e3a5f] text-[#1e3a5f]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            <span className="flex items-center gap-2">
              {authenticated.has(op.id) ? "🔓" : "🔒"} {op.nombre}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeOp ? (
        <OperationDashboard
          operation={activeOp}
          onBack={() => setActiveOp(null)}
        />
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Portal de Cierres</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Selecciona una operación para ver el checklist de documentos. 
            Necesitarás el PIN de acceso.
          </p>
        </div>
      )}

      {/* PIN Modal */}
      {showPin && (
        <PinModal
          operation={showPin}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPin(null)}
        />
      )}
    </div>
  );
}
