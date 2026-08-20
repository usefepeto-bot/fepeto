import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { supabase } from './supabase';

type Product = { id:string; name:string; category:string; price:number; active:boolean; image_url:string|null; created_at:string };
type Drop = { id:string; name:string; status:string; starts_at:string|null; quantity:number; sold_quantity:number };
type CartItem = Product & { qty:number };

const pieceLabel = (category:string) => ({calcas:'CALÇAS',bermudas:'BERMUDAS',camisetas:'CAMISETAS',camisas:'CAMISAS',polos:'POLOS',moletons:'MOLETONS',calcados:'CALÇADOS',acessorios:'ACESSÓRIOS'} as Record<string,string>)[category] || category.toUpperCase();
const isFootwear = (p:Product) => ['calcados','calçados','calçado'].includes((p.category||'').toLowerCase());
const isClothing = (p:Product) => !isFootwear(p) && !['acessorios','acessórios'].includes((p.category||'').toLowerCase());

function App(){
  const [drop,setDrop]=useState<Drop|null>(null);
  const [products,setProducts]=useState<Product[]>([]);
  const [category,setCategory]=useState('TODOS');
  const [cart,setCart]=useState<CartItem[]>([]);
  const [cartOpen,setCartOpen]=useState(false);
  const [clock,setClock]=useState('-- : -- : -- : --');
  const [form,setForm]=useState({name:'',whatsapp:'',email:''});
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const load=async()=>{
      const [dropRes, productRes] = await Promise.all([
        supabase.from('drops').select('id,name,status,starts_at,quantity,sold_quantity').order('created_at',{ascending:false}).limit(1).maybeSingle(),
        supabase.from('products').select('id,name,category,price,active,image_url,created_at').eq('active',true).order('created_at',{ascending:false})
      ]);
      if(dropRes.data) setDrop(dropRes.data);
      if(productRes.data) setProducts(productRes.data as Product[]);
    };
    load();
    const timer=window.setInterval(load,30000);
    return()=>window.clearInterval(timer);
  },[]);

  useEffect(()=>{
    const update=()=>{
      if(!drop?.starts_at){setClock('-- : -- : -- : --');return;}
      const diff=Math.max(0,new Date(drop.starts_at).getTime()-Date.now());
      const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,s=Math.floor(diff/1000)%60;
      setClock(`${String(d).padStart(2,'0')} : ${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`);
    };
    update(); const t=window.setInterval(update,1000); return()=>window.clearInterval(t);
  },[drop]);

  const filtered=useMemo(()=>products.filter(p=>{
    const c=(p.category||'').toLowerCase();
    if(category==='TODOS') return true;
    if(category==='ROUPAS') return isClothing(p);
    if(category==='CALÇADOS') return isFootwear(p);
    if(category==='ACESSÓRIOS') return ['acessorios','acessórios'].includes(c);
    if(category==='NOVIDADES') return products.slice(0,4).some(x=>x.id===p.id);
    return c===category;
  }),[products,category]);

  const addToCart=(p:Product)=>{setCart(items=>{const found=items.find(i=>i.id===p.id);return found?items.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...items,{...p,qty:1}]});setCartOpen(true)};
  const removeFromCart=(id:string)=>setCart(items=>items.filter(i=>i.id!==id));
  const changeQty=(id:string,delta:number)=>setCart(items=>items.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+delta)}:i));
  const subtotal=cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  const upsells=products.filter(p=>!cart.some(i=>i.id===p.id) && (cart.some(i=>isFootwear(i)) ? isClothing(p) : isFootwear(p))).slice(0,2);

  const join=async(e:React.FormEvent)=>{e.preventDefault();setError('');const {error}=await supabase.from('waitlist').insert({drop_id:drop?.id||null,name:form.name,email:form.email||null,whatsapp:form.whatsapp,source:'site',consent:true});if(error){setError(error.code==='23505'?'Você já está no ACCESS deste lançamento.':error.message);return}setSent(true)};

  return <main className="site">
    <header><div className="logo">FEPETO</div><nav><a href="#loja">LOJA</a><a href="#access">ACCESS</a><button className="cartBtn" onClick={()=>setCartOpen(true)}>CARRINHO ({cart.reduce((n,i)=>n+i.qty,0)})</button></nav></header>

    <section className="hero"><p className="eyebrow">VISTA ATITUDE, VISTA FEPETO.</p><h1>IDENTIDADE<br/>QUE SE<br/>SUSTENTA.</h1><p className="lead">Feito de vivência. Feito para quem faz parte.</p><div className="actions"><a href="#loja">VER PRODUTOS</a><a href="#manifesto">MANIFESTO</a></div></section>

    <section className="drop"><span>01 / PRÓXIMO LANÇAMENTO</span><h2>{drop?.name||'PRÓXIMO LANÇAMENTO'}</h2><div className="status">{drop?.status==='LIVE'?'LANÇAMENTO AO VIVO':'PRÉ-LANÇAMENTO'}</div><div className="timer">{clock}</div><small>DIAS · HORAS · MINUTOS · SEGUNDOS</small><p>{drop?.status==='LIVE'?'O lançamento está ao vivo.':'O próximo lançamento acontece em breve.'}</p></section>

    <section id="loja" className="shop"><div className="sectionHead"><span>02 / LOJA</span><h2>PEÇAS FEPETO</h2></div><div className="filters">{['TODOS','ROUPAS','CALÇADOS','ACESSÓRIOS','NOVIDADES'].map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="products">{filtered.map(p=><article className="product" key={p.id}><div className="productImage">{p.image_url?<img src={p.image_url} alt={p.name}/>:<span>FEPETO</span>}</div><div className="productInfo"><span>{pieceLabel(p.category)}</span><h3>{p.name}</h3><p className="story">Feito para acompanhar o caminho. Uma peça FEPETO com identidade própria.</p><strong>R$ {Number(p.price).toFixed(2).replace('.',',')}</strong><button onClick={()=>addToCart(p)}>COMPRAR</button></div></article>)}</div>{filtered.length===0&&<div className="empty">Nenhuma peça encontrada nesta categoria.</div>}</section>

    <section id="manifesto" className="block"><span>03 / MANIFESTO</span><h2>Não representa um.<br/>Representa muitos.</h2><a href="#access">ENTRAR NA FEPETO →</a></section>
    <section className="lookbook"><span>04 / LOOKBOOK</span><div className="look">FEPETO / PRIMEIRO MOVIMENTO</div></section>
    <section id="access" className="access"><span>05 / FEPETO ACCESS</span><h2>Antes de todo mundo.</h2><p>Entre no acesso privado. O próximo lançamento chega primeiro para quem está dentro.</p>{sent?<div className="confirmed">ACESSO REGISTRADO.<br/><small>Você será avisado quando a próxima porta abrir.</small></div>:<form onSubmit={join}><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Seu nome" required/><input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="WhatsApp" required/><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="E-mail"/><button>QUERO ACESSO</button>{error&&<small className="error">{error}</small>}</form>}</section>

    {cartOpen&&<div className="overlay" onClick={()=>setCartOpen(false)}><aside className="cart" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setCartOpen(false)}>FECHAR ×</button><span>06 / CARRINHO</span><h2>SUA COMPRA</h2>{cart.length===0?<p>Seu carrinho está vazio.</p>:<>{cart.map(i=><div className="cartItem" key={i.id}><div><strong>{i.name}</strong><small>R$ {Number(i.price).toFixed(2).replace('.',',')}</small></div><div className="qty"><button onClick={()=>changeQty(i.id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>changeQty(i.id,1)}>+</button><button onClick={()=>removeFromCart(i.id)}>×</button></div></div>)}{upsells.length>0&&<div className="upsell"><span>VOCÊ TAMBÉM PODE GOSTAR</span>{upsells.map(p=><button key={p.id} onClick={()=>addToCart(p)}><b>{p.name}</b><small>R$ {Number(p.price).toFixed(2).replace('.',',')} · ADICIONAR</small></button>)}</div>}<div className="total"><span>SUBTOTAL</span><strong>R$ {subtotal.toFixed(2).replace('.',',')}</strong></div><button className="checkout">FINALIZAR COMPRA</button><small className="paymentNote">Pagamento Mercado Pago será concluído no checkout.</small></>}</aside></div>}

    <footer>© 2026 FEPETO — SÃO PAULO, BR</footer>
  </main>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
