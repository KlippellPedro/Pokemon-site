// ============================================================
// LÓGICA DA PÁGINA INICIAL (INDEX)
// ============================================================

// Elementos da página
const elTotalPokemon = document.getElementById('total-pokemon');
const imgDestaque = document.getElementById('destaque-img');
const nomeDestaque = document.getElementById('destaque-nome');
const tipoDestaque = document.getElementById('destaque-tipo');
const descDestaque = document.getElementById('destaque-desc');
const containerDestaque = document.getElementById('destaque-bg');

// Barras de status
const barHp = document.getElementById('stat-hp');
const barAtk = document.getElementById('stat-atk');
const barDef = document.getElementById('stat-def');
const barSpd = document.getElementById('stat-spd');

// Dicionário de Cores baseadas no tipo (para pintar o fundo)
const coresTipos = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

// 1. Busca o número total de Pokémon existentes para a seção de Estatísticas
async function carregarEstatisticas() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1');
        const data = await res.json();
        // A API retorna o 'count' com o total de espécies cadastradas
        elTotalPokemon.innerText = data.count;
    } catch (e) {
        elTotalPokemon.innerText = "1000+";
    }
}

// 2. Sorteia um Pokémon aleatório para ser o "Destaque do Dia"
async function carregarPokemonDestaque() {
    try {
        const hoje = new Date().toDateString(); // Ex: "Mon Oct 27 2025"
        const cacheDestaque = JSON.parse(localStorage.getItem('pokemonDestaqueCache'));

        // 1. Tenta buscar se o Admin definiu um Pokémon específico
        const resConfig = await fetch('/admin/config/destaque');
        let idForcado = null;
        if (resConfig.ok) {
            const config = await resConfig.json();
            if (config.pokemon_id) idForcado = config.pokemon_id;
        }

        // Se houver um ID forçado, verificamos se o cache já tem esse ID específico
        if (idForcado) {
            if (cacheDestaque && cacheDestaque.pokeData.id === idForcado) {
                atualizarTelaDestaque(cacheDestaque.pokeData, cacheDestaque.descricao);
                return;
            }
        } else {
            // Se não houver ID forçado, usamos o cache diário normal (se não for um override antigo)
            if (cacheDestaque && cacheDestaque.data === hoje && !cacheDestaque.adminOverride) {
                atualizarTelaDestaque(cacheDestaque.pokeData, cacheDestaque.descricao);
                return;
            }
        }

        // Usa o ID forçado ou sorteia um novo (entre os 1025 primeiros)
        const idFinal = idForcado || Math.floor(Math.random() * 1025) + 1;

        // Busca os dados do Pokémon
        const resPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${idFinal}`);
        const pokeData = await resPoke.json();

        // Busca a descrição (Species)
        const resSpecies = await fetch(pokeData.species.url);
        const speciesData = await resSpecies.json();

        // Tenta encontrar a descrição em Espanhol (es) ou Inglês (en) - a API não tem muito em PT-BR
        const entry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en') || speciesData.flavor_text_entries[0];
        const descricao = entry ? entry.flavor_text : "No description available.";

        // Salva no localStorage para as próximas visitas de hoje
        localStorage.setItem('pokemonDestaqueCache', JSON.stringify({
            data: hoje,
            pokeData: pokeData,
            descricao: descricao,
            adminOverride: !!idForcado
        }));

        atualizarTelaDestaque(pokeData, descricao);

    } catch (e) {
        console.error("Erro ao carregar destaque", e);
        descDestaque.innerText = "Houve um erro na Rota 1. Tente recarregar a página.";
    }
}

// 3. Pega os dados baixados e joga no HTML
function atualizarTelaDestaque(pokeData, descricao) {
    const tipoPrincipalIngles = pokeData.types[0].type.name;

    // Dicionário para traduzir o nome do tipo que aparece na tela
    const traducaoTipos = {
        normal: 'NORMAL', fire: 'FOGO', water: 'ÁGUA', electric: 'ELÉTRICO',
        grass: 'GRAMA', ice: 'GELO', fighting: 'LUTADOR', poison: 'VENENO',
        ground: 'TERRA', flying: 'VOADOR', psychic: 'PSÍQUICO', bug: 'INSETO',
        rock: 'PEDRA', ghost: 'FANTASMA', dragon: 'DRAGÃO', dark: 'SOMBRIO',
        steel: 'AÇO', fairy: 'FADA'
    };

    // Atualiza Textos e Imagens
    imgDestaque.style.opacity = 0;
    setTimeout(() => {
        imgDestaque.src = pokeData.sprites.other['official-artwork'].front_default || pokeData.sprites.front_default;
        imgDestaque.style.opacity = 1;
    }, 200);

    nomeDestaque.innerText = pokeData.name.toUpperCase();

    // Aplica a tradução e a classe de cor
    tipoDestaque.className = `tipo ${tipoPrincipalIngles}`;
    tipoDestaque.innerText = traducaoTipos[tipoPrincipalIngles] || tipoPrincipalIngles.toUpperCase();

    // Limpeza da descrição (Removendo quebras de linha estranhas da API)
    descDestaque.innerText = descricao.replace(/[\n\f\r]/g, " ");

    // Atualiza cor de fundo
    const corFundo = coresTipos[tipoPrincipalIngles] || '#333';
    containerDestaque.style.background = `linear-gradient(135deg, rgba(33,33,33,1) 0%, ${corFundo}88 100%)`;

    // Atualiza as barras de Status
    const hp = pokeData.stats[0].base_stat;
    const atk = pokeData.stats[1].base_stat;
    const def = pokeData.stats[2].base_stat;
    const spd = pokeData.stats[5].base_stat;

    const calcWidth = (valor) => Math.min((valor / 150) * 100, 100) + '%';
    barHp.style.width = calcWidth(hp);
    barAtk.style.width = calcWidth(atk);
    barDef.style.width = calcWidth(def);
    barSpd.style.width = calcWidth(spd);
}

// Quando a página abrir, executa as funções
carregarEstatisticas();
carregarPokemonDestaque();