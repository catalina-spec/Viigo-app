'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          <h1>
            Mi Ruta <span style={{ color: 'var(--gold)' }}>VIIGO</span>
          </h1>
          <small>Viel.cl</small>
        </div>
        <p className="note" style={{ fontSize: 14 }}>
          Entra con tu correo. Te enviamos un link de acceso, sin contraseñas.
        </p>
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label htmlFor="mail">Tu correo</label>
          <input id="mail" type="email" required placeholder="nombre@correo.cl" autoComplete="email" />
          <button className="btn btn-p" type="submit" style={{ marginTop: 8 }}>
            Enviarme el link de acceso
          </button>
        </form>
        {sent && (
          <p className="watermark">
            El acceso por correo se activa cuando conectemos Supabase (próximo paso). Por ahora usa el modo demo.
          </p>
        )}
        <div className="login-sep">Modo demo</div>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <Link className="btn btn-g" href="/cliente">
            Ver como cliente
          </Link>
          <Link className="btn btn-g" href="/asesor">
            Ver como asesor
          </Link>
        </div>
      </div>
    </div>
  );
}
