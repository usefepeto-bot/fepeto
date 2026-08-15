import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const state = 'PRE_LAUNCH';
const drop = { name: 'DROP 001 — PRIMEIRO PASSO', quantity: 10, startsAt: '2026-08-18T20:00:00-03:00' };

function App(){
  return <main className="site">
    <header><div className="logo">FEPETO</div><a href="#access">ACCESS</a></header>
    <section className="hero"><p className="eyebrow">VISTA ATITUDE, VISTA FEPETO.</p><h1>IDENTIDADE<br/>QUE SE<br/>SUSTENTA.</h1><p className="lead">Feito de vivência. Feito para quem faz parte.</p><div className="actions"><a href="#manifesto">MANIFESTO</a><a href="#lookbook">LOOKBOOK</a></div></section>
    <section id="manifesto" className="block"><span>01 / MANIFESTO</span><h2>Não representa um.<br/>Representa muitos.</h2><a href="#access">ENTRAR NA FEPETO →</a></section>
    <section id="lookbook" className="lookbook"><span>02 / LOOKBOOK</span><div className="look">FEPETO / PRIMEIRO MOVIMENTO</div></section>
    <section id="access" className="access"><span>03 / FEPETO ACCESS</span><h2>Antes de todo mundo.</h2><p>Entre no acesso privado. O próximo movimento chega primeiro para quem está dentro.</p><form><input placeholder="Seu nome" required/><input placeholder="WhatsApp" required/><input type="email" placeholder="E-mail"/><button>QUERO ACESSO</button></form></section>
    <section className="drop"><span>04 / PRÓXIMO MOVIMENTO</span><h2>{drop.name}</h2><div className="status">{state === 'PRE_LAUNCH' ? 'PRÉ-LANÇAMENTO' : state}</div><div className="timer">02 : 00 : 00 : 00</div><p>O catálogo permanece fechado até a abertura.</p></section>
    <footer>© 2026 FEPETO — SÃO PAULO, BR</footer>
  </main>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);