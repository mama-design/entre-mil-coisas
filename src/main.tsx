import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {Session} from '@supabase/supabase-js';
import {Eye,EyeOff,ArrowRight,Loader2,LogOut} from 'lucide-react';
import Notebook from './app/notebook';
import {supabase} from './lib/supabase';
import './app/globals.css';
function App(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[allowed,setAllowed]=useState(false),[checking,setChecking]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let live=true;const update=(s:Session|null)=>{if(live){setSession(s);setReady(true)}};supabase.auth.getSession().then(({data})=>update(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>update(s));return()=>{live=false;subscription.unsubscribe()}},[]);
 useEffect(()=>{let live=true;setAllowed(false);if(!session){setChecking(false);return}setChecking(true);setError('');supabase.from('emc_access').select('user_id').eq('user_id',session.user.id).maybeSingle().then(({data,error})=>{if(live){setAllowed(!!data&&!error);setChecking(false);if(error)setError('Não consegui conferir teu acesso. Atualiza a página para tentar novamente.')}});return()=>{live=false}},[session?.user.id]);
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)setError('Não consegui entrar. Confere teu e-mail e senha da Mama.');setBusy(false)}
 async function logout(){const {error}=await supabase.auth.signOut({scope:'local'});if(error)setError('Não consegui sair. Tenta de novo.');else{setPassword('');setAllowed(false)}}
 if(!ready||checking)return <div className="login-page"><Loader2 className="spin"/><p>Abrindo teu espaço…</p></div>;
 if(session&&allowed)return <div key={session.user.id}><Notebook/><button className="logout-button" onClick={logout} aria-label="Sair do meu espaço" title="Sair"><LogOut size={17}/></button></div>;
 return <main className="login-page"><div className="login-brand">ENTRE MIL COISAS <span>♡</span></div><section className="login-paper"><p className="eyebrow">TEU ESPAÇO PESSOAL</p><h1>Mil coisas.<br/><span>Um lugar só.</span></h1>{session?<><p>Este caderninho é só da Martina. Entre com a conta autorizada.</p>{error&&<p role="alert" className="error">{error}</p>}<button className="save" onClick={logout}>Entrar com outra conta</button></>:<><p>Deixa aqui. Tua cabeça merece uma folga.</p><form onSubmit={login}><label>Teu e-mail<input autoComplete="username" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail que tu usa na Mama"/></label><label>Tua senha<div className="password-field"><input autoComplete="current-password" required type={visible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={visible?'Esconder senha':'Mostrar senha'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>{error&&<p role="alert" className="error">{error}</p>}<button className="save" disabled={busy}>{busy?<Loader2 className="spin" size={18}/>:<ArrowRight size={18}/>} {busy?'Entrando…':'Entrar no meu espaço'}</button></form><small className="login-hint">Usa o mesmo e-mail e senha da tua conta da Mama.</small></>}</section><p className="login-footer">HOJE CABE O QUÊ?</p></main>
}
createRoot(document.getElementById('root')!).render(<App/>);
