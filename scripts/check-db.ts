import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxfxkhufqakwcuvjyvon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4ZnhraHVmcWFrd2N1dmp5dm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzYwMDAsImV4cCI6MTg3NjA3NjAwMH0.5gVPQQqUaCfTf5KhPf4yYo5YFWL5wT4Q6NdJ9pQ8N6I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('=== VERIFICANDO UTILIZADORES ===\n');

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, name, created_at')
    .limit(20);

  if (profileError) {
    console.error('Erro ao buscar perfis:', profileError);
  } else {
    console.log(`Total de utilizadores: ${profiles?.length || 0}`);
    profiles?.forEach((p: any, i: number) => {
      console.log(`\n${i + 1}. ${p.name || 'N/A'} (${p.role})`);
      console.log(`   Email: ${p.email}`);
      console.log(`   Criado: ${new Date(p.created_at).toLocaleDateString('pt-PT')}`);
    });
  }

  console.log('\n\n=== VERIFICANDO ERROS NA BASE DE DADOS ===\n');

  const { data: systemLogs, error: logsError } = await supabase
    .from('system_logs')
    .select('*')
    .eq('level', 'error')
    .order('created_at', { ascending: false })
    .limit(10);

  if (logsError) {
    console.log('Sem tabela de system_logs ou erro ao aceder');
  } else if (systemLogs && systemLogs.length > 0) {
    console.log(`Erros encontrados: ${systemLogs.length}`);
    systemLogs.forEach((log: any, i: number) => {
      console.log(`\n${i + 1}. ${log.message}`);
      console.log(`   Hora: ${new Date(log.created_at).toLocaleString('pt-PT')}`);
    });
  } else {
    console.log('Nenhum erro registado na base de dados');
  }

  console.log('\n\n=== ESTATÍSTICAS ===\n');

  const tables = ['students', 'parents', 'drivers', 'routes', 'vehicles'];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`${table.toUpperCase()}: ${count} registos`);
    }
  }
}

checkDatabase().catch(console.error);
