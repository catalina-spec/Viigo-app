import { redirect } from 'next/navigation';

// Más adelante: si la persona ya inició sesión, la enviamos a su portal (cliente o asesor).
export default function Home() {
  redirect('/login');
}
