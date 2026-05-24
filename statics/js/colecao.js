const pokemonInput = document.getElementById('pokemon-input');
const autocompleteList = document.getElementById('colecao-autocomplete-list');
const filtroForm = document.querySelector('.colecao-filtros');

let listaPokemonsColecao = [];

// Busca os Pokémons da coleção do usuário para o autocomplete
async function carregarSugestoesColecao() {
    try {
        const res = await fetch('/api/collection/autocomplete_data');
        const data = await res.json();
        listaPokemonsColecao = data;
    } catch (e) {
        console.error("Erro ao carregar lista de Pokémons da coleção para sugestão:", e);
    }
}

pokemonInput.addEventListener('input', function () {
    const valor = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';

    if (!valor) return;

    // Filtra apenas os pokémons que você JÁ TEM na coleção
    const filtrados = listaPokemonsColecao.filter(p => p.nome.toLowerCase().startsWith(valor));

    // Mostra as primeiras sugestões com ícone e nome
    const sugestoesLimitadas = filtrados.slice(0, 15);

    sugestoesLimitadas.forEach(pokemon => {
        const item = document.createElement('div');
        item.innerHTML = `
            <img src="${pokemon.imagem}" class="autocomplete-icon" style="width:40px; height:40px; image-rendering:pixelated;">
            <span><strong>${pokemon.nome.substring(0, valor.length)}</strong>${pokemon.nome.substring(valor.length)}</span>
        `;

        // Ao clicar na sugestão, preenche o campo e envia o formulário para filtrar a página
        item.addEventListener('click', function () {
            pokemonInput.value = pokemon.nome;
            autocompleteList.innerHTML = '';
            filtroForm.submit();
        });

        autocompleteList.appendChild(item);
    });
});

// Fecha a lista se o usuário clicar fora do campo
document.addEventListener('click', (e) => {
    if (e.target !== pokemonInput) autocompleteList.innerHTML = '';
});

carregarSugestoesColecao();