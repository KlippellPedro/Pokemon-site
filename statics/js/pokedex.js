// ============================================================
// VARIÁVEIS E SELEÇÃO DE ELEMENTOS HTML
// ============================================================

const pokedexList = document.getElementById('pokedex-list');
const pokemonInput = document.getElementById('pokemon-input');
const btnBusca = document.getElementById('btn-busca');
const btnCarregar = document.getElementById('btn-carregar');
const autocompleteList = document.getElementById('pokedex-autocomplete-list');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroGeracao = document.getElementById('filtro-geracao');
const btnLimpar = document.getElementById('btn-limpar');

// Variáveis de controle para a lista principal (Cards)
let offset = 0; // Controle de quantos já foram carregados
const limit = 20; // Quantos carrega por vez na tela

// Lista global para o autocomplete
let listaNomesPokemons = [];

// Cache para filtros (evita requisições repetidas e melhora a velocidade)
const cacheTipos = {};
const cacheGens = {};

// Tradução de tipo via sistema de idioma global (theme-lang.js)
function getTipoTraduzido(tipo) {
    if (typeof t === 'function') return t('tipo.' + tipo) || tipo.toUpperCase();
    return tipo.toUpperCase();
}

function getLabelTipo() {
    if (typeof _langAtual !== 'undefined') return _langAtual === 'en' ? 'Type' : 'Tipo';
    return 'Tipo';
}

function getLabelGen() {
    if (typeof _langAtual !== 'undefined') return _langAtual === 'en' ? 'GEN' : 'GER';
    return 'GER';
}

// ============================================================
// 1. SISTEMA DE AUTOCOMPLETE (PESQUISA COM SUGESTÃO)
// ============================================================

// Busca TODOS os nomes disponíveis na API (usamos 10000 para garantir que pegue todos)
async function carregarNomesParaSugestao() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await res.json();
        listaNomesPokemons = data.results;
    } catch (error) {
        console.error("Erro ao carregar nomes para sugestão:", error);
    }
}

// Função para descobrir a Geração pelo ID (Muito mais rápido que chamar a API)
function getGenerationById(id) {
    if (id <= 151) return "I";
    if (id <= 251) return "II";
    if (id <= 386) return "III";
    if (id <= 493) return "IV";
    if (id <= 649) return "V";
    if (id <= 721) return "VI";
    if (id <= 809) return "VII";
    if (id <= 905) return "VIII";
    return "IX";
}

// Lógica de filtrar e mostrar os nomes enquanto o usuário digita
let debounceTimer;
function setupAutocomplete() {
    const inputs = document.querySelectorAll('input[autocomplete="off"]');

    inputs.forEach(input => {
        let list = (input.id === 'pokemon-input')
            ? document.getElementById('pokedex-autocomplete-list')
            : input.parentElement.querySelector('.autocomplete-items');

        if (!input || !list) return;

        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            const valor = this.value.toLowerCase().trim();
            list.innerHTML = '';

            if (!valor) return false;

            debounceTimer = setTimeout(() => {
                const sugestoes = listaNomesPokemons.filter(p => p.name.startsWith(valor));
                const sugestoesLimitadas = sugestoes.slice(0, 15);

                sugestoesLimitadas.forEach(pokemon => {
                    const item = document.createElement('div');
                    const id = pokemon.url.split('/').filter(Boolean).pop();
                    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

                    item.innerHTML = `
                        <img src="${spriteUrl}" class="autocomplete-icon">
                        <span><strong>${pokemon.name.substr(0, valor.length)}</strong>${pokemon.name.substr(valor.length)}</span>
                    `;

                    item.addEventListener('click', function () {
                        input.value = pokemon.name;
                        list.innerHTML = '';
                        if (input.id === 'pokemon-input') buscarPokemon();
                    });

                    list.appendChild(item);
                });
            }, 200);
        });
    });
}

// Fecha a lista se clicar em qualquer outro lugar fora do input
document.addEventListener('click', function (e) {
    document.querySelectorAll('.autocomplete-items').forEach(list => {
        if (!e.target.matches('input[autocomplete="off"]')) list.innerHTML = '';
    });
});


// ============================================================
// 2. CARREGAMENTO DOS CARDS (PÁGINA INICIAL DA POKÉDEX)
// ============================================================

// Função para carregar informações de vários pokémons da PokeApi aos poucos
async function fetchPokemons() {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
        const res = await fetch(url);
        const data = await res.json();

        // Criamos um array de promessas para carregar tudo em paralelo
        const detailPromises = data.results.map(async (pokemon) => {
            const pokeRes = await fetch(pokemon.url);
            const pokeData = await pokeRes.json();

            pokeData.generationName = getGenerationById(pokeData.id);
            return pokeData;
        });

        const fullPokemonData = await Promise.all(detailPromises);
        fullPokemonData.forEach(poke => createPokemonCard(poke));

        offset += limit; // Prepara o offset para a próxima vez que clicar em "Carregar Mais"
    } catch (error) {
        console.error("Erro ao buscar lista:", error);
    }
}


// ============================================================
// 3. BUSCAR UM POKÉMON ESPECÍFICO (PELO BOTÃO OU ENTER)
// ============================================================

async function aplicarFiltros() {
    const termo = pokemonInput?.value?.toLowerCase().trim();
    const tipo = filtroTipo?.value || "";
    const gen = filtroGeracao?.value || "";

    // Se não houver nada, reseta
    if (!termo && !tipo && !gen) return limparFiltros();

    if (pokedexList) pokedexList.innerHTML = '';
    if (btnCarregar) btnCarregar.style.display = 'none';
    if (pokedexList) pokedexList.innerHTML = '<p style="text-align:center; color:white; width:100%;">Pesquisando na Pokédex... ✨</p>';

    try {
        let resultados = [...listaNomesPokemons];

        // 1. Filtro por Nome (Local - Instantâneo)
        if (termo) {
            resultados = resultados.filter(p => p.name.includes(termo) || p.url.includes(`/${termo}/`));
        }

        // 2. Filtro por Tipo (Requer uma chamada de lista)
        if (tipo) {
            let nomesNoTipo;
            if (cacheTipos[tipo]) {
                nomesNoTipo = cacheTipos[tipo];
            } else {
                const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
                const data = await res.json();
                nomesNoTipo = data.pokemon.map(p => p.pokemon.name);
                cacheTipos[tipo] = nomesNoTipo;
            }
            resultados = resultados.filter(p => nomesNoTipo.includes(p.name));
        }

        // 3. Filtro por Geração (Baseado em IDs da API)
        if (gen) {
            let nomesNaGen;
            if (cacheGens[gen]) {
                nomesNaGen = cacheGens[gen];
            } else {
                const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
                const data = await res.json();
                nomesNaGen = data.pokemon_species.map(p => p.name);
                cacheGens[gen] = nomesNaGen;
            }
            resultados = resultados.filter(p => nomesNaGen.includes(p.name));
        }

        if (resultados.length === 0) throw new Error();

        if (pokedexList) pokedexList.innerHTML = '';

        // Limitamos a exibição para os primeiros 40 resultados para manter a velocidade
        const limitados = resultados.slice(0, 40);
        const detailPromises = limitados.map(async (p) => {
            const res = await fetch(p.url.includes('pokemon/') ? p.url : `https://pokeapi.co/api/v2/pokemon/${p.name}`);
            const data = await res.json();
            data.generationName = getGenerationById(data.id);
            return data;
        });

        const finalData = await Promise.all(detailPromises);
        finalData.forEach(createPokemonCard);

    } catch (error) {
        if (pokedexList) pokedexList.innerHTML = `<p style="text-align:center; color:white; width:100%;">Nenhum Pokémon encontrado com esses filtros.</p>`;
    }
}

function limparFiltros() {
    if (pokemonInput) pokemonInput.value = "";
    if (filtroTipo) filtroTipo.value = "";
    if (filtroGeracao) filtroGeracao.value = "";
    if (pokedexList) pokedexList.innerHTML = '';
    offset = 0;
    if (btnCarregar) btnCarregar.style.display = 'block';
    fetchPokemons();
}

async function buscarPokemon() {
    aplicarFiltros();
}


// ============================================================
// 4. CRIAR O HTML DO CARD NA TELA
// ============================================================

function createPokemonCard(pokemon) {
    if (!pokedexList) return; // Segurança: Se não houver a lista na tela, não tenta criar o card

    const card = document.createElement('div');
    const tipoPrincipal = pokemon.types[0].type.name;
    const tipoTraduzido = getTipoTraduzido(tipoPrincipal);
    const gen = pokemon.generationName || '';

    card.classList.add('pokemon-card', tipoPrincipal);

    card.innerHTML = `
        <div class="img-container">
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        </div>
        <div class="info">
            <span class="number">#${pokemon.id.toString().padStart(3, '0')}</span>
            <h3 class="name">${pokemon.name}</h3>
            <p class="type" data-tipo="${tipoPrincipal}">${getLabelTipo()}: ${tipoTraduzido}</p>
            <p class="generation" data-gen="${gen}"><strong>${getLabelGen()} ${gen}</strong></p>
        </div>
    `;

    pokedexList.appendChild(card); // Adiciona na tela
}


// ============================================================
// 5. INICIALIZAÇÃO E EVENTOS
// ============================================================

if (btnCarregar) btnCarregar.addEventListener('click', fetchPokemons);
if (btnBusca) btnBusca.addEventListener('click', aplicarFiltros);
if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
if (filtroGeracao) filtroGeracao.addEventListener('change', aplicarFiltros);
if (btnLimpar) btnLimpar.addEventListener('click', limparFiltros);

// Permite dar ENTER na busca para acionar a função
if (pokemonInput) pokemonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (autocompleteList) autocompleteList.innerHTML = ''; // Limpa a lista de sugestões
        aplicarFiltros();
    }
});

// Quando idioma muda, atualiza tipos e gerações nos cards visíveis
document.addEventListener('langChanged', function (e) {
    const lang = e.detail.lang;
    document.querySelectorAll('.type[data-tipo]').forEach(function (el) {
        const tipo = el.getAttribute('data-tipo');
        const label = lang === 'en' ? 'Type' : 'Tipo';
        el.textContent = label + ': ' + getTipoTraduzido(tipo);
    });
    document.querySelectorAll('.generation[data-gen]').forEach(function (el) {
        const gen = el.getAttribute('data-gen');
        const label = lang === 'en' ? 'GEN' : 'GER';
        el.innerHTML = '<strong>' + label + ' ' + gen + '</strong>';
    });
});

// Ao carregar a página, executa estas duas funções:
if (pokedexList) {
    fetchPokemons();
}
carregarNomesParaSugestao().then(() => {
    setupAutocomplete();
});