'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { InstalarApp } from '@/components/Pwa';

// Entrada a la app:
// · Lo normal: correo + contraseña.
// · Primera vez u olvidó su contraseña: le enviamos un código provisorio de 6 números,
//   entra con él y crea su contraseña (o la cambia) en el mismo paso.
type Paso = 'clave' | 'codigo' | 'crear';

const MIN = 8;

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [paso, setPaso] = useState<Paso>('clave');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [ver, setVer] = useState(false);
  const [msg, setMsg] = useState<string | null>(params.get('error') ? 'El acceso expiró o ya se usó. Pide un código nuevo.' : null);
  const correo = () => email.trim().toLowerCase();

  const entrar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.signInWithPassword({ email: correo(), password });
    setBusy(false);
    if (!error) return router.replace('/');
    setMsg(error.status === 429
      ? 'Demasiados intentos. Espera unos minutos o entra con un código provisorio.'
      : 'Correo o contraseña incorrectos. Si es tu primera vez o no la recuerdas, pide un código provisorio aquí abajo.');
  };

  const enviarCodigo = async (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    if (!correo().includes('@')) return setMsg('Escribe tu correo arriba para enviarte el código.');
    setBusy(true);
    setMsg(null);
    // Flujo "implícito": si alguien abre el link del correo en vez de usar el código, igual funciona (/auth/confirm).
    const { error } = await createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }).auth.signInWithOtp({ email: correo(), options: { emailRedirectTo: `${location.origin}/auth/confirm` } });
    setBusy(false);
    if (error) setMsg(error.status === 429 ? 'Se alcanzó el límite de correos por ahora. Inténtalo de nuevo en una hora.' : 'No pudimos enviar el correo. Revisa la dirección e inténtalo otra vez.');
    else setPaso('codigo');
  };

  const verificar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = String(new FormData(e.currentTarget).get('code') ?? '').replace(/\D/g, '');
    if (token.length !== 6) return setMsg('El código tiene 6 números. Revisa el correo.');
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.verifyOtp({ email: correo(), token, type: 'email' });
    setBusy(false);
    if (error) setMsg('Código incorrecto o vencido. Pide uno nuevo.');
    else setPaso('crear');
  };

  const crear = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p1 = String(f.get('p1') ?? ''), p2 = String(f.get('p2') ?? '');
    if (p1.length < MIN) return setMsg(`La contraseña debe tener al menos ${MIN} caracteres.`);
    if (p1 !== p2) return setMsg('Las dos contraseñas no coinciden.');
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) return setMsg(/weak|pwned|leaked/i.test(error.message) ? 'Esa contraseña es muy común o fácil de adivinar. Elige otra.' : 'No pudimos guardar tu contraseña. Inténtalo otra vez.');
    router.replace('/');
  };

  const ojo = (
    <button type="button" className="mini" onClick={() => setVer(!ver)} aria-pressed={ver} style={{ alignSelf: 'flex-start' }}>
      {ver ? 'Ocultar contraseña' : 'Ver contraseña'}
    </button>
  );

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          <h1>Mi Ruta <span style={{ color: 'var(--gold)' }}>VIIGO</span></h1>
          <small>Viel.cl</small>
        </div>

        {paso === 'clave' && (
          <>
            <p className="note" style={{ fontSize: 14 }}>Entra con tu correo y tu contraseña.</p>
            <form className="field" onSubmit={entrar}>
              <label htmlFor="mail">Tu correo</label>
              <input id="mail" type="email" required placeholder="nombre@correo.cl" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="password" style={{ marginTop: 8 }}>Contraseña</label>
              <input id="password" name="password" type={ver ? 'text' : 'password'} required autoComplete="current-password" />
              {ojo}
              <button className="btn btn-p" type="submit" style={{ marginTop: 8 }} disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
            </form>
            <div className="login-alt">
              <p className="note" style={{ margin: 0 }}><b>¿Primera vez o no recuerdas tu contraseña?</b> Te enviamos un código provisorio a tu correo y creas tu contraseña.</p>
              <button className="btn btn-g" type="button" disabled={busy} onClick={() => enviarCodigo()}>Recibir código provisorio</button>
            </div>
          </>
        )}

        {paso === 'codigo' && (
          <>
            <p style={{ fontSize: 15 }}>Te enviamos un código a <b>{correo()}</b>.</p>
            <p className="note" style={{ fontSize: 14 }}>Escribe aquí el código de 6 números que llegó a tu correo (desde Mi Ruta VIIGO · soporte@viel.cl):</p>
            <form className="field" onSubmit={verificar}>
              <label htmlFor="code">Código de 6 números</label>
              <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]*" placeholder="123456" autoFocus className="code-input" />
              <button className="btn btn-p" type="submit" style={{ marginTop: 8 }} disabled={busy}>Continuar</button>
            </form>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <button className="btn btn-g" disabled={busy} onClick={(e) => enviarCodigo(e)}>Enviarme otro código</button>
              <button className="btn btn-g" onClick={() => { setPaso('clave'); setMsg(null); }}>Volver</button>
            </div>
            <p className="note">¿No te llega? Revisa la carpeta de spam o promociones.</p>
          </>
        )}

        {paso === 'crear' && (
          <>
            <p style={{ fontSize: 15 }}><b>Crea tu contraseña</b></p>
            <p className="note" style={{ fontSize: 14 }}>La próxima vez entras con <b>{correo()}</b> y esta contraseña. Mínimo {MIN} caracteres.</p>
            <form className="field" onSubmit={crear}>
              <label htmlFor="p1">Contraseña nueva</label>
              <input id="p1" name="p1" type={ver ? 'text' : 'password'} required minLength={MIN} autoComplete="new-password" autoFocus />
              <label htmlFor="p2" style={{ marginTop: 8 }}>Repite la contraseña</label>
              <input id="p2" name="p2" type={ver ? 'text' : 'password'} required minLength={MIN} autoComplete="new-password" />
              {ojo}
              <button className="btn btn-p" type="submit" style={{ marginTop: 8 }} disabled={busy}>{busy ? 'Guardando…' : 'Guardar y entrar'}</button>
            </form>
            <button className="btn btn-g" type="button" onClick={() => router.replace('/')}>Ahora no, entrar igual</button>
          </>
        )}

        {msg && <p className="watermark">{msg}</p>}
        <p className="note" style={{ fontSize: 12 }}>Al entrar aceptas los <a href="/terminos" target="_blank" style={{ color: 'inherit' }}>términos y condiciones y la política de privacidad</a>.</p>
        <div className="row" style={{ justifyContent: 'center' }}><InstalarApp className="btn btn-g" /></div>
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
