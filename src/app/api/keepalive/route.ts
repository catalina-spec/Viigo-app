import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Tarea diaria (Vercel Cron, ver vercel.json): hace una consulta pequeña a la base de datos
// para que Supabase (plan gratis) no pause el proyecto por inactividad. No devuelve datos.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error } = await createAdminClient().from('perfiles').select('id', { head: true, count: 'exact' });
    if (error) throw error;
    return NextResponse.json({ ok: true, en: new Date().toISOString() });
  } catch (e) {
    console.error('keepalive', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
