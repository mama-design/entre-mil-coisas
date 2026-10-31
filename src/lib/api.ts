import {supabase} from './supabase';
// Adapter keeps the approved components identical while replacing server routes.
export async function apiFetch(path:string, init:RequestInit={}):Promise<Response>{
 try{
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)return Response.json({error:'Entre novamente no teu espaço.'},{status:401});
  const collection=path.split('/').pop()!;
  if((init.method||'GET')==='GET'){
   const {data,error}=await supabase.from('emc_notebooks').select('state').eq('user_id',session.user.id).single();
   if(error)throw error;
   const s=data.state;
   return Response.json(collection==='entries'?{entries:s.entries,completions:s.completions}:collection==='habits'?{habits:s.habits,logs:s.logs}:[...s.categories].sort((a,b)=>a.position-b.position));
  }
  const payload=JSON.parse(String(init.body||'{}'));
  const {data,error}=await supabase.rpc('emc_mutate',{collection,verb:init.method,payload});
  if(error)throw error;
  return Response.json(data);
 }catch(e){return Response.json({error:(e as {message?:string}).message||'Não consegui salvar. Confere tua conexão e tenta novamente.'},{status:400})}
}
