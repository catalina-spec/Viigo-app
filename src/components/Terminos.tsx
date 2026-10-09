'use client';

// Aceptación de términos y condiciones: se pide al cliente la primera vez que entra
// (y cada vez que sube TERMINOS_VERSION).

import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { TERMINOS, TERMINOS_FECHA, TERMINOS_VERSION } from '@/lib/terminos';

export function TextoTerminos() {
  return (
    <div className="terms-text">
      {TERMINOS.map((s) => (
        <section key={s.t}>
          <h3>{s.t}</h3>
          {s.p.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
      <p className="note">Versión {TERMINOS_VERSION} · {TERMINOS_FECHA} · Consultas: soporte@viel.cl</p>
    </div>
  );
}

export function TerminosGate() {
  const { s, aceptarTerminos, toast } = useStore();
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  if (s.loading || s.P.terminos === TERMINOS_VERSION) return null;

  const aceptar = async () => {
    setBusy(true);
    const err = await aceptarTerminos(TERMINOS_VERSION);
    setBusy(false);
    if (err) toast(err);
  };

  return (
    <div className="terms-gate" role="dialog" aria-modal="true" aria-labelledby="terms-h">
      <div className="terms-card">
        <span className="eyebrow">Antes de empezar</span>
        <h2 id="terms-h">Términos y condiciones y privacidad</h2>
        <p className="note">Lee cómo cuidamos tu información. Para usar Mi Ruta VIIGO necesitamos que los aceptes.</p>
        <div className="terms-scroll"><TextoTerminos /></div>
        <label className="terms-check">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>Leí y acepto los <Link href="/terminos" target="_blank">términos y condiciones y la política de privacidad</Link> de Mi Ruta VIIGO.</span>
        </label>
        <button className="btn btn-p" disabled={!ok || busy} onClick={aceptar}>{busy ? 'Guardando…' : 'Acepto y continuar'}</button>
      </div>
    </div>
  );
}
