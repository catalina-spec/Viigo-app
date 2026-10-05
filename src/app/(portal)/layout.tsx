import { StoreProvider } from '@/lib/store';

// Envuelve los portales de cliente y asesor con el mismo estado (modo demo).
export default function PortalLayout({ children }: LayoutProps<'/'>) {
  return <StoreProvider>{children}</StoreProvider>;
}
