'use client';

// Registro del service worker y botón "Instalar app".
// Android y computador: usa el aviso nativo del navegador.
// iPhone/iPad (Safari no tiene ese aviso): muestra cómo agregarla a la pantalla de inicio.

import { useEffect, useState } from 'react';

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
  }, []);
  return null;
}

const instalada = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export function InstalarApp({ className = 'out' }: { className?: string }) {
  const [evento, setEvento] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const [lista, setLista] = useState(true); // ya instalada → no mostrar

  useEffect(() => {
    const t = setTimeout(() => {
      setLista(instalada());
      setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent));
    }, 0);
    const onPrompt = (e: Event) => { e.preventDefault(); setEvento(e as BIPEvent); };
    const onInstalled = () => { setLista(true); setEvento(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (lista || (!evento && !ios)) return null;

  const instalar = async () => {
    if (evento) {
      await evento.prompt();
      await evento.userChoice;
      setEvento(null);
    } else setAyuda(true);
  };

  return (
    <>
      <button className={className} onClick={instalar}>Instalar app</button>
      {ayuda && (
        <>
          <div className="sheet-bg" style={{ display: 'block' }} onClick={() => setAyuda(false)} />
          <div className="sheet install-sheet" role="dialog" aria-label="Instalar en iPhone">
            <span className="grip" />
            <h3>Instala Mi Ruta VIIGO en tu iPhone</h3>
            <ol>
              <li>Toca el botón <b>Compartir</b> de Safari (el cuadrado con una flecha hacia arriba).</li>
              <li>Baja y elige <b>Agregar a pantalla de inicio</b>.</li>
              <li>Toca <b>Agregar</b>. El ícono VIIGO queda junto a tus apps.</li>
            </ol>
            <button className="btn btn-p" onClick={() => setAyuda(false)}>Entendido</button>
          </div>
        </>
      )}
    </>
  );
}
