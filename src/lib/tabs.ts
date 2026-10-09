export type Role = 'cliente' | 'asesor';
export type Tab = { id: string; label: string; short: string; icon: string; mobile?: boolean; oculta?: boolean };

// Secciones de cada portal. "mobile" = aparece en el menú inferior del celular; el resto va en "Más".
// "oculta" = no aparece en los menús; se abre desde el círculo del perfil.
export const TABS: Record<Role, Tab[]> = {
  cliente: [
    { id: 'inicio', label: 'Inicio', short: 'Inicio', icon: 'home', mobile: true },
    { id: 'perfil', label: 'Mi perfil', short: 'Perfil', icon: 'user' },
    { id: 'ruta', label: 'Mi ruta', short: 'Mi ruta', icon: 'route', mobile: true },
    { id: 'alternativas', label: 'Mis alternativas', short: 'Alternativas', icon: 'building' },
    { id: 'asesorias', label: 'Mis asesorías', short: 'Asesorías', icon: 'video', mobile: true },
    { id: 'planilla', label: 'Mi planilla', short: 'Planilla', icon: 'sheet' },
    { id: 'biblioteca', label: 'Biblioteca VIIGO', short: 'Biblioteca', icon: 'book' },
    { id: 'mensajes', label: 'Mensajes', short: 'Mensajes', icon: 'chat', mobile: true },
    { id: 'compras', label: 'Mis compras', short: 'Compras', icon: 'user', oculta: true },
    { id: 'terminos', label: 'Términos y condiciones', short: 'Términos', icon: 'user', oculta: true },
  ],
  asesor: [
    { id: 'inicio', label: 'Ficha del cliente', short: 'Ficha', icon: 'user', mobile: true },
    { id: 'agenda', label: 'Agenda', short: 'Agenda', icon: 'calendar', mobile: true },
    { id: 'sesiones', label: 'Sesiones', short: 'Sesiones', icon: 'slides' },
    { id: 'asesorias', label: 'Asesorías', short: 'Asesorías', icon: 'video', mobile: true },
    { id: 'alternativas', label: 'Alternativas', short: 'Alternativas', icon: 'building' },
    { id: 'planilla', label: 'Planilla financiera', short: 'Planilla', icon: 'sheet' },
    { id: 'biblioteca', label: 'Biblioteca VIIGO', short: 'Biblioteca', icon: 'book' },
    { id: 'mensajes', label: 'Mensajes', short: 'Mensajes', icon: 'chat', mobile: true },
  ],
};

export const hrefFor = (role: Role, id: string) => (id === 'inicio' ? `/${role}` : `/${role}/${id}`);
