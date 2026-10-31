import {createClient} from '@supabase/supabase-js';
export const supabase=createClient('https://zhdvnziazdcbquzslsls.supabase.co','sb_publishable_FUYtdpkrTsLeEP9y38WGaQ_hab989mF',{
 auth:{storageKey:'entre-mil-coisas-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
});
