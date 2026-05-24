# PokéHub - Fullstack Pokémon Experience

O **PokéHub** é uma aplicação web completa voltada para entusiastas de Pokémon, unindo uma Pokédex avançada, sistemas de jogos, gerenciamento de equipe e uma área administrativa robusta. O projeto foca em uma interface moderna utilizando **Glassmorphism** e integração em tempo real com a **PokeAPI**.

## Tecnologias Utilizadas

- **Backend:** Python com [Flask](https://flask.palletsprojects.com/)
- **Frontend:** HTML5, CSS3 (Variáveis, Flexbox, Grid) e JavaScript Vanilla.
- **Banco de Dados:** SQLite3 para persistência de usuários e coleções.
- **API Externa:** [PokeAPI](https://pokeapi.co/)
- **Segurança:** Criptografia de senhas com Werkzeug Security.

## Funcionalidades Principais

### Pokédex Nacional & Filtros

- Busca instantânea com **autocomplete**.
- Filtros cumulativos por **Tipo** e **Geração**.
- Carregamento otimizado com cache local para evitar requisições redundantes.

### Mini-games & Social

- **Quem é esse Pokémon? (Silhueta):** Jogo de adivinhação visual.
- **Modo Clássico (Wordle-style):** Adivinhe o Pokémon do dia baseado em atributos (altura, peso, geração e tipo).
- **Sistema de Tentativas:** Feedback visual com setas e cores para indicar proximidade do alvo.

### Coleção e Equipe

- **Booster Packs:** Sistema de "Gacha" para abrir pacotes e ganhar Pokémons com diferentes raridades.
- **Team Builder:** Monte sua equipe de elite com até 6 Pokémons da sua coleção pessoal.
- **Perfil do Treinador:** Gerenciamento de dados e foto de perfil customizada.

### Painel Administrativo (Master Control)

- **Destaque do Dia:** O Admin pode forçar qualquer Pokémon para aparecer na Home.
- **Controle de Jogos:** Definição manual de alvos para os mini-games.
- **Gestão de Usuários:** Visualização de estatísticas (total de capturas) e moderação de treinadores.

## Interface (UI/UX)

O design foi construído sob o conceito de **Glassmorphism**, utilizando transparências, desfoques de fundo e bordas em neon para criar uma estética futurista, mas que respeita a paleta de cores clássica da franquia (Vermelho e Amarelo).

## Como rodar o projeto

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/Pokemon-site.git
    ```

2.  **Instale as dependências:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Inicie a aplicação:**

    ```bash
    python app.py
    ```

4.  **Acesse no navegador:**
    `http://127.0.0.1:5000`

---

## Notas de Desenvolvimento

Este projeto foi desenvolvido com foco em performance de rede, minimizando chamadas de API através de cálculos de ID e caching no Frontend. A estrutura de rotas foi organizada utilizando **Blueprints** para garantir a escalabilidade do código.

---

_Desenvolvido por Pedro Nadalon Klippel - 2024_
