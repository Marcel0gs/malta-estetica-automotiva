/* Loja da Malta: vitrine, busca (produto e serviço), guia por problema, kits,
   serviços por parte do carro, janela do produto com fragrância ou cor, e
   carrinho que fecha no WhatsApp. Os dados vêm de catalogo.js. */
(() => {
  'use strict';
  const C = window.CATALOGO;
  if (!C) return;

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
  const foto = (p, vId) => { const v = variante(p, vId); return `assets/img/produtos/${(v && v.img) || p.id}.webp`; };
  const tipoVariante = p => (p.etapas[0] === 'aromatizantes' ? ['fragrância', 'fragrâncias'] : ['cor', 'cores']);

  // Eventos pro tráfego pago: alimentam o GA4 (dataLayer) e o Pixel da Meta quando forem instalados.
  const rastrear = (evento, dados = {}) => {
    try {
      (window.dataLayer = window.dataLayer || []).push({ event: evento, ...dados });
      const meta = { add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', view_item: 'ViewContent', schedule: 'Schedule' }[evento];
      if (meta && typeof window.fbq === 'function') window.fbq('track', meta, { value: dados.value, currency: 'BRL' });
    } catch (e) { /* rastreio nunca pode travar a compra */ }
  };

  /* ---------- Peças de HTML ---------- */
  const botaoComprar = (p, cls) => p.variantes
    ? `<button class="${cls}" type="button" data-ver="${p.id}" aria-label="Escolher ${tipoVariante(p)[0]} de ${esc(p.nome)}">${icone('mais')}${cls === 'card__add' ? '<span>Escolher</span>' : ''}</button>`
    : `<button class="${cls}" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(p.nome)} ao carrinho">${icone('mais')}${cls === 'card__add' ? '<span>Adicionar</span>' : ''}</button>`;

  const cartao = p => `
    <article class="card">
      <button class="card__foto" type="button" data-ver="${p.id}" aria-label="Ver detalhes: ${esc(p.nome)}">
        <img src="${foto(p)}" alt="" loading="lazy" decoding="async" width="800" height="800">
      </button>
      <div class="card__info">
        <p class="card__etapa">${esc(etapaNome.get(p.etapas[0]))}</p>
        <h3 class="card__nome"><button type="button" data-ver="${p.id}">${esc(p.nome)}</button></h3>
        <p class="card__medida">${p.variantes ? `${p.variantes.length} ${tipoVariante(p)[1]}` : esc(p.medida)}</p>
        <p class="card__preco">${brl(p.preco)}</p>
        ${botaoComprar(p, 'card__add')}
      </div>
    </article>`;

  const mini = p => `
    <div class="mini">
      <button class="mini__foto" type="button" data-ver="${p.id}" aria-label="Ver detalhes: ${esc(p.nome)}"><img src="${foto(p)}" alt="" loading="lazy" width="800" height="800"></button>
      <p class="mini__nome">${esc(p.nome)}<small>${p.variantes ? `${p.variantes.length} ${tipoVariante(p)[1]}` : esc(p.medida)}</small></p>
      <div class="mini__lado"><span class="mini__preco">${brl(p.preco)}</span>${botaoComprar(p, 'mini__add')}</div>
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

  const renderLoja = () => {
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
  $('#etapas-nav').innerHTML = C.etapas.map(e => `<a href="#loja" data-etapa="${e.id}">${esc(e.nome)}</a>`).join('')
    + '<a href="#kits">Kits</a><a href="#guia">Não sei o que comprar</a><a href="#estetica">Serviços</a>';

  $('#grade-destaques').innerHTML = C.produtos.filter(p => p.destaque).slice(0, 8).map(cartao).join('');

  filtros.innerHTML = [{ id: 'todas', nome: 'Tudo' }, ...C.etapas]
    .map(e => `<button class="chip" type="button" data-filtro="${e.id}" aria-pressed="${e.id === 'todas'}">${esc(e.nome)}</button>`).join('');
  renderLoja();

  // Letreiro: a lista vai duas vezes em cada faixa (cobre tela larga) e a segunda faixa repete
  // a primeira pro giro não ter emenda. Leitor de tela lê cada marca uma vez só.
  const letreiro = $('#letreiro');
  if (letreiro) {
    const logo = (m, copia) => `<li${copia ? ' class="copia"' : ''}><img src="assets/img/marcas/${m.logo}.svg" alt="${copia ? '' : esc(m.nome)}" style="height:${m.altura}px" loading="lazy" decoding="async"></li>`;
    const faixa = C.marcas.map(m => logo(m, false)).join('') + C.marcas.map(m => logo(m, true)).join('');
    letreiro.innerHTML = `<ul class="letreiro__faixa">${faixa}</ul><ul class="letreiro__faixa" aria-hidden="true">${faixa.replace(/alt="[^"]*"/g, 'alt=""')}</ul>`;
  }

  // Categorias com produto em cena (o clique filtra a loja pelo data-etapa)
  const qtdEtapa = id => C.produtos.filter(p => p.etapas.includes(id)).length;
  const listaCat = $('#lista-categorias');
  if (listaCat) listaCat.innerHTML = C.etapas.map(e => `
    <a class="categoria" href="#loja" data-etapa="${e.id}">
      ${e.fundo ? `<img class="categoria__fundo" src="assets/img/categorias/${e.fundo}.webp" alt="" width="800" height="533" loading="lazy" decoding="async">` : ''}
      <span class="categoria__cena" aria-hidden="true">${(e.capa || []).map(c => { const [f, k] = c.split(':'); return `<img src="assets/img/produtos/${f}.webp" alt="" width="800" height="800" loading="lazy" decoding="async"${k ? ` style="--k:${Number(k)}"` : ''}>`; }).join('')}</span>
      <span class="categoria__txt"><span class="categoria__nome">${esc(e.nome)}</span><span class="categoria__qtd">${qtdEtapa(e.id)} produtos</span></span>
    </a>`).join('');

  // Kits em banner: arte em cena de um lado, texto e preço do outro
  const somaKit = k => k.itens.reduce((t, id) => t + porId.get(id).preco, 0);
  const curto = p => p.curto || p.nome;
  $('#lista-kits').innerHTML = C.kits.map(k => {
    const soma = somaKit(k);
    const arte = `assets/img/kits/${k.id}`;
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
          <button class="btn" type="button" data-add-kit="${k.id}">${icone('carrinho')}<span>Adicionar kit</span></button>
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
  if (rodapeLoja) rodapeLoja.innerHTML = C.etapas.map(e => `<li><a href="#loja" data-etapa="${e.id}">${esc(e.nome)}</a></li>`).join('')
    + '<li><a href="#kits">Kits prontos</a></li><li><a href="#guia">Não sei o que comprar</a></li>';

  // Serviços por parte do carro
  const abas = $('#partes');
  const painel = $('#lista-servicos');
  abas.innerHTML = C.partes.map((pt, i) => `<button type="button" role="tab" id="aba-${pt.id}" aria-controls="lista-servicos" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-parte="${pt.id}">${esc(pt.nome)}</button>`).join('');
  const renderServicos = (parteId, destacar) => {
    $$('[data-parte]', abas).forEach(b => { const on = b.dataset.parte === parteId; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    painel.setAttribute('aria-labelledby', `aba-${parteId}`);
    painel.innerHTML = C.servicos.filter(s => s.parte === parteId).map(s => cartaoServico(s, destacar)).join('');
  };
  abas.addEventListener('click', e => { const b = e.target.closest('[data-parte]'); if (b) renderServicos(b.dataset.parte); });
  abas.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const bs = $$('[data-parte]', abas), i = bs.indexOf(document.activeElement);
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length;
    e.preventDefault(); bs[j].focus(); renderServicos(bs[j].dataset.parte);
  });
  renderServicos(C.partes[0].id);
  const irParaServico = id => {
    const s = servPorId.get(id);
    if (!s) return;
    renderServicos(s.parte, id);
    const alvo = $(`#serv-${id}`);
    $('#estetica').scrollIntoView({ behavior: prefereMenos ? 'auto' : 'smooth' });
    if (alvo) setTimeout(() => alvo.focus({ preventScroll: true }), prefereMenos ? 0 : 450);
  };

  // Guia por problema
  const chips = $('#guia-chips');
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

  /* ---------- Sugestões da busca ---------- */
  let ativo = -1;
  const fecharSugestoes = () => {
    listaBusca.hidden = true; campo.setAttribute('aria-expanded', 'false');
    campo.removeAttribute('aria-activedescendant'); ativo = -1;
  };
  const aplicarBusca = () => {
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
    produtoAberto = p; qtdProduto = 1; varianteAberta = p.variantes ? p.variantes[0].id : null;
    const s = p.servico && servPorId.get(p.servico);
    const combina = combinaCom(p);
    const [tipo1] = tipoVariante(p);
    dlgProduto.innerHTML = `
      <button class="fechar" type="button" data-fechar aria-label="Fechar">${icone('fechar')}</button>
      <div class="produto__grade">
        <div class="produto__foto"><img id="produto-foto" src="${foto(p, varianteAberta)}" alt="${esc(p.nome)}" width="800" height="800"></div>
        <div class="produto__info">
          <p class="produto__etapa">${esc(p.etapas.map(e => etapaNome.get(e)).join(' e '))}</p>
          <h2 id="produto-nome">${esc(p.nome)}</h2>
          <p class="produto__medida">${esc(p.medida)}, ${esc(p.marca)}</p>
          <p class="produto__resumo">${esc(p.resumo)}</p>
          <p class="produto__preco">${brl(p.preco)}</p>
          ${p.variantes ? `<fieldset class="variantes"><legend>Escolha a ${tipo1}</legend>${p.variantes.map((v, i) => `<label class="variante"><input type="radio" name="variante" value="${v.id}"${i === 0 ? ' checked' : ''}><span>${esc(v.nome)}</span></label>`).join('')}</fieldset>` : ''}
          <div class="produto__compra">
            <div class="qtd" role="group" aria-label="Quantidade">
              <button type="button" data-qtd="-1" aria-label="Diminuir quantidade">${icone('menos')}</button>
              <output id="produto-qtd" aria-live="polite">1</output>
              <button type="button" data-qtd="1" aria-label="Aumentar quantidade">${icone('mais')}</button>
            </div>
            <button class="btn" type="button" id="produto-add">${icone('carrinho')}<span>Adicionar ao carrinho</span></button>
          </div>
          ${s ? `<div class="produto__servico"><p>Prefere que a Malta faça por você?<strong>${esc(s.popular)}</strong><small>${esc(s.tecnico)}</small></p><a href="${linkWhats(textoAgendar(s))}" target="_blank" rel="noopener" data-agendar="${s.id}" aria-label="Agendar ${esc(s.tecnico)} pelo WhatsApp">${icone('agenda')}Agendar</a></div>` : ''}
          ${combina.length ? `<div class="produto__combina"><h3>Combina com</h3><div class="guia__produtos">${combina.map(mini).join('')}</div></div>` : ''}
        </div>
      </div>`;
    if (!dlgProduto.open) dlgProduto.showModal();
    dlgProduto.scrollTop = 0;
    $('#produto-add', dlgProduto).focus();
    rastrear('view_item', { currency: 'BRL', value: p.preco, items: [{ item_id: p.id, item_name: p.nome }] });
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
      .filter(i => i && (i.tipo === 'p' ? porId.has(i.id) : kitPorId.has(i.id)) && i.qtd > 0);
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

  const toast = $('#toast');
  let tempoToast;
  const avisar = msg => {
    toast.innerHTML = `<span>${esc(msg)}</span><button type="button" data-abrir-carrinho>Ver carrinho</button>`;
    toast.classList.add('on');
    clearTimeout(tempoToast);
    tempoToast = setTimeout(() => toast.classList.remove('on'), 3400);
  };

  const adicionar = (tipo, id, qtd = 1, calado = false, v = null) => {
    if (tipo === 'p' && !v) { const p = porId.get(id); if (p.variantes) v = p.variantes[0].id; }
    const it = carrinho.find(i => i.tipo === tipo && i.id === id && (i.v || null) === (v || null));
    if (it) it.qtd = Math.min(99, it.qtd + qtd); else carrinho.push(v ? { tipo, id, v, qtd } : { tipo, id, qtd });
    salvar(); renderCarrinho(true);
    const item = { tipo, id, v };
    rastrear('add_to_cart', { currency: 'BRL', value: precoItem(item) * qtd, items: [{ item_id: id, item_name: nomeItem(item), quantity: qtd }] });
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
    salvar(); renderCarrinho();
    const alvo = (refoco && $(refoco, lista)) || $('.item__tirar', lista) || $('#dlg-carrinho .fechar');
    if (alvo) alvo.focus();
  });

  const dlgCarrinho = $('#dlg-carrinho');
  const abrirCarrinho = () => {
    toast.classList.remove('on');
    if (dlgProduto.open) dlgProduto.close();
    renderCarrinho();
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
  const atualizarModo = () => {
    const entrega = form.elements.modo.value === 'entrega';
    $('#campos-entrega').hidden = !entrega;
    $('#nota-entrega').textContent = entrega
      ? 'A taxa de entrega é combinada no WhatsApp.'
      : `Retirada na ${C.loja.endereco}.`;
  };
  form.addEventListener('input', salvarForm);
  form.addEventListener('change', e => { if (e.target.name === 'modo') atualizarModo(); salvarForm(); });
  atualizarModo();

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!carrinho.length) return;
    const d = new FormData(form);
    const entrega = d.get('modo') === 'entrega';
    const bairro = String(d.get('bairro') || '').trim();
    const nome = String(d.get('nome') || '').trim();
    const linhas = carrinho.map(i => `${i.qtd}x ${nomeItem(i)}${i.tipo === 'p' ? ` (${porId.get(i.id).medida})` : ''}: ${brl(precoItem(i) * i.qtd)}`);
    const msg = [
      'Olá, Malta! Quero fazer este pedido pelo site:',
      '',
      ...linhas,
      '',
      `Total dos produtos: ${brl(totalCarrinho())}`,
      entrega ? `Entrega em ${d.get('cidade')}${bairro ? `, bairro ${bairro}` : ''}` : 'Vou retirar na Malta',
      `Pagamento: ${d.get('pagamento')}`,
      ...(nome ? [`Nome: ${nome}`] : [])
    ].join('\n').replace(/ /g, ' ');
    rastrear('begin_checkout', { currency: 'BRL', value: totalCarrinho(), items: carrinho.map(i => ({ item_id: i.id, item_name: nomeItem(i), quantity: i.qtd })) });
    window.open(linkWhats(msg), '_blank', 'noopener');
  });

  /* ---------- Cliques da página toda ---------- */
  document.addEventListener('click', e => {
    const t = e.target;
    if (!t.closest('.busca')) fecharSugestoes();

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
    if (etapa) { estado.etapa = etapa.dataset.etapa; estado.busca = ''; campo.value = ''; renderLoja(); return; }
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

  // Clique fora da janela fecha
  [dlgProduto, dlgCarrinho].forEach(d => d.addEventListener('click', e => {
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  }));

  $('#ordem').addEventListener('change', e => { estado.ordem = e.target.value; renderLoja(); });

  renderCarrinho();

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
