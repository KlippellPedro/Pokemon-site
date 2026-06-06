// ============================================================
// Gerenciamento de Tema (Escuro / Claro) e Idioma (PT / EN)
// ============================================================

// Aplica o tema salvo imediatamente para evitar flash de conteúdo não estilizado
(function () {
  var t = localStorage.getItem('pokemon-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

// ============================================================
// TEMA
// ============================================================

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pokemon-theme', next);
  _atualizarBtnTema();
}

function _atualizarBtnTema() {
  var theme = document.documentElement.getAttribute('data-theme') || 'dark';
  var btn = document.getElementById('btn-tema');
  if (!btn) return;
  var labels = {
    pt: { dark: 'CLARO', light: 'ESCURO' },
    en: { dark: 'LIGHT', light: 'DARK' }
  };
  var lang = _langAtual || 'pt';
  btn.textContent = (labels[lang] || labels.pt)[theme];
  btn.title = theme === 'dark'
    ? (lang === 'pt' ? 'Mudar para Modo Claro' : 'Switch to Light Mode')
    : (lang === 'pt' ? 'Mudar para Modo Escuro' : 'Switch to Dark Mode');
}

// ============================================================
// IDIOMA
// ============================================================

var _langAtual = localStorage.getItem('pokemon-lang') || 'pt';

var _dic = {
  pt: {
    // Navegação
    'nav.inicio': 'Início',
    'nav.pokedex': 'Pokédex',
    'nav.equipe': 'Equipe',
    'nav.pacotes': 'Pacotes',
    'nav.colecao': 'Coleção',
    'nav.social': 'Social',
    'nav.login': 'Login',
    'nav.meu-perfil': 'Meu Perfil',
    'nav.admin': 'Painel Admin',
    'nav.sair': 'Sair',
    // Início
    'index.hero': 'MUNDO POKÉMON',
    'index.hero-sub': 'Explore. Capture. Seja o melhor Treinador.',
    'index.cta': 'VER POKÉDEX COMPLETA',
    'index.pokedex-atual': 'A POKÉDEX ATUALMENTE',
    'index.especies': 'Espécies Descobertas',
    'index.tipos': 'Tipos Existentes',
    'index.geracoes': 'Gerações Exploradas',
    'index.pokemon-dia': 'POKÉMON DO DIA',
    'index.carregando': 'Carregando...',
    'index.buscando': 'Buscando informações na PokéDex...',
    'index.montar': 'Montar Equipe',
    'index.montar-desc': 'Crie o time perfeito para vencer a liga.',
    'index.montar-link': 'Ir para Equipe >',
    'index.pacotes': 'Pacotes',
    'index.pacotes-desc': 'Abra pacotes e veja qual pokémon vem.',
    'index.pacotes-link': 'Ver Pacotes >',
    'index.social': 'Social',
    'index.social-desc': 'Tente adivinhar qual é o Pokémon do dia.',
    'index.social-link': 'Ver Social >',
    // Pokédex
    'pokedex.titulo': 'POKÉDEX NACIONAL',
    'pokedex.placeholder': 'Pesquisar nome ou número do pokémon...',
    'pokedex.buscar': 'BUSCAR',
    'pokedex.todos-tipos': 'Todos os Tipos',
    'pokedex.todas-gens': 'Todas as Gens',
    'pokedex.gen-1': '1ª Geração', 'pokedex.gen-2': '2ª Geração',
    'pokedex.gen-3': '3ª Geração', 'pokedex.gen-4': '4ª Geração',
    'pokedex.gen-5': '5ª Geração', 'pokedex.gen-6': '6ª Geração',
    'pokedex.gen-7': '7ª Geração', 'pokedex.gen-8': '8ª Geração',
    'pokedex.gen-9': '9ª Geração',
    'pokedex.limpar': 'LIMPAR',
    'pokedex.carregar': 'CARREGAR MAIS',
    // Tipos
    'tipo.normal': 'Normal', 'tipo.fire': 'Fogo', 'tipo.water': 'Água',
    'tipo.grass': 'Grama', 'tipo.electric': 'Elétrico', 'tipo.ice': 'Gelo',
    'tipo.fighting': 'Lutador', 'tipo.poison': 'Veneno', 'tipo.ground': 'Terra',
    'tipo.flying': 'Voador', 'tipo.psychic': 'Psíquico', 'tipo.bug': 'Inseto',
    'tipo.rock': 'Pedra', 'tipo.ghost': 'Fantasma', 'tipo.dragon': 'Dragão',
    'tipo.dark': 'Sombrio', 'tipo.steel': 'Aço', 'tipo.fairy': 'Fada',
    // Pacotes
    'pacotes.titulo': 'LOJA DE PACOTES',
    'pacotes.basico': 'Pacote Básico',
    'pacotes.basico-desc': 'Chance de Pokémon Comuns',
    'pacotes.epico': 'Pacote Épico',
    'pacotes.epico-desc': 'Chance de Pokémon Raros',
    'pacotes.lendario': 'Pacote Lendário',
    'pacotes.lendario-desc': 'Apenas Pokémon Lendários e Míticos',
    'pacotes.abrir': 'ABRIR',
    'pacotes.voltar': 'Voltar para a Loja',
    'pacotes.starter': 'Pacote Starter',
    'pacotes.starter-desc': 'Pokémon Iniciais de todas as gerações',
    'pacotes.sombrio': 'Pacote Sombrio',
    'pacotes.sombrio-desc': 'Pokémon Fantasma, Sombrio e Psíquico',
    'pacotes.campeao': 'Pacote Campeão',
    'pacotes.campeao-desc': '10 cartas com Lendário garantido',
    // Equipe
    'equipe.titulo': 'MINHA EQUIPE POKÉMON',
    'equipe.subtitulo': 'Monte seu time dos sonhos (Máximo de 6)',
    'equipe.placeholder': 'Digite o nome do Pokémon...',
    'equipe.capturar': 'CAPTURAR',
    'equipe.slot': 'SLOT',
    'equipe.adicionar': '+ Adicionar',
    // Social
    'social.titulo': 'POKÉDLE DIÁRIO',
    'social.subtitulo': 'Adivinhe o Pokémon do dia em 6 tentativas',
    'social.classico': 'CLÁSSICO',
    'social.silhueta': 'SILHUETA',
    'social.pixel': 'PIXEL',
    'social.placeholder': 'Digite o nome do Pokémon...',
    'social.tentativas': 'Tentativas:',
    'social.adivinhar': 'ADIVINHAR',
    'social.pokemon': 'POKÉMON',
    'social.tipo': 'TIPO',
    'social.cor': 'COR',
    'social.gen': 'GEN',
    'social.peso': 'PESO',
    'social.lendario': 'LENDÁRIO',
  },
  en: {
    // Navigation
    'nav.inicio': 'Home',
    'nav.pokedex': 'Pokédex',
    'nav.equipe': 'My Team',
    'nav.pacotes': 'Packs',
    'nav.colecao': 'Collection',
    'nav.social': 'Social',
    'nav.login': 'Login',
    'nav.meu-perfil': 'My Profile',
    'nav.admin': 'Admin Panel',
    'nav.sair': 'Logout',
    // Home
    'index.hero': 'POKÉMON WORLD',
    'index.hero-sub': 'Explore. Catch. Become the greatest Trainer.',
    'index.cta': 'SEE FULL POKÉDEX',
    'index.pokedex-atual': 'THE POKÉDEX TODAY',
    'index.especies': 'Discovered Species',
    'index.tipos': 'Existing Types',
    'index.geracoes': 'Explored Generations',
    'index.pokemon-dia': 'POKÉMON OF THE DAY',
    'index.carregando': 'Loading...',
    'index.buscando': 'Fetching data from the PokéDex...',
    'index.montar': 'Build a Team',
    'index.montar-desc': 'Create the perfect team to beat the league.',
    'index.montar-link': 'Go to Team >',
    'index.pacotes': 'Packs',
    'index.pacotes-desc': 'Open packs and see which Pokémon you get.',
    'index.pacotes-link': 'See Packs >',
    'index.social': 'Social',
    'index.social-desc': 'Try to guess the Pokémon of the day.',
    'index.social-link': 'See Social >',
    // Pokédex
    'pokedex.titulo': 'NATIONAL POKÉDEX',
    'pokedex.placeholder': 'Search name or number...',
    'pokedex.buscar': 'SEARCH',
    'pokedex.todos-tipos': 'All Types',
    'pokedex.todas-gens': 'All Gens',
    'pokedex.gen-1': '1st Generation', 'pokedex.gen-2': '2nd Generation',
    'pokedex.gen-3': '3rd Generation', 'pokedex.gen-4': '4th Generation',
    'pokedex.gen-5': '5th Generation', 'pokedex.gen-6': '6th Generation',
    'pokedex.gen-7': '7th Generation', 'pokedex.gen-8': '8th Generation',
    'pokedex.gen-9': '9th Generation',
    'pokedex.limpar': 'CLEAR',
    'pokedex.carregar': 'LOAD MORE',
    // Types
    'tipo.normal': 'Normal', 'tipo.fire': 'Fire', 'tipo.water': 'Water',
    'tipo.grass': 'Grass', 'tipo.electric': 'Electric', 'tipo.ice': 'Ice',
    'tipo.fighting': 'Fighting', 'tipo.poison': 'Poison', 'tipo.ground': 'Ground',
    'tipo.flying': 'Flying', 'tipo.psychic': 'Psychic', 'tipo.bug': 'Bug',
    'tipo.rock': 'Rock', 'tipo.ghost': 'Ghost', 'tipo.dragon': 'Dragon',
    'tipo.dark': 'Dark', 'tipo.steel': 'Steel', 'tipo.fairy': 'Fairy',
    // Packs
    'pacotes.titulo': 'PACK SHOP',
    'pacotes.basico': 'Basic Pack',
    'pacotes.basico-desc': 'Chance of Common Pokémon',
    'pacotes.epico': 'Epic Pack',
    'pacotes.epico-desc': 'Chance of Rare Pokémon',
    'pacotes.lendario': 'Legendary Pack',
    'pacotes.lendario-desc': 'Only Legendary and Mythical Pokémon',
    'pacotes.abrir': 'OPEN',
    'pacotes.voltar': 'Back to Shop',
    'pacotes.starter': 'Starter Pack',
    'pacotes.starter-desc': 'Starter Pokémon from all generations',
    'pacotes.sombrio': 'Shadow Pack',
    'pacotes.sombrio-desc': 'Ghost, Dark, and Psychic Pokémon',
    'pacotes.campeao': 'Champion Pack',
    'pacotes.campeao-desc': '10 cards with guaranteed Legendary',
    // Team
    'equipe.titulo': 'MY POKÉMON TEAM',
    'equipe.subtitulo': 'Build your dream team (Maximum 6)',
    'equipe.placeholder': 'Enter Pokémon name...',
    'equipe.capturar': 'CATCH',
    'equipe.slot': 'SLOT',
    'equipe.adicionar': '+ Add',
    // Social
    'social.titulo': 'DAILY POKÉDLE',
    'social.subtitulo': 'Guess the Pokémon of the day in 6 tries',
    'social.classico': 'CLASSIC',
    'social.silhueta': 'SILHOUETTE',
    'social.pixel': 'PIXEL',
    'social.placeholder': 'Type the Pokémon name...',
    'social.tentativas': 'Attempts:',
    'social.adivinhar': 'GUESS',
    'social.pokemon': 'POKÉMON',
    'social.tipo': 'TYPE',
    'social.cor': 'COLOR',
    'social.gen': 'GEN',
    'social.peso': 'WEIGHT',
    'social.lendario': 'LEGENDARY',
  }
};

function t(key) {
  var dict = _dic[_langAtual] || _dic.pt;
  return dict[key] !== undefined ? dict[key] : (_dic.pt[key] || key);
}

function _aplicarTraducoes() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var val = t(el.getAttribute('data-i18n'));
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var val = t(el.getAttribute('data-i18n-placeholder'));
    if (val) el.placeholder = val;
  });
  var langBtn = document.getElementById('btn-lang');
  if (langBtn) {
    langBtn.textContent = _langAtual === 'pt' ? 'EN' : 'PT';
    langBtn.title = _langAtual === 'pt' ? 'Switch to English' : 'Mudar para Português';
  }
  document.documentElement.lang = _langAtual === 'pt' ? 'pt-BR' : 'en';
  _atualizarBtnTema();
  document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: _langAtual } }));
}

function toggleLang() {
  _langAtual = _langAtual === 'pt' ? 'en' : 'pt';
  localStorage.setItem('pokemon-lang', _langAtual);
  _aplicarTraducoes();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  _aplicarTraducoes();
  _atualizarBtnTema();
});
