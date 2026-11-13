/*
 * Catálogo da loja da Malta. Tudo que a página mostra sai daqui.
 * Catálogo novo = trocar este arquivo, nunca o HTML.
 *
 * Prévia de 13/11/2026, ajustada pelo áudio do dono: loja pra quem cuida do carro em
 * casa (500 ml e 1 L, nada de galão), muito aromatizante e acessório. Fotos: site da
 * Vonixx e catálogo da Yamase (fornecedor dele). Preço é referência de mercado; a
 * tabela da Malta substitui depois da aprovação. Preço de atacado da Yamase nunca
 * aparece aqui.
 *
 * Produto: id (= foto em assets/img/produtos/<id>.webp), nome, medida, marca, preco,
 * etapas (a primeira é a principal), resumo (uma frase), servico (id do serviço que a
 * Malta faz no lugar do cliente, ou null), destaque, variantes (opcional: fragrância
 * ou cor; cada uma pode ter foto própria em img).
 */
window.CATALOGO = {
  loja: {
    nome: 'Malta Estética Automotiva',
    whatsapp: '5531991310656',
    telefone: '(31) 99131-0656',
    endereco: 'Rua Gabriela Mistral, 102, Cidade Nobre, Ipatinga',
    mapa: 'https://maps.google.com/?cid=3393291804836077496',
    nota: '5,0',
    avaliacoes: 4,
    cidades: ['Ipatinga', 'Coronel Fabriciano', 'Timóteo'],
    pagamentos: ['Pix', 'Cartão', 'Dinheiro']
  },

  // Letreiro do topo: logo em assets/img/marcas/<logo>.svg (vetor branco). altura em px no letreiro,
  // calibrada pra todas parecerem do mesmo tamanho.
  marcas: [
    { nome: 'Vonixx', logo: 'vonixx', altura: 25 },
    { nome: 'Vintex', logo: 'vintex', altura: 25 },
    { nome: 'Razux', logo: 'razux', altura: 34 },
    { nome: 'Cadillac', logo: 'cadillac', altura: 34 },
    { nome: 'Kers', logo: 'kers', altura: 30 },
    { nome: 'Detailer', logo: 'detailer', altura: 34 }
  ],

  // capa: fotos (nome do arquivo em assets/img/produtos) que montam o bloco da categoria,
  // na ordem fundo esquerdo, fundo direito, frente. ':.8' depois do nome encolhe produto largo.
  // fundo: arte clara do bloco, em assets/img/categorias/<fundo>.webp.
  etapas: [
    { id: 'lavagem', nome: 'Lavagem', fundo: 'cat-lavagem', capa: ['balde-a:.9', 'vexus', 'v-floc'] },
    { id: 'protecao', nome: 'Brilho e proteção', fundo: 'cat-protecao', capa: ['v80', 'blend-spray-wax', 'shiny'] },
    { id: 'vidros', nome: 'Vidros', fundo: 'cat-vidros', capa: ['prizm', 'toalha-40x60:.72', 'glazy'] },
    { id: 'interior', nome: 'Interior', fundo: 'cat-interior', capa: ['sintra-fast', 'higicouro', 'intense'] },
    { id: 'aromatizantes', nome: 'Aromatizantes', fundo: 'cat-aromatizantes', capa: ['arominha-carro-novo:.72', 'aroma-bom-ar', 'aroma-morango'] },
    { id: 'acessorios', nome: 'Acessórios', fundo: 'cat-acessorios', capa: ['toalha-secagem:.78', 'kit-pinceis-interno:.82', 'luva-2-em-1:.74'] }
  ],

  produtos: [
    // Lavagem
    { id: 'v-floc', nome: 'V-Floc Lava Autos', curto: 'V-Floc', medida: '500 ml', marca: 'Vonixx', preco: 34.90, etapas: ['lavagem'], servico: 'lavagem-tecnica', destaque: true,
      resumo: 'Shampoo de pH neutro, com condicionadores que deixam a lavagem suave e não tiram a cera.' },
    { id: 'v-mol', nome: 'V-Mol Lava Autos Desincrustante', medida: '500 ml', marca: 'Vonixx', preco: 22.90, etapas: ['lavagem'], servico: 'lavagem-tecnica',
      resumo: 'Pra sujeira difícil, como barro e óleo. pH levemente básico, que não agride a superfície.' },
    { id: 'vexus', nome: 'Vexus Limpador de Rodas e Motores', medida: '500 ml', marca: 'Vonixx', preco: 29.90, etapas: ['lavagem'], servico: 'lavagem-tecnica',
      resumo: 'Limpa roda e motor com eficiência, sem a preocupação de manchar.' },
    { id: 'delet', nome: 'Delet Limpador de Pneus e Borrachas', medida: '500 ml', marca: 'Vonixx', preco: 32.90, etapas: ['lavagem'], servico: 'lavagem-tecnica',
      resumo: 'Tira a sujeira pesada do pneu e das borrachas. Use antes do revitalizador.' },
    { id: 'snow-foam-fast', nome: 'Canhão de Espuma Snow Foam Fast', medida: '1 L', marca: 'Vonixx', preco: 159.90, etapas: ['lavagem'], servico: 'lavagem-tecnica',
      resumo: 'Vai na lavadora de alta pressão e cobre o carro de espuma, que solta a sujeira antes da luva tocar a pintura.' },
    { id: 'balde', nome: 'Balde Detailer', curto: 'Balde Detailer', medida: 'unidade', marca: 'Detailer', preco: 79.90, etapas: ['lavagem', 'acessorios'], servico: 'lavagem-tecnica', destaque: true,
      resumo: 'Balde reforçado pra lavagem em casa. Combina com o separador de sujeira no fundo.',
      variantes: [{ id: 'preto-azul', nome: 'Preto e azul', img: 'balde-a' }, { id: 'preto-branco', nome: 'Preto e branco', img: 'balde-b' }, { id: 'amarelo', nome: 'Amarelo', img: 'balde-amarelo' }] },
    { id: 'separador', nome: 'Separador de Sujeira para Balde', medida: 'unidade', marca: 'Detailer', preco: 39.90, etapas: ['lavagem', 'acessorios'], servico: 'lavagem-tecnica',
      resumo: 'Grade que fica no fundo do balde e segura a areia lá embaixo, longe da luva e da pintura.',
      variantes: [{ id: 'azul', nome: 'Azul' }, { id: 'preto', nome: 'Preto' }, { id: 'vermelho', nome: 'Vermelho' }] },

    // Brilho e proteção
    { id: 'blend-spray-wax', nome: 'Blend Spray Wax', curto: 'Blend', medida: '500 ml', marca: 'Vonixx', preco: 54.90, etapas: ['protecao'], servico: 'vitrificacao-pintura', destaque: true,
      resumo: 'Cera em spray: borrifa, espalha e tira. Proteção e brilho sem gastar a tarde.' },
    { id: 'tok-final', nome: 'Carnaúba Tok Final', medida: '500 ml', marca: 'Vonixx', preco: 29.90, etapas: ['protecao'], servico: 'vitrificacao-pintura',
      resumo: 'Mantém o brilho e a proteção da cera entre uma lavagem e outra.' },
    { id: 'v80', nome: 'V80 Selante Sintético', curto: 'V80', medida: '500 ml', marca: 'Vonixx', preco: 59.90, etapas: ['protecao'], servico: 'vitrificacao-pintura', destaque: true,
      resumo: 'Proteção avançada pra pintura. A água escorre em gotas e o carro fica limpo por mais tempo.' },
    { id: 'native-paste-wax', nome: 'Native Paste Wax', medida: '100 g', marca: 'Vonixx', preco: 119.90, etapas: ['protecao'], servico: 'vitrificacao-pintura',
      resumo: 'Cera de carnaúba em pasta, de alto padrão, pra brilho intenso.' },
    { id: 'sio2-pro', nome: 'SiO2-Pro', medida: '500 ml', marca: 'Vonixx', preco: 69.90, etapas: ['protecao'], servico: 'vitrificacao-pintura',
      resumo: 'Manutenção de pintura vitrificada: renova a proteção e deixa o toque aveludado.' },
    { id: 'v40', nome: 'V40 Polidor 4 em 1', medida: '500 ml', marca: 'Vonixx', preco: 55.90, etapas: ['protecao'], servico: 'polimento',
      resumo: 'Corta, refina, dá lustro e protege numa etapa só. Feito pra verniz macio.' },
    { id: 'shiny', nome: 'Shiny Revitalizador de Pneus', medida: '500 ml', marca: 'Vonixx', preco: 61.90, etapas: ['protecao'], servico: 'lavagem-tecnica', destaque: true,
      resumo: 'Pneu preto e brilhante por muito mais tempo, com proteção pra borracha.' },
    { id: 'restaurax', nome: 'Restaurax Restaurador de Plásticos', medida: '500 ml', marca: 'Vonixx', preco: 49.90, etapas: ['protecao'], servico: 'revitalizacao-plasticos',
      resumo: 'Recupera para-choque, painel e laterais de porta que ficaram desbotados.' },

    // Vidros
    { id: 'prizm', nome: 'Prizm Restaurador de Vidros', medida: '500 ml', marca: 'Vonixx', preco: 49.90, etapas: ['vidros'], servico: 'restauracao-vidros',
      resumo: 'Tira mancha de água incrustada e devolve a transparência do vidro.' },
    { id: 'glazy', nome: 'Glazy Vidros 4 em 1', medida: '500 ml', marca: 'Vonixx', preco: 59.90, etapas: ['vidros'], servico: 'cristalizacao-vidros',
      resumo: 'Limpa, protege e condiciona o vidro, e reduz o risco que o limpador de para-brisa deixa.' },

    // Interior
    { id: 'intense', nome: 'Intense Renovador de Plásticos Internos', curto: 'Intense', medida: '500 ml', marca: 'Vonixx', preco: 37.90, etapas: ['interior'], servico: 'revitalizacao-plasticos', destaque: true,
      resumo: 'Painel com acabamento natural e toque seco, com proteção UV que dura até 6 meses.' },
    { id: 'sintra-fast', nome: 'Sintra Fast Limpador Interno', curto: 'Sintra Fast', medida: '500 ml', marca: 'Vonixx', preco: 34.90, etapas: ['interior'], servico: 'higienizacao',
      resumo: 'Limpador bactericida pro interior: tira sujeira, mancha e cheiro.' },
    { id: 'vertex', nome: 'Vertex Limpador de Estofados', medida: '500 ml', marca: 'Vonixx', preco: 22.90, etapas: ['interior'], servico: 'higienizacao',
      resumo: 'Limpa banco de tecido e carpete. Concentrado, então rende bastante.' },
    { id: 'higicouro', nome: 'Higicouro Limpador de Couro', medida: '500 ml', marca: 'Vonixx', preco: 44.90, etapas: ['interior'], servico: 'limpeza-couro',
      resumo: 'Limpa banco de couro com segurança, sem agredir o material.' },
    { id: 'hidracouro', nome: 'Hidracouro Hidratante de Couro', medida: '500 ml', marca: 'Vonixx', preco: 39.90, etapas: ['interior'], servico: 'hidratacao-couro',
      resumo: 'Hidrata e protege o couro com lanolina, pra ele não ressecar.' },

    // Aromatizantes
    { id: 'arominha', nome: 'Arominha Odorizante em Gel', curto: 'Arominha', medida: '60 g', marca: 'Vintex', preco: 24.90, etapas: ['aromatizantes'], servico: 'oxi-sanitizacao', destaque: true,
      resumo: 'Potinho em gel que perfuma o carro aos poucos. Fica embaixo do banco ou no console.',
      variantes: [{ id: 'carro-novo', nome: 'Carro Novo', img: 'arominha-carro-novo' }, { id: 'fresh', nome: 'Fresh', img: 'arominha-fresh' }, { id: 'frutal', nome: 'Frutal', img: 'arominha-frutal' }, { id: 'uva', nome: 'Uva', img: 'arominha-uva' }] },
    { id: 'aroma-spray', nome: 'Aroma Odorizante em Spray', curto: 'Aroma spray', medida: 'frasco spray', marca: 'Vintex', preco: 26.90, etapas: ['aromatizantes'], servico: 'oxi-sanitizacao',
      resumo: 'Duas borrifadas no tapete e no banco e o carro fica perfumado na hora.',
      variantes: [{ id: 'bom-ar', nome: 'Bom Ar', img: 'aroma-bom-ar' }, { id: 'carro-novo', nome: 'Carro Novo', img: 'aroma-carro-novo' }, { id: 'morango', nome: 'Morango', img: 'aroma-morango' }, { id: 'fresh', nome: 'Fresh', img: 'aroma-fresh' }] },
    { id: 'aroma-para-carro', nome: 'Aroma para Carro em Sachê', curto: 'Sachê', medida: 'sachê', marca: 'Vonixx', preco: 27.90, etapas: ['aromatizantes'], servico: 'oxi-sanitizacao',
      resumo: 'Sachê perfumado pra pendurar no carro, no guarda-roupa ou no escritório.' },

    // Acessórios
    { id: 'luva-2-em-1', nome: 'Luva de Microfibra 2 em 1', curto: 'Luva 2 em 1', medida: '28 x 18,5 cm', marca: 'Vonixx', preco: 39.90, etapas: ['acessorios', 'lavagem'], servico: 'lavagem-tecnica',
      resumo: 'Luva de lavagem em microfibra de 380 g/m², que segura bastante espuma.' },
    { id: 'toalha-secagem', nome: 'Toalha de Secagem Ultra', curto: 'Toalha de secagem', medida: '70 x 120 cm', marca: 'Vonixx', preco: 89.90, etapas: ['acessorios', 'lavagem'], servico: 'lavagem-tecnica', destaque: true,
      resumo: 'Microfibra grande, de 400 g/m², pra secar o carro inteiro sem marcar a pintura.' },
    { id: 'toalha-40x60', nome: 'Toalha de Microfibra sem Costura', curto: 'Toalha 40x60', medida: '40 x 60 cm', marca: 'Vonixx', preco: 19.90, etapas: ['acessorios'], servico: null,
      resumo: 'Sem costura na borda, pra tirar cera e polidor sem riscar.' },
    { id: 'aplicador-espuma', nome: 'Aplicador de Espuma', curto: 'Aplicador', medida: 'unidade', marca: 'Vonixx', preco: 7.90, etapas: ['acessorios'], servico: null,
      resumo: 'Espalha cera, selante e revitalizador por igual.' },
    { id: 'kit-pinceis-interno', nome: 'Kit de Pincéis para Interior', curto: 'Pincéis', medida: '5 pincéis', marca: 'Vonixx', preco: 59.90, etapas: ['acessorios', 'interior'], servico: 'higienizacao',
      resumo: 'Cerdas macias pra limpar saída de ar, botão e costura do painel.' },
    { id: 'escova-pneus', nome: 'Escova para Pneus', medida: 'unidade', marca: 'Vonixx', preco: 29.90, etapas: ['acessorios', 'lavagem'], servico: 'lavagem-tecnica',
      resumo: 'Cerdas firmes pra esfregar o pneu antes do revitalizador.' }
  ],

  // Kit = banner com arte em cena: assets/img/kits/<id>-1000.webp e -2000.webp.
  // lado: onde ficam os produtos na arte ('dir' ou 'esq'); o texto vai no outro lado.
  kits: [
    { id: 'kit-lavagem', nome: 'Kit lavagem em casa', preco: 219.90, lado: 'dir',
      itens: ['balde', 'v-floc', 'luva-2-em-1', 'toalha-secagem'],
      texto: 'Balde, shampoo, luva e toalha de secagem. O básico bem feito pra lavar no fim de semana.',
      alt: 'Balde Detailer, V-Floc, luva de microfibra e toalha de secagem no chão molhado, ao lado do pneu de um carro com espuma' },
    { id: 'kit-interior', nome: 'Kit interior limpo', preco: 134.90, lado: 'esq',
      itens: ['sintra-fast', 'intense', 'kit-pinceis-interno', 'toalha-40x60'],
      texto: 'Limpa o interior, renova o painel e alcança os cantos que o pano não pega.',
      alt: 'Sintra Fast, Intense, pincéis e toalha de microfibra em cima do painel de um carro' },
    { id: 'kit-brilho', nome: 'Kit brilho e proteção', preco: 124.90, lado: 'dir',
      itens: ['blend-spray-wax', 'v80', 'aplicador-espuma', 'toalha-40x60'],
      texto: 'Cera em spray pro dia a dia e selante pra proteção que dura.',
      alt: 'Blend, V80, aplicador de espuma e toalha no capô preto de um carro, coberto de gotas de água' },
    { id: 'kit-aromas', nome: 'Kit cheirinho de carro', preco: 69.90, lado: 'esq',
      itens: ['arominha', 'aroma-spray', 'aroma-para-carro'],
      texto: 'Gel embaixo do banco, spray no tapete e sachê pendurado. As fragrâncias você escolhe com a Malta no WhatsApp.',
      alt: 'Arominha Carro Novo, Aroma Morango e sachês Aroma para Carro no banco de couro de um carro' }
  ],

  problemas: [
    { id: 'pneu', nome: 'Pneu sem brilho', produtos: ['delet', 'escova-pneus', 'shiny', 'aplicador-espuma'], servico: 'lavagem-tecnica',
      texto: 'Primeiro tira a sujeira com o Delet e a escova. Depois o Shiny devolve o preto.' },
    { id: 'cheiro', nome: 'Cheiro ruim no carro', produtos: ['sintra-fast', 'arominha', 'aroma-spray'], servico: 'oxi-sanitizacao',
      texto: 'Cheiro que volta toda vez que liga o ar costuma ser fungo no ar-condicionado, e aí o caminho é a oxi-sanitização. Pro dia a dia, Sintra Fast no tecido e um aromatizante.' },
    { id: 'banco', nome: 'Banco manchado', produtos: ['vertex', 'sintra-fast', 'kit-pinceis-interno'], servico: 'higienizacao',
      texto: 'O Vertex limpa o tecido do banco e do carpete. O Sintra Fast cuida do resto do interior.' },
    { id: 'couro', nome: 'Couro ressecado', produtos: ['higicouro', 'hidracouro', 'toalha-40x60'], servico: 'hidratacao-couro',
      texto: 'Limpa com o Higicouro e hidrata com o Hidracouro, nessa ordem.' },
    { id: 'pintura', nome: 'Pintura sem brilho', produtos: ['v40', 'v80', 'aplicador-espuma', 'toalha-40x60'], servico: 'polimento',
      texto: 'O V40 devolve o lustro e o V80 protege. Risco mais fundo pede politriz: aí é com a gente.' },
    { id: 'vidro', nome: 'Vidro manchado', produtos: ['prizm', 'glazy', 'toalha-40x60'], servico: 'cristalizacao-vidros',
      texto: 'O Prizm tira a mancha de água e o Glazy limpa e protege. Pra chuva escorrer sozinha, a cristalização.' },
    { id: 'plastico', nome: 'Plástico desbotado', produtos: ['restaurax', 'intense', 'aplicador-espuma'], servico: 'revitalizacao-plasticos',
      texto: 'Restaurax pro para-choque e as partes de fora. Intense pro painel.' },
    { id: 'roda', nome: 'Roda encardida', produtos: ['vexus', 'v-mol', 'toalha-40x60'], servico: 'lavagem-tecnica',
      texto: 'O Vexus solta a sujeira da roda e do motor. O V-Mol cuida do barro pesado na lataria.' }
  ],

  // Serviços por parte do carro: primeiro o jeito que o cliente fala, depois o nome técnico.
  // Lista montada pelo áudio do dono (13/11/2026). Confirmar com ele antes de publicar.
  partes: [
    { id: 'interior', nome: 'Interior e ar' },
    { id: 'vidros', nome: 'Vidros' },
    { id: 'pintura', nome: 'Pintura' },
    { id: 'farois', nome: 'Faróis' },
    { id: 'motor', nome: 'Motor' },
    { id: 'couro', nome: 'Couro' },
    { id: 'plasticos', nome: 'Plásticos' }
  ],

  servicos: [
    { id: 'oxi-sanitizacao', termos: 'higienização do ar-condicionado, limpeza do ar, ozônio, mofo, cheiro, fungo, bactéria, sanitização', parte: 'interior', cuidado: 'Limpeza',
      popular: 'Tirar o cheiro e as bactérias do ar-condicionado', tecnico: 'Oxi-sanitização',
      texto: 'Uma máquina de ozônio circula pelo interior e pelos dutos do ar e elimina fungo, bactéria e cheiro de mofo.' },
    { id: 'higienizacao', termos: 'lavar banco, limpeza de estofado, carpete, teto, extratora, lavagem interna', parte: 'interior', cuidado: 'Limpeza',
      popular: 'Lavar bancos, carpete e teto', tecnico: 'Higienização interna',
      texto: 'Limpeza a fundo do tecido com extratora, que puxa a sujeira e a mancha lá de dentro.' },
    { id: 'restauracao-vidros', termos: 'mancha no vidro, chuva ácida, vidro embaçado', parte: 'vidros', cuidado: 'Restauração',
      popular: 'Tirar mancha de água do vidro', tecnico: 'Restauração de vidros',
      texto: 'Remove a marca de água incrustada e a sujeira grudada e devolve a transparência do vidro.' },
    { id: 'cristalizacao-vidros', termos: 'repelente de chuva, para-brisa, chuva, vidro', parte: 'vidros', cuidado: 'Proteção',
      popular: 'Chuva escorrendo sozinha do para-brisa', tecnico: 'Cristalização de vidros',
      texto: 'Uma camada que repele a água: a chuva escorre, a visibilidade melhora e o vidro mancha menos.' },
    { id: 'vitrificacao-vidros', termos: 'repelente de chuva, para-brisa, vidro', parte: 'vidros', cuidado: 'Proteção',
      popular: 'Proteção mais duradoura no vidro', tecnico: 'Vitrificação de vidros',
      texto: 'A mesma ideia da cristalização, com produto de maior durabilidade.' },
    { id: 'lavagem-tecnica', termos: 'lavagem, lavar o carro, lava-jato', parte: 'pintura', cuidado: 'Limpeza',
      popular: 'Lavagem completa e caprichada', tecnico: 'Lavagem técnica',
      texto: 'Produto certo pra cada parte, sem riscar a pintura, com acabamento em pneus, rodas e vidros.' },
    { id: 'polimento', termos: 'risco, riscos, arranhão, brilho, espelhamento', parte: 'pintura', cuidado: 'Restauração',
      popular: 'Tirar riscos e devolver o brilho', tecnico: 'Polimento técnico (correção de verniz)',
      texto: 'A politriz nivela o verniz e tira risco fino, marca de lavagem e aspecto opaco.' },
    { id: 'vitrificacao-pintura', termos: 'vitrificação, cerâmica, coating, proteção da pintura', parte: 'pintura', cuidado: 'Proteção',
      popular: 'Proteger a pintura por mais tempo', tecnico: 'Vitrificação de pintura',
      texto: 'Uma camada protetora sobre o verniz que segura o brilho e faz a sujeira sair mais fácil na lavagem.' },
    { id: 'restauracao-farois', termos: 'farol amarelado, polimento de farol, farol', parte: 'farois', cuidado: 'Restauração',
      popular: 'Farol amarelado ou fosco', tecnico: 'Restauração de faróis',
      texto: 'Lixamento e polimento tiram a camada amarelada e devolvem a transparência do farol.' },
    { id: 'protecao-farois', termos: 'farol', parte: 'farois', cuidado: 'Proteção',
      popular: 'Farol que demora a amarelar de novo', tecnico: 'Proteção de faróis',
      texto: 'Depois de restaurado, o farol recebe uma camada que protege do sol.' },
    { id: 'limpeza-motor', termos: 'lavar motor, motor sujo', parte: 'motor', cuidado: 'Limpeza',
      popular: 'Motor limpo sem molhar o que não pode', tecnico: 'Limpeza técnica de motor',
      texto: 'Produto e cuidado certos pra parte elétrica, sem jato forte em cima de conector.' },
    { id: 'protecao-motor', termos: 'verniz de motor', parte: 'motor', cuidado: 'Proteção',
      popular: 'Motor com cara de novo', tecnico: 'Proteção de motor (verniz de motor)',
      texto: 'Depois da limpeza, uma camada protege plástico e borracha do calor e do ressecamento.' },
    { id: 'limpeza-couro', termos: 'banco de couro sujo', parte: 'couro', cuidado: 'Limpeza',
      popular: 'Banco de couro encardido', tecnico: 'Limpeza de couro',
      texto: 'Tira a sujeira das costuras e dos poros sem ressecar o couro.' },
    { id: 'hidratacao-couro', termos: 'hidratar banco, couro rachado', parte: 'couro', cuidado: 'Proteção',
      popular: 'Couro ressecado ou rachando', tecnico: 'Hidratação de couro',
      texto: 'Repõe a hidratação e protege o couro do sol e do uso.' },
    { id: 'revitalizacao-plasticos', termos: 'plástico branco, plástico desbotado, para-choque', parte: 'plasticos', cuidado: 'Restauração',
      popular: 'Plástico desbotado ou esbranquiçado', tecnico: 'Revitalização de plásticos',
      texto: 'Devolve a cor do para-choque, das caixas de roda e do painel.' }
  ],

  // Grade do Instagram no fim da página. Foto: assets/img/instagram/<codigo>.webp (540x540,
  // capa do post recortada no meio). Atualizar = baixar a capa nova e trocar a lista.
  instagram: {
    usuario: 'malta_esteticaautomotiva',
    posts: [
      { codigo: 'DeNYiL5OzmY', tipo: 'reel', alt: 'Polimento no capô de um Jeep cinza' },
      { codigo: 'DcyV6gyO_2l', tipo: 'reel', alt: 'Polimento num carro preto, com as luzes do estúdio refletidas na pintura' },
      { codigo: 'DeNgCUPuIcv', tipo: 'reel', alt: 'Picape cinza no estúdio da Malta' },
      { codigo: 'DeNgkb_OoXf', tipo: 'reel', alt: 'SUV preto no estúdio da Malta' },
      { codigo: 'DeNfzLOOzov', tipo: 'reel', alt: 'SUV cinza no piso verde e preto do estúdio' },
      { codigo: 'Dd9dhyHp-8K', tipo: 'reel', alt: 'Jeep cinza no piso verde e preto do estúdio' },
      { codigo: 'DcyWZOQOVhT', tipo: 'reel', alt: 'Picape preta no estúdio da Malta' },
      { codigo: 'Dd9hAytpNVP', tipo: 'reel', alt: 'Moto branca e preta no estúdio' }
    ]
  }
};
