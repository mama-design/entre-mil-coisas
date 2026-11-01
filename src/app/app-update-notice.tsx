import {useEffect,useState} from 'react';
import {RefreshCw,X} from 'lucide-react';
import current from '../build-version.json';
export default function AppUpdateNotice(){
 const [available,setAvailable]=useState(false),[hidden,setHidden]=useState(false);
 useEffect(()=>{let live=true,pending=false;const check=async()=>{if(pending||document.visibilityState==='hidden')return;pending=true;try{const url=new URL('./app-version.json',document.baseURI);url.searchParams.set('check',String(Date.now()));const r=await fetch(url,{cache:'no-store'});if(r.ok){const next=await r.json();if(live&&typeof next.build==='string'&&next.build>current.build)setAvailable(true)}}catch{}finally{pending=false}};const visible=()=>{if(document.visibilityState==='visible')void check()};void check();const timer=setInterval(()=>void check(),60000);window.addEventListener('focus',visible);document.addEventListener('visibilitychange',visible);return()=>{live=false;clearInterval(timer);window.removeEventListener('focus',visible);document.removeEventListener('visibilitychange',visible)}},[]);
 function update(){const url=new URL(window.location.href);url.searchParams.set('atualizado',String(Date.now()));window.location.replace(url.href)}
 return available&&!hidden?<div className="app-update-notice" role="status"><span>Tem uma versão nova do teu app.</span><button onClick={update}><RefreshCw size={14}/>Atualizar</button><button aria-label="Atualizar mais tarde" onClick={()=>setHidden(true)}><X size={16}/></button></div>:null;
}
