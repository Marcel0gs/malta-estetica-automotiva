/* Loja da Malta: vitrine, busca (produto e serviço), guia por problema, kits,
   serviços por parte do carro, janela do produto com fragrância ou cor, e
   carrinho que fecha no WhatsApp. Os dados vêm de catalogo.js. */
(() => {
  'use strict';
  const C = window.CATALOGO;
  if (!C) return;

  // Pixel do Meta e Google Analytics 4: os códigos vêm do painel (Ajustes, Tráfego pago)
  if (C.loja.pixelMeta && !window.fbq) {
    const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    fbq('init', C.loja.pixelMeta); fbq('track', 'PageView');
  }
  const tagGoogle = C.loja.ga4 || C.loja.adsId;
  if (tagGoogle && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    if (C.loja.ga4) window.gtag('config', C.loja.ga4);
    if (C.loja.adsId) window.gtag('config', C.loja.adsId);
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagGoogle)}`;
    document.head.appendChild(s);
  }

  // De onde a pessoa veio (anúncio, Instagram, Google). Vai junto com o pedido pro painel,
  // que mostra a origem de cada venda. Guarda a última origem conhecida por 30 dias.
  const ORIGEM_CHAVE = 'malta-origem-v1';
  const origemVisita = (() => {
    const q = new URLSearchParams(location.search), o = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid']
      .forEach(k => { const v = q.get(k); if (v) o[k] = v.slice(0, 150); });
    try { const ref = document.referrer ? new URL(document.referrer).hostname : ''; if (ref && ref !== location.hostname) o.ref = ref; } catch (e) { /* sem referrer */ }
    try {
      if (Object.keys(o).length) { o.em = Date.now(); localStorage.setItem(ORIGEM_CHAVE, JSON.stringify(o)); return o; }
      const salvo = JSON.parse(localStorage.getItem(ORIGEM_CHAVE) || 'null');
      if (salvo && Date.now() - salvo.em < 30 * 86400000) return salvo;
    } catch (e) { /* aba privada */ }
    return o;
  })();
  const biscoito = n => (document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')) || [])[1] || '';
  const rastreioPedido = () => {
    const r = { ...origemVisita };
    delete r.em;
    const fbp = biscoito('_fbp'); if (fbp) r.fbp = fbp;
    const fbc = biscoito('_fbc') || (origemVisita.fbclid ? `fb.1.${origemVisita.em || Date.now()}.${origemVisita.fbclid}` : '');
    if (fbc) r.fbc = fbc;
    const ga = biscoito('_ga').split('.').slice(-2).join('.'); if (ga) r.ga = ga;
    r.pagina = location.href.split('#')[0].slice(0, 200);
    return r;
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const porId = new Map(C.produtos.map(p => [p.id, p]));
  const kitPorId = new Map(C.kits.map(k => [k.id, k]));
  const servPorId = new Map(C.servicos.map(s => [s.id, s]));
  const etapaNome = new Map(C.etapas.map(e => [e.id, e.nome]));
  const parteNome = new Map(C.partes.map(p => [p.id, p.nome]));
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icone = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const linkWhats = texto => `https://wa.me/${C.loja.whatsapp}?text=${encodeURIComponent(texto)}`;
  const textoAgendar = s => `Olá, Malta! Vi no site e quero agendar: ${s.popular} (${s.tecnico}). Meu carro é: `;
  const prefereMenos = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Variantes (fragrância ou cor)
  const variante = (p, vId) => (p.variantes ? (p.variantes.find(v => v.id === vId) || p.variantes[0]) : null);
  // Foto: a que o dono subiu pelo painel (endereço completo) ou a que veio com o site
  const imagem = (ref, pasta, ext = 'webp') => (/^https?:\/\//.test(ref) ? ref : `assets/img/${pasta}/${ref}.${ext}`);
  const foto = (p, vId) => {
    const v = variante(p, vId);
    if (v && v.foto) return v.foto;
    if (v && v.img) return imagem(v.img, 'produtos');
    return p.foto || imagem(p.id, 'produtos');
  };
  // Promoção (preço antes) e esgotado vêm do painel
  const temPromo = p => p.precoDe > p.preco;
  const precoHtml = p => (temPromo(p) ? `<s><span class="sr">De </span>${brl(p.precoDe)}</s> <span class="sr">por </span>${brl(p.preco)}` : brl(p.preco));
  const seloFoto = p => (p.esgotado ? '<span class="selo-foto selo-foto--esgotado">Esgotado</span>'
    : temPromo(p) ? `<span class="selo-foto">-${Math.round((1 - p.preco / p.precoDe) * 100)}%</span>` : '');
  const linkAvisar = nome => linkWhats(`Olá, Malta! Vi no site que o ${nome} está esgotado. Me avisa quando chegar?`);
  const primeiraLivre = p => (p.variantes ? (p.variantes.find(v => !v.esgotada) || p.variantes[0]).id : null);
  // Página própria do produto e do kit (é pra onde o anúncio leva)
  const linkPagina = p => `produto.html?p=${encodeURIComponent(p.id)}`;
  const linkKit = k => `produto.html?kit=${encodeURIComponent(k.id)}`;
  const tipoVariante = p => (p.etapas[0] === 'aromatizantes' ? ['fragrância', 'fragrâncias'] : ['cor', 'cores']);

  // Eventos pro tráfego pago, no padrão de cada plataforma:
  //   GA4: view_item, add_to_cart, begin_checkout, generate_lead (pedido enviado), contact, schedule
  //   Meta: ViewContent, AddToCart, InitiateCheckout, Lead (pedido enviado), Contact, Schedule
  //   Google Ads: conversão "pedido enviado" (ID e rótulo nos Ajustes do painel)
  // A venda confirmada (Purchase) vai pelo servidor do painel quando o dono confirma o pedido.
  const META = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', generate_lead: 'Lead', contact: 'Contact', schedule: 'Schedule' };
  const rastrear = (evento, dados = {}) => {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', evento, dados);
      else (window.dataLayer = window.dataLayer || []).push({ event: evento, ...dados });
      const itens = dados.items || [];
      if (META[evento] && typeof window.fbq === 'function') {
        const m = {};
        if (dados.value !== undefined) { m.value = dados.value; m.currency = 'BRL'; }
        if (itens.length) {
          m.content_type = 'product';
          m.content_ids = itens.map(i => i.item_id);
          m.contents = itens.map(i => ({ id: i.item_id, quantity: i.quantity || 1 }));
          m.num_items = itens.reduce((t, i) => t + (i.quantity || 1), 0);
          if (itens.length === 1) m.content_name = itens[0].item_name;
        }
        window.fbq('track', META[evento], m, dados.transaction_id ? { eventID: `pedido-${dados.transaction_id}` } : undefined);
      }
      if (evento === 'generate_lead' && C.loja.adsId && C.loja.adsRotulo && typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', { send_to: `${C.loja.adsId}/${C.loja.adsRotulo}`, value: dados.value, currency: 'BRL', transaction_id: dados.transaction_id });
      }
      // contagem do painel: produto aberto e produto posto no carrinho
      const t = { view_item: 'ver', add_to_cart: 'carrinho' }[evento];
      const id = itens[0] && itens[0].item_id;
      if (C.api && t && id && navigator.sendBeacon) navigator.sendBeacon(`${C.api}/evento`, JSON.stringify({ t, id }));
    } catch (e) { /* rastreio nunca pode travar a compra */ }
  };

  /* ---------- Peças de HTML ---------- */
  const botaoComprar = (p, cls) => p.esgotado
    ? `<a class="${cls} ${cls}--avisar" href="${linkAvisar(p.nome)}" target="_blank" rel="noopener" aria-label="Avisar quando chegar: ${esc(p.nome)}">${icone('whats')}${cls === 'card__add' ? '<span>Me avise</span>' : ''}</a>`
    : p.variantes
    ? `<button class="${cls}" type="button" data-ver="${p.id}" aria-label="Escolher ${tipoVariante(p)[0]} de ${esc(p.nome)}">${icone('mais')}${cls === 'card__add' ? '<span>Escolher</span>' : ''}</button>`
    : `<button class="${cls}" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(p.nome)} ao carrinho">${icone('mais')}${cls === 'card__add' ? '<span>Adicionar</span>' : ''}</button>`;

  const cartao = p => `
    <article class="card">
      <button class="card__foto" type="button" data-ver="${p.id}" aria-label="Ver detalhes: ${esc(p.nome)}">
        <img src="${foto(p)}" alt="" loading="lazy" decoding="async" width="800" height="800">${seloFoto(p)}
      </button>
      <div class="card__info">
        <p class="card__etapa">${esc(etapaNome.get(p.etapas[0]))}</p>
        <h3 class="card__nome"><button type="button" data-ver="${p.id}">${esc(p.nome)}</button></h3>
        <p class="card__medida">${p.variantes ? `${p.variantes.length} ${tipoVariante(p)[1]}` : esc(p.medida)}</p>
        <p class="card__preco">${precoHtml(p)}</p>
        ${botaoComprar(p, 'card__add')}
      </div>
    </article>`;

  const mini = p => `
    <div class="mini">
      <button class="mini__foto" type="button" data-ver="${p.id}" aria-label="Ver detalhes: ${esc(p.nome)}"><img src="${foto(p)}" alt="" loading="lazy" width="800" height="800"></button>
      <p class="mini__nome">${esc(p.nome)}<small>${p.variantes ? `${p.variantes.length} ${tipoVariante(p)[1]}` : esc(p.medida)}</small></p>
      <div class="mini__lado"><span class="mini__preco">${precoHtml(p)}</span>${botaoComprar(p, 'mini__add')}</div>
    </div>`;

  const cartaoServico = (s, destacar) => `
    <article class="servico${s.id === destacar ? ' servico--achado' : ''}" id="serv-${s.id}" tabindex="-1">
      <p class="servico__cuidado servico__cuidado--${norm(s.cuidado)}">${esc(s.cuidado)}</p>
      <h3>${esc(s.popular)}</h3>
      <p class="servico__texto"><strong>${esc(s.tecnico)}.</strong> ${esc(s.texto)}</p>
      <a class="servico__agendar" href="${linkWhats(textoAgendar(s))}" target="_blank" rel="noopener" data-agendar="${s.id}" aria-label="Agendar ${esc(s.tecnico)} pelo WhatsApp">${icone('whats')}Agendar pelo WhatsApp</a>
    </article>`;

  /* ---------- Busca (produtos e serviços) ---------- */
  const SINONIMOS = {
    pretinho: 'pneu', pretinhos: 'pneu', shampoo: 'lava', xampu: 'lava', sabao: 'lava', detergente: 'lava',
    encerar: 'cera', ceras: 'cera', silicone: 'plastic', estofado: 'estofad', estofados: 'estofad', bancos: 'banco',
    rodas: 'roda', vidros: 'vidro', parabrisa: 'vidro', toalhas: 'toalha', pano: 'microfibra', polir: 'poli',
    argila: 'clay', perfume: 'aroma', perfumes: 'aroma', cheirinho: 'aroma', cheirinhos: 'aroma', aromatizante: 'aroma',
    odorizante: 'aroma', odor: 'cheiro', espuma: 'espuma', baldes: 'balde', ar: 'ar', higienizar: 'higieniz'
  };
  const palheiro = new Map(C.produtos.map(p => [p.id, norm([p.nome, p.resumo, p.medida, p.marca,
    ...p.etapas.map(e => etapaNome.get(e)), ...(p.variantes || []).map(v => v.nome)].join(' '))]));
  const palheiroServ = new Map(C.servicos.map(s => [s.id, norm([s.popular, s.tecnico, s.texto, s.termos || '', s.cuidado, parteNome.get(s.parte)].join(' '))]));
  const VAZIAS = new Set(['de', 'do', 'da', 'dos', 'das', 'pra', 'pro', 'para', 'os', 'as', 'com', 'no', 'na', 'nos', 'um', 'uma', 'meu', 'minha', 'que']);
  const bate = (h, q) => {
    const palavras = q.split(/[\s-]+/).filter(w => w.length > 1 && !VAZIAS.has(w));
    return palavras.length > 0 && palavras.every(w => h.includes(w) || (SINONIMOS[w] && h.includes(SINONIMOS[w])));
  };
  const casa = (p, q) => bate(palheiro.get(p.id), q);
  const casaServ = (s, q) => bate(palheiroServ.get(s.id), q);

  /* ---------- Estado da loja ---------- */
  const estado = { etapa: 'todas', ordem: 'destaque', busca: '' };
  const filtros = $('#filtros');
  const campo = $('#busca');
  const listaBusca = $('#busca-lista');
  // A mesma loja.js roda na página inicial e no produto.html
  const paginaLoja = Boolean($('#grade-loja'));
  const naInicial = h => (paginaLoja ? h : `./${h}`);

  const renderLoja = () => {
    if (!paginaLoja) return;
    let lista = C.produtos.slice();
    if (estado.etapa !== 'todas') lista = lista.filter(p => p.etapas.includes(estado.etapa));
    if (estado.busca) { const q = norm(estado.busca); lista = lista.filter(p => casa(p, q)); }
    if (estado.ordem === 'menor') lista.sort((a, b) => a.preco - b.preco);
    else if (estado.ordem === 'maior') lista.sort((a, b) => b.preco - a.preco);
    else if (estado.ordem === 'nome') lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    else lista.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));

    const n = lista.length;
    $('#grade-loja').innerHTML = n ? lista.map(cartao).join('')
      : `<p class="loja__nada">Nada encontrado. Tente outra palavra ou <a href="${linkWhats('Olá, Malta! Procurei no site e não achei: ' + estado.busca)}" target="_blank" rel="noopener">pergunte pra Malta no WhatsApp</a>.</p>`;
    $$('[data-filtro]', filtros).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filtro === estado.etapa)));
    const st = $('#loja-status');
    const qtd = `${n} ${n === 1 ? 'produto' : 'produtos'}`;
    if (estado.busca) st.innerHTML = `${qtd} para "${esc(estado.busca)}".<button type="button" data-limpar-busca>Limpar busca</button>`;
    else st.textContent = estado.etapa === 'todas' ? `${qtd}.` : `${qtd} em ${etapaNome.get(estado.etapa)}.`;
  };

  /* ---------- Montagem inicial ---------- */
  const etapasNav = $('#etapas-nav');
  if (etapasNav) etapasNav.innerHTML = C.etapas.map(e => `<a href="${paginaLoja ? '#loja' : `./?cat=${e.id}#loja`}" data-etapa="${e.id}">${esc(e.nome)}</a>`).join('')
    + `<a href="${naInicial('#kits')}">Kits</a><a href="${naInicial('#guia')}">Não sei o que comprar</a><a href="${naInicial('#estetica')}">Serviços</a>`;

  const gradeDestaques = $('#grade-destaques');
  if (gradeDestaques) gradeDestaques.innerHTML = C.produtos.filter(p => p.destaque).slice(0, 8).map(cartao).join('');

  if (filtros) filtros.innerHTML = [{ id: 'todas', nome: 'Tudo' }, ...C.etapas]
    .map(e => `<button class="chip" type="button" data-filtro="${e.id}" aria-pressed="${e.id === 'todas'}">${esc(e.nome)}</button>`).join('');
  // vindo da página de produto: ?cat=lavagem ou ?busca=cera
  const qInicio = new URLSearchParams(location.search);
  if (paginaLoja && etapaNome.has(qInicio.get('cat'))) estado.etapa = qInicio.get('cat');
  if (paginaLoja && qInicio.get('busca')) { estado.busca = qInicio.get('busca').slice(0, 60); campo.value = estado.busca; }
  renderLoja();
  if (filtros) $$('[data-filtro]', filtros).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filtro === estado.etapa)));

  // Letreiro: a lista vai duas vezes em cada faixa (cobre tela larga) e a segunda faixa repete
  // a primeira pro giro não ter emenda. Leitor de tela lê cada marca uma vez só.
  const letreiro = $('#letreiro');
  if (letreiro) {
    const logo = (m, copia) => `<li${copia ? ' class="copia"' : ''}><img src="${imagem(m.logo, 'marcas', 'svg')}" alt="${copia ? '' : esc(m.nome)}" style="height:${m.altura}px" loading="lazy" decoding="async"></li>`;
    const faixa = C.marcas.map(m => logo(m, false)).join('') + C.marcas.map(m => logo(m, true)).join('');
    letreiro.innerHTML = `<ul class="letreiro__faixa">${faixa}</ul><ul class="letreiro__faixa" aria-hidden="true">${faixa.replace(/alt="[^"]*"/g, 'alt=""')}</ul>`;
  }

  // Categorias com produto em cena (o clique filtra a loja pelo data-etapa)
  const qtdEtapa = id => C.produtos.filter(p => p.etapas.includes(id)).length;
  const listaCat = $('#lista-categorias');
  if (listaCat) listaCat.innerHTML = C.etapas.map(e => `
    <a class="categoria${e.arte ? ' categoria--arte' : ''}" href="#loja" data-etapa="${e.id}">
      ${e.arte ? `<img class="categoria__fundo" src="${imagem(e.arte, 'categorias')}" alt="" width="900" height="600" loading="lazy" decoding="async">` : `
      <span class="categoria__cena" aria-hidden="true">${(e.capa || []).map(c => { const [f, k] = c.split(':'); return `<img src="assets/img/produtos/${f}.webp" alt="" width="800" height="800" loading="lazy" decoding="async"${k ? ` style="--k:${Number(k)}"` : ''}>`; }).join('')}</span>`}
      <span class="categoria__txt"><span class="categoria__nome">${esc(e.nome)}</span><span class="categoria__qtd">${qtdEtapa(e.id)} produtos</span></span>
    </a>`).join('');

  // Kits em banner: arte em cena de um lado, texto e preço do outro
  const somaKit = k => k.itens.reduce((t, id) => t + porId.get(id).preco, 0);
  const curto = p => p.curto || p.nome;
  const listaKits = $('#lista-kits');
  if (listaKits) listaKits.innerHTML = C.kits.map(k => {
    const soma = somaKit(k);
    const arte = k.arte || `assets/img/kits/${k.id}`;
    return `
    <article class="kit-banner kit-banner--${k.lado === 'esq' ? 'esq' : 'dir'}" id="${k.id}" aria-labelledby="t-${k.id}">
      <div class="kit-banner__arte"><img src="${arte}-1000.webp" srcset="${arte}-1000.webp 1000w, ${arte}-2000.webp 2000w" sizes="(min-width: 900px) min(1160px, 94vw), 115vw" width="2000" height="1333" alt="${esc(k.alt || k.nome)}" loading="lazy" decoding="async"></div>
      <div class="kit-banner__texto">
        <p class="kit-banner__selo">Economize ${brl(soma - k.preco)}</p>
        <h3 id="t-${k.id}">${esc(k.nome)}</h3>
        <p class="kit-banner__desc">${esc(k.texto)}</p>
        <ul class="kit-banner__itens" aria-label="O que vem no kit">${k.itens.map(i => { const p = porId.get(i); return `<li><button type="button" data-ver="${p.id}" aria-label="Ver ${esc(p.nome)}"><img src="${foto(p)}" alt="" width="36" height="36" loading="lazy">${esc(curto(p))}</button></li>`; }).join('')}</ul>
        <div class="kit-banner__compra">
          <p class="kit-banner__preco"><s><span class="sr">De </span>${brl(soma)}</s><strong><span class="sr">por </span>${brl(k.preco)}</strong></p>
          ${k.esgotado
            ? `<a class="btn" href="${linkWhats(`Olá, Malta! Quero o ${k.nome}, mas um item dele está esgotado no site. Quando volta?`)}" target="_blank" rel="noopener">${icone('whats')}<span>Perguntar no WhatsApp</span></a>`
            : `<button class="btn" type="button" data-add-kit="${k.id}">${icone('carrinho')}<span>Adicionar kit</span></button>`}
          <a class="kit-banner__pagina" href="${linkKit(k)}">Ver o kit</a>
        </div>
      </div>
    </article>`;
  }).join('');
  // Preço dos kits que aparecem nos banners do topo sai do catálogo
  $$('[data-kit-de]').forEach(el => { const k = kitPorId.get(el.dataset.kitDe); if (k) el.textContent = brl(somaKit(k)); });
  $$('[data-kit-por]').forEach(el => { const k = kitPorId.get(el.dataset.kitPor); if (k) el.textContent = brl(k.preco); });

  // Instagram e rodapé
  const ig = C.instagram;
  const gradeIg = $('#insta-grade');
  if (ig && gradeIg) gradeIg.innerHTML = ig.posts.map(p => `
    <li><a class="insta__post" href="https://www.instagram.com/${p.tipo === 'reel' ? 'reel' : 'p'}/${p.codigo}/" target="_blank" rel="noopener" aria-label="${p.tipo === 'reel' ? 'Vídeo' : 'Foto'} no Instagram: ${esc(p.alt)}">
      <img src="assets/img/instagram/${p.codigo}.webp" alt="" width="540" height="540" loading="lazy" decoding="async">${p.tipo === 'reel' ? icone('play', 'i i--cheio') : ''}
    </a></li>`).join('');
  const rodapeLoja = $('#rodape-loja');
  if (rodapeLoja) rodapeLoja.innerHTML = C.etapas.map(e => `<li><a href="${paginaLoja ? '#loja' : `./?cat=${e.id}#loja`}" data-etapa="${e.id}">${esc(e.nome)}</a></li>`).join('')
    + `<li><a href="${naInicial('#kits')}">Kits prontos</a></li><li><a href="${naInicial('#guia')}">Não sei o que comprar</a></li>`;

  // Serviços por parte do carro
  const abas = $('#partes');
  const painel = $('#lista-servicos');
  if (abas) abas.innerHTML = C.partes.map((pt, i) => `<button type="button" role="tab" id="aba-${pt.id}" aria-controls="lista-servicos" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-parte="${pt.id}">${esc(pt.nome)}</button>`).join('');
  const renderServicos = (parteId, destacar) => {
    if (!abas || !parteId) return;
    $$('[data-parte]', abas).forEach(b => { const on = b.dataset.parte === parteId; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    painel.setAttribute('aria-labelledby', `aba-${parteId}`);
    painel.innerHTML = C.servicos.filter(s => s.parte === parteId).map(s => cartaoServico(s, destacar)).join('');
  };
  if (abas) abas.addEventListener('click', e => { const b = e.target.closest('[data-parte]'); if (b) renderServicos(b.dataset.parte); });
  if (abas) abas.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const bs = $$('[data-parte]', abas), i = bs.indexOf(document.activeElement);
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length;
    e.preventDefault(); bs[j].focus(); renderServicos(bs[j].dataset.parte);
  });
  renderServicos(C.partes[0] && C.partes[0].id);
  const irParaServico = id => {
    const s = servPorId.get(id);
    if (!s) return;
    if (!abas) { location.href = './#estetica'; return; }
    renderServicos(s.parte, id);
    const alvo = $(`#serv-${id}`);
    $('#estetica').scrollIntoView({ behavior: prefereMenos ? 'auto' : 'smooth' });
    if (alvo) setTimeout(() => alvo.focus({ preventScroll: true }), prefereMenos ? 0 : 450);
  };

  // Guia por problema
  const chips = $('#guia-chips');
  if (chips && C.problemas.length) {
  chips.innerHTML = C.problemas.map((pr, i) => `<button class="chip" type="button" data-problema="${pr.id}" aria-pressed="${i === 0}">${esc(pr.nome)}</button>`).join('');
  const renderGuia = id => {
    const pr = C.problemas.find(x => x.id === id);
    if (!pr) return;
    $$('[data-problema]', chips).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.problema === id)));
    const prods = pr.produtos.map(i => porId.get(i));
    const total = prods.reduce((t, p) => t + p.preco, 0);
    const s = servPorId.get(pr.servico);
    $('#guia-resultado').innerHTML = `
      <div>
        <p class="guia__dica">${esc(pr.texto)}</p>
        <div class="guia__produtos">${prods.map(mini).join('')}</div>
        <button class="btn btn--claro guia__todos" type="button" data-add-varios="${pr.produtos.join(',')}">${icone('carrinho')}<span>Adicionar os ${prods.length} por ${brl(total)}</span></button>
      </div>
      ${s ? `<aside class="servico-card" aria-label="Serviço da Malta">
        <p>Prefere que a Malta resolva?</p>
        <h3>${esc(s.popular)}</h3>
        <p class="texto"><strong>${esc(s.tecnico)}.</strong> ${esc(s.texto)}</p>
        <a class="btn" href="${linkWhats(textoAgendar(s))}" target="_blank" rel="noopener" data-agendar="${s.id}">${icone('agenda')}Agendar pelo WhatsApp</a>
      </aside>` : ''}`;
  };
  chips.addEventListener('click', e => { const b = e.target.closest('[data-problema]'); if (b) renderGuia(b.dataset.problema); });
  renderGuia(C.problemas[0].id);
  }

  /* ---------- Sugestões da busca ---------- */
  let ativo = -1;
  const fecharSugestoes = () => {
    listaBusca.hidden = true; campo.setAttribute('aria-expanded', 'false');
    campo.removeAttribute('aria-activedescendant'); ativo = -1;
  };
  const aplicarBusca = () => {
    if (!paginaLoja) { location.href = `./?busca=${encodeURIComponent(campo.value.trim())}#loja`; return; }
    estado.busca = campo.value.trim(); estado.etapa = 'todas';
    renderLoja(); fecharSugestoes();
    $('#loja').scrollIntoView({ behavior: prefereMenos ? 'auto' : 'smooth' });
  };
  const mostrarSugestoes = () => {
    const bruto = campo.value.trim();
    const q = norm(bruto);
    if (q.length < 2) return fecharSugestoes();
    const achados = C.produtos.filter(p => casa(p, q));
    const servs = C.servicos.filter(s => casaServ(s, q)).slice(0, 3);
    let k = 0;
    const itensProd = achados.slice(0, 5).map(p => `<button type="button" class="busca__item" role="option" id="sug-${k++}" aria-selected="false" tabindex="-1" data-ver="${p.id}"><img src="${foto(p)}" alt="" width="48" height="48"><strong>${esc(p.nome)}</strong><span>${brl(p.preco)}</span></button>`).join('');
    const itensServ = servs.map(s => `<button type="button" class="busca__item busca__item--servico" role="option" id="sug-${k++}" aria-selected="false" tabindex="-1" data-servico="${s.id}">${icone('agenda')}<strong>${esc(s.popular)}<small>${esc(s.tecnico)}</small></strong><span>Serviço</span></button>`).join('');
    listaBusca.innerHTML = (achados.length || servs.length)
      ? (itensProd ? `<p class="busca__grupo">Produtos</p>${itensProd}` : '')
        + (achados.length > 5 ? `<button type="button" class="busca__todos" data-aplicar-busca>Ver os ${achados.length} produtos</button>` : '')
        + (itensServ ? `<p class="busca__grupo">Serviços da Malta</p>${itensServ}` : '')
      : `<p class="busca__vazio">Nada com "${esc(bruto)}". Pergunte pra Malta no WhatsApp.</p>`;
    listaBusca.hidden = false; campo.setAttribute('aria-expanded', 'true'); ativo = -1;
  };
  campo.addEventListener('input', mostrarSugestoes);
  campo.addEventListener('focus', () => { if (campo.value.trim().length > 1) mostrarSugestoes(); });
  campo.addEventListener('keydown', e => {
    const itens = $$('.busca__item', listaBusca);
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && itens.length && !listaBusca.hidden) {
      e.preventDefault();
      ativo = (ativo + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length;
      itens.forEach((it, i) => it.setAttribute('aria-selected', String(i === ativo)));
      campo.setAttribute('aria-activedescendant', itens[ativo].id);
      itens[ativo].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (ativo >= 0 && itens[ativo]) itens[ativo].click();
      else aplicarBusca();
    } else if (e.key === 'Escape') fecharSugestoes();
  });
  $('.busca').addEventListener('submit', e => { e.preventDefault(); aplicarBusca(); });

  /* ---------- Janela do produto ---------- */
  const dlgProduto = $('#dlg-produto');
  let produtoAberto = null, qtdProduto = 1, varianteAberta = null;
  const combinaCom = p => {
    const ids = [];
    [...C.kits.map(k => k.itens), ...C.problemas.map(x => x.produtos)].forEach(grupo => {
      if (grupo.includes(p.id)) grupo.forEach(i => { if (i !== p.id && !ids.includes(i)) ids.push(i); });
    });
    C.produtos.forEach(x => { if (x.id !== p.id && !ids.includes(x.id) && x.etapas[0] === p.etapas[0]) ids.push(x.id); });
    return ids.slice(0, 3).map(i => porId.get(i));
  };
  const abrirProduto = id => {
    const p = porId.get(id);
    if (!p) return;
    produtoAberto = p; qtdProduto = 1; varianteAberta = primeiraLivre(p);
    const s = p.servico && servPorId.get(p.servico);
    const combina = combinaCom(p);
    const [tipo1] = tipoVariante(p);
    dlgProduto.innerHTML = `
      <button class="fechar" type="button" data-fechar aria-label="Fechar">${icone('fechar')}</button>
      <div class="produto__grade">
        <div class="produto__foto"><img id="produto-foto" src="${foto(p, varianteAberta)}" alt="${esc(p.nome)}" width="800" height="800">${seloFoto(p)}</div>
        <div class="produto__info">
          <p class="produto__etapa">${esc(p.etapas.map(e => etapaNome.get(e)).join(' e '))}</p>
          <h2 id="produto-nome">${esc(p.nome)}</h2>
          <p class="produto__medida">${esc(p.medida)}, ${esc(p.marca)}</p>
          <p class="produto__resumo">${esc(p.resumo)} <a class="produto__pagina" href="${linkPagina(p)}">Ver tudo sobre o produto</a></p>
          <p class="produto__preco">${precoHtml(p)}</p>
          ${p.variantes ? `<fieldset class="variantes"><legend>Escolha a ${tipo1}</legend>${p.variantes.map(v => `<label class="variante"><input type="radio" name="variante" value="${v.id}"${v.id === varianteAberta ? ' checked' : ''}${v.esgotada ? ' disabled' : ''}><span>${esc(v.nome)}${v.esgotada ? ' (esgotada)' : ''}</span></label>`).join('')}</fieldset>` : ''}
          ${p.esgotado ? `<div class="produto__compra"><a class="btn" id="produto-avisar" href="${linkAvisar(p.nome)}" target="_blank" rel="noopener">${icone('whats')}<span>Avisar quando chegar</span></a></div>` : `
          <div class="produto__compra">
            <div class="qtd" role="group" aria-label="Quantidade">
              <button type="button" data-qtd="-1" aria-label="Diminuir quantidade">${icone('menos')}</button>
              <output id="produto-qtd" aria-live="polite">1</output>
              <button type="button" data-qtd="1" aria-label="Aumentar quantidade">${icone('mais')}</button>
            </div>
            <button class="btn" type="button" id="produto-add">${icone('carrinho')}<span>Adicionar ao carrinho</span></button>
          </div>`}
          ${s ? `<div class="produto__servico"><p>Prefere que a Malta faça por você?<strong>${esc(s.popular)}</strong><small>${esc(s.tecnico)}</small></p><a href="${linkWhats(textoAgendar(s))}" target="_blank" rel="noopener" data-agendar="${s.id}" aria-label="Agendar ${esc(s.tecnico)} pelo WhatsApp">${icone('agenda')}Agendar</a></div>` : ''}
          ${combina.length ? `<div class="produto__combina"><h3>Combina com</h3><div class="guia__produtos">${combina.map(mini).join('')}</div></div>` : ''}
        </div>
      </div>`;
    if (!dlgProduto.open) dlgProduto.showModal();
    dlgProduto.scrollTop = 0;
    ($('#produto-add', dlgProduto) || $('#produto-avisar', dlgProduto)).focus();
    rastrear('view_item', { currency: 'BRL', value: p.preco, items: [{ item_id: p.id, item_name: p.nome, price: p.preco, item_brand: p.marca, item_category: etapaNome.get(p.etapas[0]) }] });
  };
  dlgProduto.addEventListener('change', e => {
    if (e.target.name !== 'variante' || !produtoAberto) return;
    varianteAberta = e.target.value;
    const img = $('#produto-foto', dlgProduto);
    img.src = foto(produtoAberto, varianteAberta);
    img.alt = `${produtoAberto.nome}, ${variante(produtoAberto, varianteAberta).nome}`;
  });
  dlgProduto.addEventListener('click', e => {
    const q = e.target.closest('[data-qtd]');
    if (q) { qtdProduto = Math.max(1, Math.min(20, qtdProduto + Number(q.dataset.qtd))); $('#produto-qtd', dlgProduto).textContent = qtdProduto; return; }
    if (e.target.closest('#produto-add') && produtoAberto) { adicionar('p', produtoAberto.id, qtdProduto, false, varianteAberta); dlgProduto.close(); }
  });

  /* ---------- Carrinho ---------- */
  const CHAVE = 'malta-carrinho-v2';
  const CHAVE_FORM = 'malta-pedido-v1';
  let carrinho = [];
  try {
    carrinho = JSON.parse(localStorage.getItem(CHAVE) || '[]')
      .filter(i => i && i.qtd > 0 && (i.tipo === 'p'
        ? porId.has(i.id) && !porId.get(i.id).esgotado && !(variante(porId.get(i.id), i.v) || {}).esgotada
        : kitPorId.has(i.id) && !kitPorId.get(i.id).esgotado));
  } catch (e) { carrinho = []; }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(carrinho)); } catch (e) { /* aba privada */ } };
  const precoItem = i => (i.tipo === 'p' ? porId.get(i.id) : kitPorId.get(i.id)).preco;
  const nomeItem = i => {
    if (i.tipo === 'k') return kitPorId.get(i.id).nome;
    const p = porId.get(i.id), v = variante(p, i.v);
    return v ? `${p.nome}, ${v.nome}` : p.nome;
  };
  const totalCarrinho = () => carrinho.reduce((t, i) => t + precoItem(i) * i.qtd, 0);
  const qtdCarrinho = () => carrinho.reduce((t, i) => t + i.qtd, 0);
  const itensRastreio = () => carrinho.map(i => ({ item_id: i.id, item_name: nomeItem(i), price: precoItem(i), quantity: i.qtd }));
  let checkoutAvisado = false;

  const toast = $('#toast');
  let tempoToast;
  const avisar = msg => {
    toast.innerHTML = `<span>${esc(msg)}</span><button type="button" data-abrir-carrinho>Ver carrinho</button>`;
    toast.classList.add('on');
    clearTimeout(tempoToast);
    tempoToast = setTimeout(() => toast.classList.remove('on'), 3400);
  };

  const adicionar = (tipo, id, qtd = 1, calado = false, v = null) => {
    if (tipo === 'p') {
      const p = porId.get(id);
      if (p.esgotado) return;
      if (!v && p.variantes) v = primeiraLivre(p);
    } else if (kitPorId.get(id).esgotado) return;
    const it = carrinho.find(i => i.tipo === tipo && i.id === id && (i.v || null) === (v || null));
    if (it) it.qtd = Math.min(99, it.qtd + qtd); else carrinho.push(v ? { tipo, id, v, qtd } : { tipo, id, qtd });
    salvar(); renderCarrinho(true);
    const item = { tipo, id, v };
    rastrear('add_to_cart', { currency: 'BRL', value: precoItem(item) * qtd, items: [{ item_id: id, item_name: nomeItem(item), price: precoItem(item), quantity: qtd }] });
    if (!calado) avisar(`${nomeItem(item)} no carrinho`);
  };

  const confirmar = (botao, texto) => {
    if (botao.dataset.original) return;
    botao.dataset.original = botao.innerHTML;
    botao.classList.add('ok');
    botao.innerHTML = icone('ok') + (texto ? `<span>${esc(texto)}</span>` : '');
    setTimeout(() => { botao.innerHTML = botao.dataset.original; delete botao.dataset.original; botao.classList.remove('ok'); }, 1400);
  };

  const contadores = $$('[data-contador]');
  const lista = $('#itens-carrinho');
  const renderCarrinho = (pulou = false) => {
    const n = qtdCarrinho(), total = totalCarrinho(), rotulo = `${n} ${n === 1 ? 'item' : 'itens'}`;
    contadores.forEach(c => {
      c.textContent = n;
      if (pulou && !prefereMenos) { c.classList.remove('pulou'); void c.offsetWidth; c.classList.add('pulou'); }
    });
    $('.topo__carrinho').setAttribute('aria-label', `Abrir carrinho, ${rotulo}`);
    $('#barra-qtd').textContent = rotulo;
    $('#barra-total').textContent = brl(total);
    $('#barra-carrinho').hidden = n === 0;
    document.body.classList.toggle('tem-barra', n > 0);
    $('#total-carrinho').textContent = brl(total);
    lista.innerHTML = carrinho.map((i, idx) => {
      const ehKit = i.tipo === 'k';
      const k = ehKit && kitPorId.get(i.id);
      const miniatura = ehKit
        ? `<span class="item__kit">${k.itens.slice(0, 4).map(x => `<img src="${foto(porId.get(x))}" alt="">`).join('')}</span>`
        : `<img src="${foto(porId.get(i.id), i.v)}" alt="" width="60" height="60">`;
      const detalhe = ehKit ? k.itens.map(x => porId.get(x).nome.split(' ')[0]).join(', ') : porId.get(i.id).medida;
      return `<li class="item">${miniatura}
        <div><p class="item__nome">${esc(nomeItem(i))}<small>${esc(detalhe)}</small></p>
          <div class="qtd" role="group" aria-label="Quantidade de ${esc(nomeItem(i))}">
            <button type="button" data-item="${idx}" data-delta="-1" aria-label="Diminuir">${icone('menos')}</button>
            <output>${i.qtd}</output>
            <button type="button" data-item="${idx}" data-delta="1" aria-label="Aumentar">${icone('mais')}</button>
          </div></div>
        <div class="item__lado"><span class="item__preco">${brl(precoItem(i) * i.qtd)}</span>
          <button class="item__tirar" type="button" data-tirar="${idx}" aria-label="Tirar ${esc(nomeItem(i))} do carrinho">${icone('lixo')}</button></div>
      </li>`;
    }).join('');
    $('#carrinho-vazio').hidden = n > 0;
    $('#form-pedido').hidden = n === 0;
    $('#enviar-pedido').disabled = n === 0;
  };

  lista.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    let refoco = null;
    if (b.dataset.tirar !== undefined) carrinho.splice(Number(b.dataset.tirar), 1);
    else if (b.dataset.delta) {
      const idx = Number(b.dataset.item), it = carrinho[idx];
      it.qtd += Number(b.dataset.delta);
      if (it.qtd < 1) carrinho.splice(idx, 1);
      else refoco = `[data-item="${idx}"][data-delta="${b.dataset.delta}"]`;
    } else return;
    salvar(); renderCarrinho(); atualizarModo();
    const alvo = (refoco && $(refoco, lista)) || $('.item__tirar', lista) || $('#dlg-carrinho .fechar');
    if (alvo) alvo.focus();
  });

  const dlgCarrinho = $('#dlg-carrinho');
  const abrirCarrinho = () => {
    toast.classList.remove('on');
    if (dlgProduto.open) dlgProduto.close();
    renderCarrinho(); atualizarModo();
    if (carrinho.length && !checkoutAvisado) { checkoutAvisado = true; rastrear('begin_checkout', { currency: 'BRL', value: totalCarrinho(), items: itensRastreio() }); }
    if (!dlgCarrinho.open) dlgCarrinho.showModal();
  };

  // Formulário do pedido (lembra o que a pessoa preencheu)
  const form = $('#form-pedido');
  $('#campo-cidade').innerHTML = C.loja.cidades.map(c => `<option>${esc(c)}</option>`).join('');
  $('#campo-pagamento').innerHTML = C.loja.pagamentos.map(c => `<option>${esc(c)}</option>`).join('');
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_FORM) || '{}');
    Object.entries(salvo).forEach(([k, v]) => {
      const el = form.elements[k];
      if (!el) return;
      if (el instanceof RadioNodeList) Array.from(el).forEach(r => { r.checked = r.value === v; });
      else el.value = v;
    });
  } catch (e) { /* sem memória, segue em branco */ }
  const salvarForm = () => { try { localStorage.setItem(CHAVE_FORM, JSON.stringify(Object.fromEntries(new FormData(form)))); } catch (e) { /* aba privada */ } };
  // Taxa por cidade e entrega grátis vêm do painel (Ajustes). Sem taxa cadastrada, combina no WhatsApp.
  const taxaEntrega = () => {
    if (form.elements.modo.value !== 'entrega') return 0;
    const e = (C.loja.entregas || []).find(x => x.cidade === form.elements.cidade.value);
    if (!e) return null;
    if (C.loja.gratisAcima && totalCarrinho() >= C.loja.gratisAcima) return 0;
    return typeof e.taxa === 'number' ? e.taxa : null;
  };
  const atualizarModo = () => {
    const entrega = form.elements.modo.value === 'entrega';
    $('#campos-entrega').hidden = !entrega;
    const taxa = taxaEntrega(), cidade = form.elements.cidade.value;
    const gratis = C.loja.gratisAcima ? ` Entrega grátis a partir de ${brl(C.loja.gratisAcima)}.` : '';
    $('#nota-entrega').textContent = !entrega
      ? `Retirada na ${C.loja.endereco}.${C.loja.horario ? ` ${C.loja.horario.replace(/\.?$/, '.')}` : ''}`
      : taxa === 0 ? `Entrega grátis em ${cidade}.`
        : taxa ? `Entrega em ${cidade}: ${brl(taxa)}. Total com entrega: ${brl(totalCarrinho() + taxa)}.`
          : `A taxa de entrega é combinada no WhatsApp.${gratis}`;
  };
  form.addEventListener('input', e => { if (e.target.name === 'telefone') $('#erro-telefone').hidden = true; salvarForm(); });
  form.addEventListener('change', e => { if (e.target.name === 'modo' || e.target.name === 'cidade') atualizarModo(); salvarForm(); });
  atualizarModo();

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!carrinho.length) return;
    const d = new FormData(form);
    // WhatsApp do cliente: entra no pedido do painel, e quem desistir antes de enviar vira contato
    const telefone = String(d.get('telefone') || '').replace(/\D/g, '');
    if (telefone.length < 10 || telefone.length > 13) {
      $('#erro-telefone').hidden = false;
      form.elements.telefone.focus();
      return;
    }
    $('#erro-telefone').hidden = true;
    const entrega = d.get('modo') === 'entrega';
    const bairro = String(d.get('bairro') || '').trim();
    const nome = String(d.get('nome') || '').trim();
    // código curto que vai na mensagem e no painel, pra ligar a conversa ao pedido
    const codigo = Array.from(crypto.getRandomValues(new Uint8Array(4)), n => 'ACDEFGHJKMNPQRTUVWXY34679'[n % 25]).join('');
    const taxa = taxaEntrega();
    const linhas = carrinho.map(i => `${i.qtd}x ${nomeItem(i)}${i.tipo === 'p' ? ` (${porId.get(i.id).medida})` : ''}: ${brl(precoItem(i) * i.qtd)}`);
    const msg = [
      `Olá, Malta! Quero fazer este pedido pelo site (pedido ${codigo}):`,
      '',
      ...linhas,
      '',
      `Total dos produtos: ${brl(totalCarrinho())}`,
      ...(entrega && typeof taxa === 'number' ? [taxa ? `Entrega: ${brl(taxa)}` : 'Entrega grátis', `Total com entrega: ${brl(totalCarrinho() + taxa)}`] : []),
      entrega ? `Entrega em ${d.get('cidade')}${bairro ? `, bairro ${bairro}` : ''}` : 'Vou retirar na Malta',
      `Pagamento: ${d.get('pagamento')}`,
      ...(nome ? [`Nome: ${nome}`] : [])
    ].join('\n').replace(/ /g, ' ');
    rastrear('generate_lead', { currency: 'BRL', value: totalCarrinho(), transaction_id: codigo, items: itensRastreio() });
    // registra no painel sem esperar: o WhatsApp abre na hora, com ou sem o painel no ar
    if (C.api) {
      try {
        fetch(`${C.api}/pedido`, {
          method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ codigo, itens: carrinho, modo: d.get('modo'), cidade: d.get('cidade'), bairro, pagamento: d.get('pagamento'), nome, telefone, rastreio: rastreioPedido() })
        }).catch(() => {});
      } catch (e) { /* o pedido segue pelo WhatsApp de qualquer jeito */ }
    }
    window.open(linkWhats(msg), '_blank', 'noopener');
    // Agradecimento no lugar do formulário, com o link de novo caso o navegador bloqueie a janela
    $('#obrigado-whats').href = linkWhats(msg);
    $('#obrigado').hidden = false;
    dlgCarrinho.classList.add('is-obrigado');
  });

  /* ---------- Cliques da página toda ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    if (!t.closest('.busca')) fecharSugestoes();
    const zap = t.closest('a[href*="wa.me"]');
    if (zap && !zap.hasAttribute('data-agendar') && zap.id !== 'obrigado-whats') rastrear('contact', { metodo: 'whatsapp' });

    const serv = t.closest('[data-servico]');
    if (serv) { fecharSugestoes(); irParaServico(serv.dataset.servico); return; }
    const ver = t.closest('[data-ver]');
    if (ver) { fecharSugestoes(); abrirProduto(ver.dataset.ver); return; }
    const add = t.closest('[data-add]');
    if (add) { adicionar('p', add.dataset.add); confirmar(add, add.classList.contains('card__add') ? 'No carrinho' : ''); return; }
    const kit = t.closest('[data-add-kit]');
    if (kit) { adicionar('k', kit.dataset.addKit); confirmar(kit, 'Kit no carrinho'); return; }
    const varios = t.closest('[data-add-varios]');
    if (varios) {
      const ids = varios.dataset.addVarios.split(',');
      ids.forEach(id => adicionar('p', id, 1, true));
      avisar(`${ids.length} produtos no carrinho`);
      confirmar(varios, 'No carrinho');
      return;
    }
    if (t.closest('[data-aplicar-busca]')) { aplicarBusca(); return; }
    if (t.closest('[data-limpar-busca]')) { estado.busca = ''; campo.value = ''; renderLoja(); return; }
    const etapa = t.closest('[data-etapa]');
    if (etapa && paginaLoja) { estado.etapa = etapa.dataset.etapa; estado.busca = ''; campo.value = ''; renderLoja(); return; }
    const filtro = t.closest('[data-filtro]');
    if (filtro) { estado.etapa = filtro.dataset.filtro; renderLoja(); return; }
    const agendar = t.closest('[data-agendar]');
    if (agendar) { rastrear('schedule', { servico: agendar.dataset.agendar }); return; }
    if (t.closest('[data-abrir-carrinho]')) { abrirCarrinho(); return; }
    const fechar = t.closest('[data-fechar]');
    if (fechar) {
      const d = fechar.closest('dialog');
      if (d) d.close();
      if (fechar.dataset.ir) { const alvo = $(fechar.dataset.ir); if (alvo) alvo.scrollIntoView({ behavior: prefereMenos ? 'auto' : 'smooth' }); }
    }
  });

  // Carrinho fechado volta ao normal pra próxima compra
  dlgCarrinho.addEventListener('close', () => { dlgCarrinho.classList.remove('is-obrigado'); $('#obrigado').hidden = true; });

  // Clique fora da janela fecha
  [dlgProduto, dlgCarrinho].forEach(d => d.addEventListener('click', e => {
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  }));

  const ordem = $('#ordem');
  if (ordem) ordem.addEventListener('change', e => { estado.ordem = e.target.value; renderLoja(); });

  renderCarrinho();

  /* ---------- Página própria do produto e do kit: produto.html?p=<id> ou ?kit=<id> ----------
     É pra onde o anúncio leva. Mesmo carrinho, mesmo checkout e mesmo rastreio da loja.
     A descrição completa vem do painel: linha em branco separa parágrafo, "## " vira
     subtítulo, "- " vira item de lista e **texto** fica em negrito. */
  const textoRico = t => {
    const negrito = x => x.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    let html = '', itens = [], par = [];
    const fecharPar = () => { if (par.length) { html += `<p>${negrito(esc(par.join(' ')))}</p>`; par = []; } };
    const fecharLista = () => { if (itens.length) { html += `<ul>${itens.map(l => `<li>${negrito(esc(l))}</li>`).join('')}</ul>`; itens = []; } };
    String(t || '').replace(/\r/g, '').split('\n').forEach(l => {
      const x = l.trim();
      if (!x) { fecharPar(); fecharLista(); return; }
      if (/^##\s+/.test(x)) { fecharPar(); fecharLista(); html += `<h3>${esc(x.replace(/^##\s+/, ''))}</h3>`; return; }
      if (/^[-•]\s+/.test(x)) { fecharPar(); itens.push(x.replace(/^[-•]\s+/, '')); return; }
      fecharLista(); par.push(x);
    });
    fecharPar(); fecharLista();
    return html;
  };
  const paginaProduto = $('#pagina-produto');
  if (paginaProduto) {
    const definirMeta = (titulo, descricao) => {
      document.title = `${titulo} | Malta Estética Automotiva`;
      const d = $('meta[name="description"]');
      if (d && descricao) d.setAttribute('content', descricao);
    };
    const garantias = nome => {
      const ents = (C.loja.entregas || []).map(e => `${e.cidade}${typeof e.taxa === 'number' ? (e.taxa ? ` (${brl(e.taxa)})` : ' (grátis)') : ''}`);
      const combinar = (C.loja.entregas || []).some(e => typeof e.taxa !== 'number');
      return `<ul class="pp__garantias">
        ${ents.length ? `<li>${icone('entrega')}<span><strong>Entrega em ${esc(ents.join(', '))}</strong>${C.loja.gratisAcima ? ` Grátis a partir de ${brl(C.loja.gratisAcima)}.` : ''}${combinar ? ' Onde não tem valor, a taxa é combinada no WhatsApp.' : ''}</span></li>` : ''}
        <li>${icone('local')}<span><strong>Retirada na Malta</strong> ${esc(C.loja.endereco)}.${C.loja.horario ? ` ${esc(C.loja.horario.replace(/\.?$/, '.'))}` : ''}</span></li>
        <li>${icone('whats')}<span><strong>Dúvida antes de comprar?</strong> <a href="${linkWhats(`Olá, Malta! Tenho uma dúvida sobre o ${nome}.`)}" target="_blank" rel="noopener">Pergunte no WhatsApp</a></span></li>
      </ul>`;
    };
    const pagamento = () => `<p class="pp__pagamento">${esc(C.loja.pagamentos.join(', '))}. Você escolhe no carrinho e acerta com a Malta no WhatsApp.</p>`;
    const dadosLd = obj => {
      const ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify(obj);
      document.head.appendChild(ld);
    };
    // barra de compra fixa no celular, quando o botão principal sai da tela
    const barraFixa = (nome, preco, rotulo, aoTocar) => {
      const fixa = $('#compra-fixa'), alvo = $('#pp-compra');
      if (!fixa || !alvo) return;
      fixa.innerHTML = `<p class="compra-fixa__preco"><span>${esc(nome)}</span><strong>${brl(preco)}</strong></p><button class="btn" type="button">${icone('carrinho')}<span>${rotulo}</span></button>`;
      $('button', fixa).addEventListener('click', aoTocar);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([en]) => { fixa.hidden = en.isIntersecting || en.boundingClientRect.top > 0; }).observe(alvo);
      }
    };
    const cartaoKit = k => `<a class="pp-kit" href="${linkKit(k)}"><img src="${k.arte || `assets/img/kits/${k.id}`}-1000.webp" alt="" width="1000" height="667" loading="lazy">
      <span><strong>${esc(k.nome)}</strong><span>${k.itens.length} produtos por ${brl(k.preco)}</span></span></a>`;

    const montarProduto = p => {
      const etapa = p.etapas[0];
      const s = p.servico && servPorId.get(p.servico);
      const kitsCom = C.kits.filter(k => k.itens.includes(p.id));
      const combina = combinaCom(p);
      const economia = temPromo(p) ? p.precoDe - p.preco : 0;
      const comFoto = p.variantes && p.variantes.some(v => v.foto || v.img);
      let qtd = 1;
      const vEscolhida = () => { const r = $('input[name="pp-variante"]:checked', paginaProduto); return r ? r.value : primeiraLivre(p); };
      const nomesEtapas = p.etapas.map(e => etapaNome.get(e)).join(', ');
      const ficha = [['Marca', p.marca], ['Medida', p.medida], ['Categoria', nomesEtapas],
        [p.variantes ? (tipoVariante(p)[1].charAt(0).toUpperCase() + tipoVariante(p)[1].slice(1)) : '', p.variantes ? p.variantes.map(v => v.nome).join(', ') : '']]
        .filter(([a, b]) => a && b);
      definirMeta(p.nome, p.resumo);
      paginaProduto.innerHTML = `
        <nav class="migalhas" aria-label="Você está em"><a href="./">Início</a><span aria-hidden="true">/</span><a href="./?cat=${etapa}#loja">${esc(etapaNome.get(etapa))}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.curto || p.nome)}</span></nav>
        <div class="pp">
          <div class="pp__galeria">
            <div class="pp__foto">${seloFoto(p)}<img id="pp-foto" src="${foto(p, primeiraLivre(p))}" alt="${esc(p.nome)}" width="800" height="800"></div>
            ${comFoto ? `<div class="pp__miniaturas" role="group" aria-label="Fotos de cada ${tipoVariante(p)[0]}">${p.variantes.map(v => `<button type="button" data-pp-v="${v.id}" aria-label="Ver ${esc(v.nome)}"><img src="${foto(p, v.id)}" alt="" width="80" height="80" loading="lazy"></button>`).join('')}</div>` : ''}
          </div>
          <div class="pp__info">
            <p class="pp__etapa">${esc(nomesEtapas)}</p>
            <h1 class="pp__nome">${esc(p.nome)}</h1>
            <p class="pp__medida">${esc([p.medida, p.marca].filter(Boolean).join(', '))}</p>
            <div class="pp__preco">${temPromo(p) ? `<s><span class="sr">De </span>${brl(p.precoDe)}</s>` : ''}<strong>${temPromo(p) ? '<span class="sr">por </span>' : ''}${brl(p.preco)}</strong>${economia ? `<span class="pp__economia">Economize ${brl(economia)}</span>` : ''}</div>
            ${pagamento()}
            ${p.restam && !p.esgotado ? `<p class="pp__restam">Restam só ${p.restam} ${p.restam === 1 ? 'unidade' : 'unidades'}</p>` : ''}
            <p class="pp__resumo">${esc(p.resumo)}</p>
            ${p.variantes ? `<fieldset class="variantes"><legend>Escolha a ${tipoVariante(p)[0]}</legend>${p.variantes.map(v => `<label class="variante"><input type="radio" name="pp-variante" value="${v.id}"${v.id === primeiraLivre(p) ? ' checked' : ''}${v.esgotada ? ' disabled' : ''}><span>${esc(v.nome)}${v.esgotada ? ' (esgotada)' : ''}</span></label>`).join('')}</fieldset>` : ''}
            <div class="pp__compra" id="pp-compra">${p.esgotado
              ? `<a class="btn" href="${linkAvisar(p.nome)}" target="_blank" rel="noopener">${icone('whats')}<span>Avisar quando chegar</span></a>`
              : `<div class="qtd" role="group" aria-label="Quantidade"><button type="button" data-pp-qtd="-1" aria-label="Diminuir quantidade">${icone('menos')}</button><output id="pp-qtd" aria-live="polite">1</output><button type="button" data-pp-qtd="1" aria-label="Aumentar quantidade">${icone('mais')}</button></div>
                 <button class="btn btn--claro" type="button" data-pp-add>${icone('carrinho')}<span>Adicionar ao carrinho</span></button>
                 <button class="btn pp__agora" type="button" data-pp-agora><span>Comprar agora</span></button>`}</div>
            ${garantias(p.nome)}
          </div>
        </div>
        <section class="pp__secao pp__descricao" aria-labelledby="pp-sobre"><h2 id="pp-sobre">Sobre o produto</h2>
          <div class="pp__texto">${p.descricao ? textoRico(p.descricao) : `<p>${esc(p.resumo)}</p>`}</div>
          ${ficha.length ? `<dl class="pp__ficha">${ficha.map(([a, b]) => `<div><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>` : ''}
        </section>
        ${s ? `<section class="pp__secao"><div class="produto__servico"><p>Prefere que a Malta faça por você?<strong>${esc(s.popular)}</strong><small>${esc(s.tecnico)}</small></p><a href="${linkWhats(textoAgendar(s))}" target="_blank" rel="noopener" data-agendar="${s.id}">${icone('agenda')}Agendar</a></div></section>` : ''}
        ${kitsCom.length ? `<section class="pp__secao" aria-labelledby="pp-kits"><h2 id="pp-kits">Também vem nestes kits</h2><div class="pp__kits">${kitsCom.map(cartaoKit).join('')}</div></section>` : ''}
        ${combina.length ? `<section class="pp__secao" aria-labelledby="pp-combina"><h2 id="pp-combina">Combina com</h2><div class="grade">${combina.map(cartao).join('')}</div></section>` : ''}`;
      const fotoEl = $('#pp-foto');
      paginaProduto.addEventListener('change', e => { if (e.target.name === 'pp-variante') fotoEl.src = foto(p, e.target.value); });
      paginaProduto.addEventListener('click', e => {
        const t = e.target;
        const v = t.closest('[data-pp-v]');
        if (v) {
          fotoEl.src = foto(p, v.dataset.ppV);
          const r = $(`input[name="pp-variante"][value="${v.dataset.ppV}"]`, paginaProduto);
          if (r && !r.disabled) r.checked = true;
          return;
        }
        const dq = t.closest('[data-pp-qtd]');
        if (dq) { qtd = Math.max(1, Math.min(20, qtd + Number(dq.dataset.ppQtd))); $('#pp-qtd').textContent = qtd; return; }
        if (t.closest('[data-pp-add]')) { adicionar('p', p.id, qtd, false, vEscolhida()); return; }
        if (t.closest('[data-pp-agora]')) { adicionar('p', p.id, qtd, true, vEscolhida()); abrirCarrinho(); }
      });
      if (!p.esgotado) barraFixa(p.curto || p.nome, p.preco, 'Adicionar', () => adicionar('p', p.id, qtd, false, vEscolhida()));
      dadosLd({
        '@context': 'https://schema.org', '@type': 'Product', name: p.nome, description: p.resumo,
        image: new URL(foto(p), location.href).href, ...(p.marca ? { brand: { '@type': 'Brand', name: p.marca } } : {}),
        offers: { '@type': 'Offer', priceCurrency: 'BRL', price: p.preco.toFixed(2), url: location.href,
          availability: `https://schema.org/${p.esgotado ? 'OutOfStock' : 'InStock'}` },
      });
      rastrear('view_item', { currency: 'BRL', value: p.preco, items: [{ item_id: p.id, item_name: p.nome, price: p.preco, item_brand: p.marca, item_category: etapaNome.get(etapa) }] });
    };

    const montarKit = k => {
      const itens = k.itens.map(i => porId.get(i));
      const soma = itens.reduce((t, x) => t + x.preco, 0);
      const arte = k.arte || `assets/img/kits/${k.id}`;
      definirMeta(k.nome, k.texto);
      paginaProduto.innerHTML = `
        <nav class="migalhas" aria-label="Você está em"><a href="./">Início</a><span aria-hidden="true">/</span><a href="./#kits">Kits</a><span aria-hidden="true">/</span><span aria-current="page">${esc(k.nome)}</span></nav>
        <div class="pp pp--kit">
          <div class="pp__galeria"><div class="pp__foto pp__foto--kit"><img src="${arte}-1000.webp" srcset="${arte}-1000.webp 1000w, ${arte}-2000.webp 2000w" sizes="(min-width: 900px) 640px, 100vw" alt="${esc(k.alt || k.nome)}" width="2000" height="1333"></div></div>
          <div class="pp__info">
            <p class="pp__etapa">Kit com ${itens.length} produtos</p>
            <h1 class="pp__nome">${esc(k.nome)}</h1>
            <div class="pp__preco">${soma > k.preco ? `<s><span class="sr">Separados </span>${brl(soma)}</s>` : ''}<strong>${soma > k.preco ? '<span class="sr">no kit </span>' : ''}${brl(k.preco)}</strong>${soma > k.preco ? `<span class="pp__economia">Economize ${brl(soma - k.preco)}</span>` : ''}</div>
            ${pagamento()}
            <p class="pp__resumo">${esc(k.texto)}</p>
            <div class="pp__compra" id="pp-compra">${k.esgotado
              ? `<a class="btn" href="${linkWhats(`Olá, Malta! Quero o ${k.nome}, mas um item dele está esgotado no site. Quando volta?`)}" target="_blank" rel="noopener">${icone('whats')}<span>Perguntar no WhatsApp</span></a>`
              : `<button class="btn btn--claro" type="button" data-pp-add>${icone('carrinho')}<span>Adicionar kit</span></button>
                 <button class="btn pp__agora" type="button" data-pp-agora><span>Comprar agora</span></button>`}</div>
            ${garantias(k.nome)}
          </div>
        </div>
        <section class="pp__secao" aria-labelledby="pp-itens"><h2 id="pp-itens">O que vem no kit</h2><div class="grade">${itens.map(cartao).join('')}</div></section>`;
      paginaProduto.addEventListener('click', e => {
        if (e.target.closest('[data-pp-add]')) { adicionar('k', k.id); return; }
        if (e.target.closest('[data-pp-agora]')) { adicionar('k', k.id, 1, true); abrirCarrinho(); }
      });
      if (!k.esgotado) barraFixa(k.nome, k.preco, 'Adicionar kit', () => adicionar('k', k.id));
      dadosLd({
        '@context': 'https://schema.org', '@type': 'Product', name: k.nome, description: k.texto,
        image: new URL(`${arte}-1000.webp`, location.href).href,
        offers: { '@type': 'Offer', priceCurrency: 'BRL', price: k.preco.toFixed(2), url: location.href,
          availability: `https://schema.org/${k.esgotado ? 'OutOfStock' : 'InStock'}` },
      });
      rastrear('view_item', { currency: 'BRL', value: k.preco, items: [{ item_id: k.id, item_name: k.nome, price: k.preco, item_category: 'Kits' }] });
    };

    const q = new URLSearchParams(location.search);
    const prod = porId.get(q.get('p') || ''), kitAberto = kitPorId.get(q.get('kit') || '');
    if (prod) montarProduto(prod);
    else if (kitAberto) montarKit(kitAberto);
    else paginaProduto.innerHTML = '<div class="pp-vazio"><h1>Produto não encontrado</h1><p>Ele pode ter saído da loja. Veja o que tem agora:</p><a class="btn" href="./#loja">Ver todos os produtos</a></div>';
  }

  /* ---------- Atendimento no WhatsApp: sai do caminho dos botões do topo ----------
     O botão fica no canto de baixo da tela. Enquanto os botões de algum banner passam pela faixa
     de baixo (os 18% finais da tela), ele some, senão cobre o "Agendar estética" no celular. */
  const whats = $('.whats-flutuante'), botoesTopo = $$('.slide__acoes');
  if (whats && botoesTopo.length && 'IntersectionObserver' in window) {
    const naFaixa = new Set();
    whats.classList.add('is-escondido');
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(en => en.isIntersecting ? naFaixa.add(en.target) : naFaixa.delete(en.target));
      whats.classList.toggle('is-escondido', naFaixa.size > 0);
    }, { rootMargin: '-82% 0px 0px 0px' });
    botoesTopo.forEach(el => obs.observe(el));
  }

  /* ---------- Topo: rodízio de banners ---------- */
  const topo = $('#vitrine-topo');
  const slides = topo ? $$('.slide', topo) : [];
  if (slides.length > 1) {
    const TEMPO = 7000;
    const pontos = $('#topo-pontos');
    const botaoPausa = $('#topo-pausa');
    let atual = 0, timer = 0, restante = TEMPO, inicio = 0;
    const pausas = new Set();
    topo.style.setProperty('--tempo', `${TEMPO}ms`);

    // Banner fora da tela não baixa nada: o data-src vira src quando ele é o próximo
    const hidratar = s => $$('[data-src], [data-srcset]', s).forEach(el => {
      if (el.dataset.srcset) { el.srcset = el.dataset.srcset; delete el.dataset.srcset; }
      if (el.dataset.src) { el.src = el.dataset.src; delete el.dataset.src; }
    });

    pontos.innerHTML = slides.map((s, i) => `<button type="button" class="ponto" data-ir-slide="${i}" aria-label="Banner ${i + 1} de ${slides.length}: ${esc(s.dataset.nome || '')}"${i === 0 ? ' aria-current="true"' : ''}><span></span></button>`).join('');

    const agendar = () => {
      clearTimeout(timer);
      if (pausas.size) return;
      inicio = performance.now();
      timer = setTimeout(() => mostrar(atual + 1), restante);
    };
    const mostrar = i => {
      i = (i + slides.length) % slides.length;
      if (i !== atual) {
        hidratar(slides[i]);
        const antigo = slides[atual];
        antigo.classList.remove('is-ativo'); antigo.inert = true; antigo.setAttribute('aria-hidden', 'true');
        slides[i].classList.add('is-ativo'); slides[i].inert = false; slides[i].removeAttribute('aria-hidden');
        atual = i;
        $$('.ponto', pontos).forEach((p, j) => { if (j === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current'); });
      }
      hidratar(slides[(i + 1) % slides.length]);
      restante = TEMPO;
      agendar();
    };
    const pausar = motivo => {
      if (!pausas.size) { clearTimeout(timer); restante = Math.max(400, restante - (performance.now() - inicio)); }
      pausas.add(motivo);
      topo.classList.add('pausado');
    };
    const seguir = motivo => {
      if (!pausas.delete(motivo) || pausas.size) return;
      topo.classList.remove('pausado');
      agendar();
    };
    const marcarBotao = parado => {
      botaoPausa.setAttribute('aria-label', parado ? 'Continuar banners' : 'Pausar banners');
      $('use', botaoPausa).setAttribute('href', parado ? '#i-play' : '#i-pausa');
      topo.classList.toggle('parado', parado);
    };

    pontos.addEventListener('click', e => { const b = e.target.closest('[data-ir-slide]'); if (b) mostrar(Number(b.dataset.irSlide)); });
    $$('[data-passo]', topo).forEach(b => b.addEventListener('click', () => mostrar(atual + Number(b.dataset.passo))));
    botaoPausa.addEventListener('click', () => {
      // a barra do ponto recomeça do zero ao voltar, então o tempo também recomeça
      if (pausas.has('botao')) { marcarBotao(false); restante = TEMPO; seguir('botao'); } else { pausar('botao'); marcarBotao(true); }
    });
    // Para enquanto o mouse está em cima, com foco dentro, fora da tela ou com a aba escondida
    if (matchMedia('(hover: hover)').matches) {
      topo.addEventListener('mouseenter', () => pausar('mouse'));
      topo.addEventListener('mouseleave', () => seguir('mouse'));
    }
    // Só o foco de teclado para o rodízio: clique de mouse num ponto não deve travar tudo
    topo.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) pausar('foco'); });
    topo.addEventListener('focusout', e => { if (!topo.contains(e.relatedTarget)) seguir('foco'); });
    document.addEventListener('visibilitychange', () => (document.hidden ? pausar('aba') : seguir('aba')));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => (en.isIntersecting ? seguir('fora') : pausar('fora')), { threshold: 0.35 }).observe(topo);
    }
    // Arrastar pro lado no celular
    let toque = null;
    const trilho = $('#topo-trilho');
    trilho.addEventListener('pointerdown', e => { toque = { x: e.clientX, y: e.clientY }; });
    trilho.addEventListener('pointerup', e => {
      if (!toque) return;
      const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
      toque = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) mostrar(atual + (dx < 0 ? 1 : -1));
    });
    trilho.addEventListener('pointercancel', () => { toque = null; });

    // Quem pede menos movimento começa com o rodízio parado
    if (prefereMenos) { pausas.add('botao'); marcarBotao(true); }
    addEventListener('load', () => setTimeout(() => hidratar(slides[1]), 300), { once: true });
    agendar();
  }

  /* ---------- Topo: parallax leve da arte no computador ---------- */
  if (topo && !prefereMenos && matchMedia('(min-width: 900px)').matches) {
    let quadro = 0;
    const mover = () => {
      quadro = 0;
      const y = window.scrollY;
      if (y < topo.offsetHeight + 120) topo.style.setProperty('--desce', `${(y * 0.22).toFixed(1)}px`);
    };
    addEventListener('scroll', () => { if (!quadro) quadro = requestAnimationFrame(mover); }, { passive: true });
  }
})();
