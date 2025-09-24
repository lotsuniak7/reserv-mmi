import { createClient } from '@/utils/supabase/server';

export default async function Instruments() {
  const supabase = await createClient();
  console.log(supabase);
  const data:any = await supabase.from("instruments").select();
  console.log(data)
  return <pre>{JSON.stringify(Instruments, null, 2)}</pre>
}