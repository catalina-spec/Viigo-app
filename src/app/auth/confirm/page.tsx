'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// El link mágico del correo llega aquí con la sesión en la URL (#access_token=…).
// La guardamos en cookies y entramos. Funciona aunque el correo se abra en otro dispositivo.
export default function ConfirmPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Devuelve un mensaje de error, o null si la sesión quedó abierta.
    const abrir = async (): Promise<string | null> => {
      const hash = new URLSearchParams(location.hash.slice(1));
      const query = new URLSearchParams(location.search);
      const sb = createClient();
      if (hash.get('error') || query.get('error')) return 'El link expiró o ya se usó. Pide uno nuevo.';
      const access_token = hash.get('access_token'), refresh_token = hash.get('refresh_token');
      if (access_token && refresh_token) {
        const { error } = await sb.auth.setSession({ access_token, refresh_token });
        return error ? 'No pudimos abrir tu sesión. Pide un link nuevo.' : null;
      }
      const code = query.get('code');
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        return error ? 'Este link se debe abrir en el mismo navegador donde lo pediste. Pide uno nuevo.' : null;
      }
      return 'El link no es válido. Pide uno nuevo.';
    };
    abrir().then((err) => (err ? setError(err) : location.replace('/')));
  }, []);

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          <h1>Mi Ruta <span style={{ color: 'var(--gold)' }}>VIIGO</span></h1>
          <small>Viel.cl</small>
        </div>
        {error ? (
          <>
            <p className="watermark">{error}</p>
            <Link className="btn btn-p" href="/login">Volver a pedir acceso</Link>
          </>
        ) : (
          <p className="note" style={{ fontSize: 15 }}>Entrando a tu ruta VIIGO…</p>
        )}
      </div>
    </div>
  );
}
