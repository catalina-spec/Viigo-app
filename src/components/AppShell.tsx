'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { TABS, hrefFor, type Role } from '@/lib/tabs';
import { Icon } from './Icon';

// Secciones del asesor que dependen de tener un cliente elegido.
const CLIENT_TABS = new Set(['asesorias', 'alternativas', 'planilla', 'mensajes']);

export function AppShell({ role, tab, children }: { role: Role; tab: string; children: ReactNode }) {
  const { s, toastText, elegirCliente } = useStore();
  const router = useRouter();
  const [more, setMore] = useState(false);
  const pending = s.meetings.filter((m) => m.status === 'revision').length;
  const badge = (id: string) => (role === 'asesor' && id === 'asesorias' && pending ? pending : 0);
  const tabs = TABS[role];
  const mobileTabs = tabs.filter((t) => t.mobile);
  const moreTabs = tabs.filter((t) => !t.mobile);
  const moreActive = moreTabs.some((t) => t.id === tab);

  const salir = async () => {
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
      <header className="top">
        <div className="top-in">
          <Link className="brand" href={`/${role}`}>
            <h1>Mi Ruta <span>VIIGO</span></h1>
            <small>Viel.cl</small>
          </Link>
          <div className="row" style={{ gap: 10 }}>
            {role === 'asesor' && s.clientes.length > 0 && (
              <select className="pick" aria-label="Cliente" value={s.clienteId ?? ''} onChange={(e) => elegirCliente(e.target.value)}>
                {s.clientes.map((c) => (
                  <option key={c.id} value={c.id}>{`${c.nombre} ${c.apellido}`.trim() || c.email}{c.mio ? '' : ' · otro asesor'}</option>
                ))}
              </select>
            )}
            <button className="out" onClick={salir} title={s.me.email}>Salir</button>
          </div>
        </div>
      </header>

      <div className="wrap">
        <nav className="tabs" aria-label="Secciones">
          {tabs.map((t) => (
            <Link key={t.id} href={hrefFor(role, t.id)} aria-current={tab === t.id ? 'page' : undefined}>
              <span>{t.label}</span>
              {badge(t.id) ? <span className="dot">{badge(t.id)}</span> : null}
            </Link>
          ))}
        </nav>
        <main>{body}</main>
      </div>

      <nav className="bottomnav" aria-label="Secciones">
        {mobileTabs.map((t) => (
          <Link key={t.id} href={hrefFor(role, t.id)} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setMore(false)}>
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
              <Link key={t.id} href={hrefFor(role, t.id)} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setMore(false)}>
                <Icon name={t.icon} />
                {t.label}
              </Link>
            ))}
          </div>
        </>
      )}
      {toastText && <div className="toast" role="status">{toastText}</div>}
    </>
  );
}
