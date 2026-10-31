import {supabase} from './supabase';
import {Birthday} from './birthdays';
const fields='id,name,birth_month,birth_day,birth_year,relationship,notes';
async function owner(){const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw Error('Entre novamente no teu espaço.');return data.user.id}
export async function loadBirthdays(){const id=await owner();const {data,error}=await supabase.from('emc_birthdays').select(fields).eq('user_id',id);if(error)throw Error('Não consegui abrir os aniversários. Tenta novamente.');return data as Birthday[]}
export async function saveBirthday(b:Birthday){const user_id=await owner();const {id,...values}=b,row={...values,user_id,updated_at:new Date().toISOString()};const query=id?supabase.from('emc_birthdays').update(row).eq('id',id).eq('user_id',user_id):supabase.from('emc_birthdays').insert(row);const {data,error}=await query.select(fields).single();if(error)throw Error('Não consegui salvar. Confere a data e tenta novamente.');return data as Birthday}
export async function deleteBirthday(id:string){const user_id=await owner();const {data,error}=await supabase.from('emc_birthdays').delete().eq('id',id).eq('user_id',user_id).select('id').single();if(error||!data)throw Error('Não consegui excluir. Tenta novamente.')}
