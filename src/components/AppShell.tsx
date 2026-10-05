'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { TABS, hrefFor, type Role } from '@/lib/tabs';
import { Icon } from './Icon';

export function AppShell({ role, tab, children }: { role: Role; tab: string; children: ReactNode }) {
  const { s, toastText } = useStore();
  const [more, setMore] = useState(false);
  const pending = s.meetings.filter((m) => m.status === 'revision').length;
  const badge = (id: string) => (role === 'asesor' && id === 'asesorias' && pending ? pending : 0);
  const tabs = TABS[role];
  const mobileTabs = tabs.filter((t) => t.mobile);
  const moreTabs = tabs.filter((t) => !t.mobile);
  const moreActive = moreTabs.some((t) => t.id === tab);

  return (
    <>
      <div className="demo">
        <b>Modo demo</b> · Andrés y su asesor son un caso de ejemplo. Los cambios no se guardan todavía.
      </div>
      <header className="top">
        <div className="top-in">
          <Link className="brand" href={`/${role}`}>
            <h1>
              Mi Ruta <span>VIIGO</span>
            </h1>
            <small>Viel.cl</small>
          </Link>
          <div className="role" role="group" aria-label="Cambiar de vista">
            <Link href="/cliente" aria-current={role === 'cliente'}>
              Cliente
            </Link>
            <Link href="/asesor" aria-current={role === 'asesor'}>
              Asesor
            </Link>
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
        <main>{children}</main>
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
      {toastText && (
        <div className="toast" role="status">
          {toastText}
        </div>
      )}
    </>
  );
}
