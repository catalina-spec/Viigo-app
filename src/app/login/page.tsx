'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(params.get('error') ? 'El link expiró o ya se usó. Pide uno nuevo.' : null);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    // Flujo "implícito": el link del correo trae la sesión y funciona en cualquier dispositivo,
    // aunque se abra en otro navegador o en el celular (/auth/confirm la guarda).
    const { error } = await createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }).auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${location.origin}/auth/confirm` },
    });
    setBusy(false);
    if (error) setMsg(error.status === 429 ? 'Se alcanzó el límite de correos de acceso por ahora. Inténtalo de nuevo en una hora.' : 'No pudimos enviar el correo. Revisa la dirección e inténtalo otra vez.');
    else setSent(true);
  };

  // Alternativa al link: el código de 6 dígitos del mismo correo (útil si abres el correo en otro dispositivo).
  const verify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = String(new FormData(e.currentTarget).get('code') ?? '').replace(/\D/g, '');
    if (token.length < 6) return setMsg('El código tiene 6 dígitos.');
    setBusy(true);
    const { error } = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' });
    setBusy(false);
    if (error) setMsg('Código incorrecto o vencido. Pide uno nuevo.');
    else router.replace('/');
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          <h1>Mi Ruta <span style={{ color: 'var(--gold)' }}>VIIGO</span></h1>
          <small>Viel.cl</small>
        </div>
        {!sent ? (
          <>
            <p className="note" style={{ fontSize: 14 }}>Entra con tu correo. Te enviamos un link de acceso, sin contraseñas.</p>
            <form className="field" onSubmit={send}>
              <label htmlFor="mail">Tu correo</label>
              <input id="mail" type="email" required placeholder="nombre@correo.cl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn-p" type="submit" style={{ marginTop: 8 }} disabled={busy}>{busy ? 'Enviando…' : 'Enviarme el link de acceso'}</button>
            </form>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15 }}>Te enviamos un correo a <b>{email}</b>.</p>
            <p className="note" style={{ fontSize: 14 }}>Ábrelo y haz clic en el link para entrar. Si el correo trae un código de 6 dígitos, también puedes escribirlo aquí:</p>
            <form className="field" onSubmit={verify}>
              <label htmlFor="code">Código</label>
              <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="123456" />
              <button className="btn btn-p" type="submit" style={{ marginTop: 8 }} disabled={busy}>Entrar</button>
            </form>
            <button className="btn btn-g" onClick={() => { setSent(false); setMsg(null); }}>Usar otro correo</button>
          </>
        )}
        {msg && <p className="watermark">{msg}</p>}
        <p className="note">¿No te llega? Revisa la carpeta de spam o promociones.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
