'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { TABS, type Role } from '@/lib/tabs';
import { Icon } from './Icon';
import { InstalarApp } from './Pwa';
import { TerminosGate } from './Terminos';
import { TABS_PROGRAMA, tienePrograma } from './Programa';
import { Avatar } from './views/Shared';

// Secciones del asesor que dependen de tener un cliente elegido.
const CLIENT_TABS = new Set(['asesorias', 'alternativas', 'planilla', 'mensajes']);

export function AppShell({ role, tab, children }: { role: Role; tab: string; children: ReactNode }) {
  const { s, toastText, elegirCliente, href, demo, refrescar, toast } = useStore();
  const router = useRouter();
  const [more, setMore] = useState(false);
  // Menú del círculo del cliente: cerrado, principal o el submenú "Mi perfil".
  const [cuenta, setCuenta] = useState<null | 'main' | 'perfil'>(null);
  const [cuentaTop, setCuentaTop] = useState(64);
  const pending = s.meetings.filter((m) => m.status === 'revision').length;
  const badge = (id: string) => (role === 'asesor' && id === 'asesorias' && pending ? pending : 0);
  const tabs = TABS[role].filter((t) => !t.oculta);
  const mobileTabs = tabs.filter((t) => t.mobile);
  const moreTabs = tabs.filter((t) => !t.mobile);
  const moreActive = moreTabs.some((t) => t.id === tab);
  const bloq = (id: string) => role === 'cliente' && !s.loading && !tienePrograma(s.P.plan) && TABS_PROGRAMA.has(id);

  const salir = async () => {
    if (demo) { router.push('/demo'); return; }
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  let body = children;
  if (s.loading) body = <p className="note" style={{ padding: '40px 0', textAlign: 'center' }}>Cargando…</p>;
  else if (role === 'asesor' && CLIENT_TABS.has(tab) && !s.clienteId)
    body = (
      <section className="empty">
        <h3>Aún no tienes clientes</h3>
        <p>Cuando un cliente entre a la app con su correo, aparecerá aquí automáticamente. Mientras, puedes revisar la Agenda, las Sesiones y la Biblioteca.</p>
      </section>
    );

  return (
    <>
      {demo && (
        <div className="demo">
          <b>Vista demo</b> · Andrés y su asesora son un caso de ejemplo. Puedes probar todo; nada se guarda. <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>Entrar a la app real →</Link>
        </div>
      )}
      <header className="top">
        <div className="top-in">
          <div className="row" style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'center' }}>
          {tab !== 'inicio' && (
            <button className="back" aria-label="Volver" title="Volver" onClick={() => {
              // Vuelve a la pantalla anterior; si se abrió directo aquí, al inicio.
              if (window.history.length > 1) router.back();
              else router.push(href(role, 'inicio'));
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          <Link className="brand" href={href(role, 'inicio')}>
            <h1>Mi Ruta <span>VIIGO</span></h1>
            <small>Viel.cl</small>
          </Link>
          </div>
          <div className="row" style={{ gap: 10 }}>
            {demo && (
              <div className="role" role="group" aria-label="Cambiar de vista">
                <Link href="/demo/cliente" aria-current={role === 'cliente'}>Cliente</Link>
                <Link href="/demo/asesor" aria-current={role === 'asesor'}>Asesor</Link>
              </div>
            )}
            {!demo && role === 'asesor' && s.clientes.length > 0 && (
              <select className="pick" aria-label="Cliente" value={s.clienteId ?? ''} onChange={(e) => elegirCliente(e.target.value)}>
                {s.clientes.map((c) => (
                  <option key={c.id} value={c.id}>{`${c.nombre} ${c.apellido}`.trim() || c.email}{c.mio ? '' : ' · otro asesor'}</option>
                ))}
              </select>
            )}
            <InstalarApp />
            {!demo && role === 'asesor' && <button className="out" title="Traer los últimos cambios de tus clientes" onClick={async () => { await refrescar(); toast('Datos actualizados.'); }}>↻ Actualizar</button>}
            {role === 'cliente' ? (
              <button className="cuenta-btn" aria-label="Mi cuenta" aria-expanded={!!cuenta} onClick={(e) => { setCuentaTop(e.currentTarget.getBoundingClientRect().bottom + 8); setCuenta(cuenta ? null : 'main'); }}>
                <Avatar src={s.P.foto ?? null} name={`${s.P.nombre} ${s.P.apellido}`.trim() || s.P.mail || '?'} size={38} />
              </button>
            ) : !demo && <button className="out" onClick={salir} title={s.me.email}>Salir</button>}
          </div>
        </div>
      </header>

      <div className="wrap">
        <nav className="tabs" aria-label="Secciones">
          {tabs.map((t) => (
            <Link key={t.id} href={href(role, t.id)} aria-current={tab === t.id ? 'page' : undefined}>
              <span>{t.label}{bloq(t.id) && <span className="lock" aria-label="Bloqueado">🔒</span>}</span>
              {badge(t.id) ? <span className="dot">{badge(t.id)}</span> : null}
            </Link>
          ))}
        </nav>
        <main>{body}</main>
      </div>

      <nav className="bottomnav" aria-label="Secciones">
        {mobileTabs.map((t) => (
          <Link key={t.id} href={href(role, t.id)} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setMore(false)}>
            <Icon name={t.icon} />
            <span>{t.short}</span>
            {badge(t.id) ? <span className="dot">{badge(t.id)}</span> : null}
          </Link>
        ))}
        <button type="button" aria-expanded={more} aria-current={moreActive ? 'page' : undefined} onClick={() => setMore(!more)}>
          <Icon name="more" />
          <span>Más</span>
        </button>
      </nav>
      {more && (
        <>
          <div className="sheet-bg" onClick={() => setMore(false)} />
          <div className="sheet" role="dialog" aria-label="Más secciones">
            <span className="grip" />
            {moreTabs.map((t) => (
              <Link key={t.id} href={href(role, t.id)} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setMore(false)}>
                <Icon name={t.icon} />
                {t.label}{bloq(t.id) && <span className="lock" aria-label="Bloqueado">🔒</span>}
              </Link>
            ))}
          </div>
        </>
      )}
      {cuenta && (
        <>
          <div className="cuenta-bg" onClick={() => setCuenta(null)} />
          <div className="cuenta-menu" role="menu" style={{ top: cuentaTop }}>
            {cuenta === 'main' ? (
              <>
                <div className="cuenta-quien"><b>{`${s.P.nombre} ${s.P.apellido}`.trim() || 'Mi cuenta'}</b><small>{s.P.mail}</small></div>
                <button role="menuitem" onClick={() => setCuenta('perfil')}><span>Mi perfil</span><span aria-hidden="true">›</span></button>
                <button role="menuitem" className="cuenta-salir" onClick={() => { setCuenta(null); salir(); }}>{demo ? 'Salir de la demo' : 'Cerrar sesión'}</button>
              </>
            ) : (
              <>
                <button className="cuenta-volver" onClick={() => setCuenta('main')}><span aria-hidden="true">‹</span> Mi perfil</button>
                {[['perfil', 'Mis datos personales'], ['compras', 'Mis compras'], ['terminos', 'Términos y condiciones']].map(([id, l]) => (
                  <Link key={id} role="menuitem" href={href(role, id)} onClick={() => setCuenta(null)}><span>{l}</span><span aria-hidden="true">›</span></Link>
                ))}
              </>
            )}
          </div>
        </>
      )}
      {role === 'cliente' && <TerminosGate />}
      {toastText && <div className="toast" role="status">{toastText}</div>}
    </>
  );
}
