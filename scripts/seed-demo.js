import { createAdminClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://6vgumkqu.us-east.insforge.app';
const apiKey = process.env.INSFORGE_API_KEY || process.env.INSFORGE_SERVICE_ROLE_KEY || 'ik_0c583c8afce18d60e07b27074f62d368';

const DEMO_EMAIL = 'demo@paic.app';
const DEMO_PASSWORD = 'Demo123456!';
const CONJUNTO_NAME = 'Conjunto Residencial Paraíso';

async function run() {
  console.log('Seeding demo data...\n');

  const admin = createAdminClient({ baseUrl, apiKey });

  const { data: existingUser } = await admin.database
    .from('user_profiles')
    .select('id')
    .eq('email', DEMO_EMAIL)
    .maybeSingle();

  if (existingUser) {
    const { data: cj } = await admin.database
      .from('conjuntos')
      .select('id, name')
      .eq('name', CONJUNTO_NAME)
      .maybeSingle();
    if (cj) {
      const { data: uu } = await admin.database
        .from('unidades')
        .select('id', { count: 'exact', head: true })
        .eq('copropiedad_id', cj.id);
      if (uu && uu.length > 0) {
        console.log('Demo data already exists!\n');
        console.log(`  Email: ${DEMO_EMAIL}`);
        console.log(`  Password: ${DEMO_PASSWORD}`);
        return;
      }
    }
  }

  let userId;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`1. Using existing user: ${userId}`);
  } else {
    const { data: signInData, error: signInErr } = await admin.auth.signInWithPassword({
      email: DEMO_EMAIL, password: DEMO_PASSWORD,
    });
    if (signInErr) throw new Error(`Cannot authenticate demo user: ${signInErr.message}`);
    userId = signInData.user.id;
    console.log(`1. Using existing auth user: ${userId}`);
  }

  console.log('2. Creating conjunto...');
  const { data: conjunto, error: cErr } = await admin.database
    .from('conjuntos')
    .insert([{
      name: CONJUNTO_NAME, address: 'Carrera 45 # 23-12, Barrio El Prado',
      nit: '901.123.456-7', admin_name: 'Demo PAIC',
      admin_email: DEMO_EMAIL, admin_phone: '+57 300 123 4567',
      subscription_plan: 'Premium', plan_price: 0, tipo: 'residencial',
    }])
    .select()
    .single();
  if (cErr) throw cErr;
  const cid = conjunto.id;
  console.log(`   Conjunto ID: ${cid}`);

  console.log('3. Creating user profile...');
  const { error: pErr } = await admin.database
    .from('user_profiles')
    .upsert([{ id: userId, email: DEMO_EMAIL, full_name: 'Demo PAIC', role: 'Admin', conjunto_id: cid }]);
  if (pErr) throw pErr;

  console.log('4. Linking user to conjunto...');
  const { error: lErr } = await admin.database
    .from('usuario_copropiedad')
    .upsert([{ user_id: userId, copropiedad_id: cid, role: 'admin', activo: true }]);
  if (lErr) throw lErr;

  console.log('5. Creating unidades...');
  const { data: unidades, error: uErr } = await admin.database
    .from('unidades')
    .insert([
      { copropiedad_id: cid, tipo: 'apartamento', numero: '101', torre: 'A', piso: '1', area_m2: 85, propietario_nombre: 'Carlos Mendoza', propietario_documento: 'CC 123456789', propietario_email: 'carlos@email.com', propietario_telefono: '+57 300 111 2233' },
      { copropiedad_id: cid, tipo: 'apartamento', numero: '102', torre: 'A', piso: '1', area_m2: 75, propietario_nombre: 'Ana Rodríguez', propietario_documento: 'CC 987654321', propietario_email: 'ana@email.com', propietario_telefono: '+57 300 222 3344' },
      { copropiedad_id: cid, tipo: 'apartamento', numero: '201', torre: 'A', piso: '2', area_m2: 90, propietario_nombre: 'Pedro López', propietario_documento: 'CC 456789123', propietario_email: 'pedro@email.com', propietario_telefono: '+57 300 333 4455' },
      { copropiedad_id: cid, tipo: 'apartamento', numero: '202', torre: 'A', piso: '2', area_m2: 80, propietario_nombre: 'María García', propietario_documento: 'CC 789123456', propietario_email: 'maria@email.com', propietario_telefono: '+57 300 444 5566' },
      { copropiedad_id: cid, tipo: 'apartamento', numero: '301', torre: 'A', piso: '3', area_m2: 95, propietario_nombre: 'Juan Martínez', propietario_documento: 'CC 321654987', propietario_email: 'juan@email.com', propietario_telefono: '+57 300 555 6677' },
      { copropiedad_id: cid, tipo: 'casa', numero: '1', interior: 'Manzana B', area_m2: 150, propietario_nombre: 'Laura Sánchez', propietario_documento: 'CC 654987321', propietario_email: 'laura@email.com', propietario_telefono: '+57 300 666 7788' },
      { copropiedad_id: cid, tipo: 'casa', numero: '2', interior: 'Manzana B', area_m2: 140, propietario_nombre: 'Diego Torres', propietario_documento: 'CC 147258369', propietario_email: 'diego@email.com', propietario_telefono: '+57 300 777 8899' },
      { copropiedad_id: cid, tipo: 'local_comercial', numero: 'LC-01', piso: '1', area_m2: 60, propietario_nombre: 'Comercial XYZ SAS', propietario_documento: 'NIT 900123456', propietario_email: 'comercial@xyz.com', propietario_telefono: '+57 601 888 9900' },
      { copropiedad_id: cid, tipo: 'parqueadero', numero: 'PA1', torre: 'A', piso: 'Sótano', area_m2: 12 },
      { copropiedad_id: cid, tipo: 'parqueadero', numero: 'PB2', torre: 'B', piso: 'Sótano', area_m2: 12 },
      { copropiedad_id: cid, tipo: 'parqueadero', numero: 'PC3', torre: 'C', piso: 'Sótano', area_m2: 15 },
    ])
    .select();
  if (uErr) throw uErr;
  console.log(`   ${unidades.length} unidades`);

  const u = Object.fromEntries(unidades.map(x => [x.numero, x.id]));

  console.log('6. Creating residents...');
  const { error: rErr } = await admin.database
    .from('residents')
    .insert([
      { conjunto_id: cid, unidad_id: u['101'], name: 'Carlos Mendoza', apartment: '101', email: 'carlos@email.com', phone: '+57 300 111 2233', documento: 'CC 123456789', es_propietario: true },
      { conjunto_id: cid, unidad_id: u['101'], name: 'Lucía Mendoza', apartment: '101', email: 'lucia@email.com', phone: '+57 300 111 2234', telefono_alternativo: '+57 301 111 2234', documento: 'CC 987654322', es_propietario: false },
      { conjunto_id: cid, unidad_id: u['102'], name: 'Ana Rodríguez', apartment: '102', email: 'ana@email.com', phone: '+57 300 222 3344', documento: 'CC 987654321', es_propietario: true },
      { conjunto_id: cid, unidad_id: u['201'], name: 'Pedro López', apartment: '201', email: 'pedro@email.com', phone: '+57 300 333 4455', documento: 'CC 456789123', es_propietario: true },
      { conjunto_id: cid, unidad_id: u['202'], name: 'María García', apartment: '202', email: 'maria@email.com', phone: '+57 300 444 5566', documento: 'CC 789123456', es_propietario: true },
      { conjunto_id: cid, unidad_id: u['301'], name: 'Juan Martínez', apartment: '301', email: 'juan@email.com', phone: '+57 300 555 6677', documento: 'CC 321654987', es_propietario: true },
      { conjunto_id: cid, unidad_id: u['301'], name: 'Elena Martínez', apartment: '301', email: 'elena@email.com', phone: '+57 300 555 6678', documento: 'CC 159753852', es_propietario: false },
      { conjunto_id: cid, unidad_id: u['1'], name: 'Laura Sánchez', apartment: 'Casa 1', email: 'laura@email.com', phone: '+57 300 666 7788', documento: 'CC 654987321', es_propietario: true },
      { conjunto_id: cid, unidad_id: u['2'], name: 'Diego Torres', apartment: 'Casa 2', email: 'diego@email.com', phone: '+57 300 777 8899', documento: 'CC 147258369', es_propietario: true },
      { conjunto_id: cid, name: 'Sofía Ramírez', apartment: 'LC-01', email: 'sofia@email.com', phone: '+57 300 888 9900', documento: 'CC 951753852', es_propietario: true },
    ]);
  if (rErr) throw rErr;

  console.log('7. Creating providers...');
  const { data: providers, error: pvErr } = await admin.database
    .from('providers')
    .insert([
      { conjunto_id: cid, company: 'Servicios Generales ABC', specialty: 'Mantenimiento y Aseo', email: 'contacto@abcservicios.com', phone: '+57 601 345 6789' },
      { conjunto_id: cid, company: 'Seguridad Privada Omega', specialty: 'Vigilancia', email: 'info@seguridadomega.com', phone: '+57 601 456 7890' },
      { conjunto_id: cid, company: 'Ascensores Modernos SA', specialty: 'Mantenimiento de Ascensores', email: 'servicio@ascensoresmodernos.com', phone: '+57 601 567 8901' },
      { conjunto_id: cid, company: 'Jardinería Verde Vivo', specialty: 'Jardinería y Paisajismo', email: 'info@verdevivo.com', phone: '+57 310 678 9012' },
      { conjunto_id: cid, company: 'Plomería Express', specialty: 'Fontanería', email: 'emergencias@plomeriaexpress.com', phone: '+57 320 789 0123' },
    ])
    .select();
  if (pvErr) throw pvErr;
  console.log(`   ${providers.length} providers`);

  const pid = Object.fromEntries(providers.map(p => [p.company, p.id]));

  console.log('8. Creating incomes...');
  const { error: iErr } = await admin.database
    .from('incomes')
    .insert([
      { conjunto_id: cid, description: 'Cuota administración enero 2026', amount: 12500000, category: 'Administración', date: '2026-01-15' },
      { conjunto_id: cid, description: 'Cuota administración febrero 2026', amount: 12500000, category: 'Administración', date: '2026-02-15' },
      { conjunto_id: cid, description: 'Cuota administración marzo 2026', amount: 12500000, category: 'Administración', date: '2026-03-15' },
      { conjunto_id: cid, description: 'Arriendo local comercial - marzo', amount: 2500000, category: 'Arrendamientos', date: '2026-03-01' },
      { conjunto_id: cid, description: 'Recuperación cartera morosa', amount: 1850000, category: 'Cartera', date: '2026-02-28' },
      { conjunto_id: cid, description: 'Uso salón comunal - feb', amount: 350000, category: 'Eventos', date: '2026-02-20' },
    ]);
  if (iErr) throw iErr;

  console.log('9. Creating expenses...');
  const { error: eErr } = await admin.database
    .from('expenses')
    .insert([
      { conjunto_id: cid, description: 'Servicio vigilancia mensual', amount: 4500000, category: 'Seguridad', date: '2026-02-01', provider_id: pid['Seguridad Privada Omega'] },
      { conjunto_id: cid, description: 'Mantenimiento ascensores', amount: 1200000, category: 'Mantenimiento', date: '2026-02-05', provider_id: pid['Ascensores Modernos SA'] },
      { conjunto_id: cid, description: 'Jardinería y poda', amount: 800000, category: 'Jardinería', date: '2026-02-10', provider_id: pid['Jardinería Verde Vivo'] },
      { conjunto_id: cid, description: 'Servicio de aseo', amount: 2200000, category: 'Limpieza', date: '2026-02-15', provider_id: pid['Servicios Generales ABC'] },
      { conjunto_id: cid, description: 'Factura energía eléctrica', amount: 3500000, category: 'Servicios Públicos', date: '2026-02-20' },
      { conjunto_id: cid, description: 'Factura servicio de agua', amount: 1800000, category: 'Servicios Públicos', date: '2026-02-20' },
      { conjunto_id: cid, description: 'Reparación bomba de agua', amount: 950000, category: 'Mantenimiento', date: '2026-03-01', provider_id: pid['Plomería Express'] },
    ]);
  if (eErr) throw eErr;

  console.log('10. Creating tasks...');
  const d = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
  const { error: tErr } = await admin.database
    .from('tasks')
    .insert([
      { conjunto_id: cid, text: 'Revisar y aprobar presupuesto mensual', due_date: d(7), completed: false },
      { conjunto_id: cid, text: 'Cotizar nuevo sistema de cámaras de seguridad', due_date: d(14), completed: false },
      { conjunto_id: cid, text: 'Actualizar directorio de residentes', due_date: d(30), completed: false },
      { conjunto_id: cid, text: 'Programar reunión extraordinaria de copropietarios', due_date: d(45), completed: true },
      { conjunto_id: cid, text: 'Solicitar cotización mantenimiento de fachada', due_date: d(21), completed: false },
      { conjunto_id: cid, text: 'Renovar contrato de vigilancia', due_date: d(60), completed: false },
    ]);
  if (tErr) throw tErr;

  console.log('11. Creating common areas...');
  const { error: aErr } = await admin.database
    .from('common_areas')
    .insert([
      { conjunto_id: cid, name: 'Salón Social', color: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' } },
      { conjunto_id: cid, name: 'Piscina', color: { bg: '#dcfce7', text: '#166534', border: '#86efac' } },
      { conjunto_id: cid, name: 'Gimnasio', color: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' } },
      { conjunto_id: cid, name: 'Cancha Múltiple', color: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' } },
      { conjunto_id: cid, name: 'Parque Infantil', color: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' } },
    ]);
  if (aErr) throw aErr;

  console.log('\nDemo data seeded successfully!');
  console.log(`  Conjunto: ${CONJUNTO_NAME}`);
  console.log(`  Email: ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
