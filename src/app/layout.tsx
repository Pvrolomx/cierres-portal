import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cierres — Expat Advisor MX",
  description: "Portal de documentos por operación inmobiliaria",
  manifest: "/manifest.json",
  themeColor: "#1e3a5f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 min-h-screen font-sans">
        <header className="bg-[#1e3a5f] text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Portal de Cierres</h1>
              <p className="text-xs text-blue-200 tracking-wide">Expat Advisor MX</p>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold tracking-tight">Rolo</h1>
              <p className="text-xs text-blue-200 tracking-wide">Expat Advisor MX</p>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
