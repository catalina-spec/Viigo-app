import type { Metadata } from 'next';
import Link from 'next/link';
import { TextoTerminos } from '@/components/Terminos';

export const metadata: Metadata = { title: 'Términos y privacidad · Mi Ruta VIIGO' };

// Página pública con los términos y condiciones y la política de privacidad.
export default function TerminosPage() {
  return (
    <div className="terms-page">
      <header className="top"><div className="top-in"><Link className="brand" href="/"><h1>Mi Ruta <span>VIIGO</span></h1><small>Viel.cl</small></Link></div></header>
      <main className="terms-main">
        <div className="head"><span className="eyebrow">Mi Ruta VIIGO</span><h2>Términos y condiciones y política de privacidad</h2></div>
        <TextoTerminos />
      </main>
    </div>
  );
}
