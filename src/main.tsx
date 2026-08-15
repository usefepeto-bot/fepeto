import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { supabase } from './supabase';

type Drop = { id:string; name:string; status:string; quantity:number; sold_quantity:number; starts_at:string|null };

function App(){
  const [drop,setDrop]=useState<Drop|null>(null);
  const [remaining,setRemaining]=useState(0);
  const [form,setForm]=useState({name:'',whatsapp:'',email:''});
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{ let timer:number; const load=async()=>{ const {data}=await supabase.from('drops').select('id,name,status,quantity,sold_quantity,starts_at').order('created_at',{ascending:false}).limit(1).maybeSingle(); if(data){setDrop(data);setRemaining(Math.max(0,data.quantity-data.sold_quantity));} }; load(); timer=window.setInterval(load,15000); return()=>window.clearInterval(timer)},[]);

  const countdown=()=>{ if(!drop?.starts_at) return '-- : -- : -- : --'; const diff=Math.max(0,new Date(drop.starts_at).getTime()-Date.now()); const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60; return `${String(d).padStart(2,'0')} : ${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}` };
  const [clock,setClock]=useState(''); useEffect(()=>{const t=window.setInterval(()=>setClock(countdown()),1000);setClock(countdown());return()=>window.clearInterval(t)},[drop]);
  const join=async(e:React.FormEvent)=>{e.preventDefault();setError('');const {error}=await supabase.from('waitlist').insert({drop_id:drop?.id||null,name:form.name,email:form.email||null,whatsapp:form.whatsapp,source:'site',consent:true});if(error){setError(error.code==='23505'?'Você já está no ACCESS deste DROP.':error.message);return}setSent(true)};

  return <main className="site">
    <header><div className="logo">FEPETO</div><a href="#access">ACCESS</a></header>
    <section className="hero"><p className="eyebrow">VISTA ATITUDE, VISTA FEPETO.</p><h1>IDENTIDADE<br/>QUE SE<br/>SUSTENTA.</h1><p className="lead">Feito de vivência. Feito para quem faz parte.</p><div className="actions"><a href="#manifesto">MANIFESTO</a><a href="#lookbook">LOOKBOOK</a></div></section>
    <section id="manifesto" className="block"><span>01 / MANIFESTO</span><h2>Não representa um.<br/>Representa muitos.</h2><a href="#access">ENTRAR NA FEPETO →</a></section>
    <section id="lookbook" className="lookbook"><span>02 / LOOKBOOK</span><div className="look">FEPETO / PRIMEIRO MOVIMENTO</div></section>
    <section id="access" className="access"><span>03 / FEPETO ACCESS</span><h2>Antes de todo mundo.</h2><p>Entre no acesso privado. O próximo movimento chega primeiro para quem está dentro.</p>{sent?<div className="confirmed">ACESSO REGISTRADO.<br/><small>Você será avisado quando a próxima porta abrir.</small></div>:<form onSubmit={join}><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Seu nome" required/><input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="WhatsApp" required/><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="E-mail"/><button>QUERO ACESSO</button>{error&&<small className="error">{error}</small>}</form>}</section>
    <section className="drop"><span>04 / PRÓXIMO MOVIMENTO</span><h2>{drop?.name||'PRÓXIMO DROP'}</h2><div className="status">{drop?.status==='PRE_LAUNCH'?'PRÉ-LANÇAMENTO':drop?.status||'FECHADO'}</div><div className="timer">{clock}</div><p>{drop?.status==='LIVE'?`${remaining} unidades disponíveis.`:'O catálogo permanece fechado até a abertura.'}</p></section>
    <footer>© 2026 FEPETO — SÃO PAULO, BR</footer>
  </main>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);