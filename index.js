const grid = document.getElementById('cardGrid');
const searchInput = document.getElementById('search');
const suitFilter = document.getElementById('suitFilter');
const deckButtons = document.querySelectorAll('.deck-toggle button');
const randomButton = document.getElementById('random-button');
const clearButton = document.getElementById('clear-button')

const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const img = entry.target;
        img.setAttribute('loading', entry.isIntersecting ? 'eager' : 'lazy')
    })
})

const images = document.querySelectorAll('#cardGrid .card img')
Array.from(images).forEach(img => io.observe(img));


function idFromCard(card) {
    const letter = card.suit[0].toLowerCase();
    const numPart = card.number.toString().padStart(2, '0');
    return letter + numPart
}

const cachedCards = localStorage.getItem('tb_cards')
const req = cachedCards ? Promise.resolve(JSON.parse(cachedCards)) : fetch('index.json').then(res => res.json())

req.then(cards => {
    localStorage.setItem('tb_cards', JSON.stringify(cards))
    let currentDeck = 'rider';

    function renderCards() {
        const query = searchInput.value.toLowerCase();
        const suit = suitFilter.value;
        console.log({ query, suit, currentDeck })

        const eagerEls = Array.from(images).filter(img => img.getAttribute('loading') === 'eager');

        function distanceToNearestEager(el) {
            if (eagerEls.length === 0) return Infinity;
            const elTop = el.offsetTop;
            return Math.min(...eagerEls.map(e => Math.abs(elTop - e.offsetTop)));
        }

        Array.from(images)
            .sort((a, b) => {
                const aEager = a.getAttribute('loading') === 'eager';
                const bEager = b.getAttribute('loading') === 'eager';

                if (aEager && !bEager) return -1;
                if (!aEager && bEager) return 1;
                if (aEager && bEager) return a.offsetTop - b.offsetTop;
                return distanceToNearestEager(a) - distanceToNearestEager(b);
            })
            .forEach(img => {
                const suitLetter = img.id[0]
                const numPart = parseInt(img.id[1] + img.id[2])
                const c = cards.find(card => card.suit.toLowerCase().startsWith(suitLetter) && card.number === numPart)
                const toKeep = (!suit || c.suit === suit) && c.name.toLowerCase().includes(query)
                if (toKeep) {
                    img.src = c[currentDeck.toLowerCase()]
                }
                return toKeep ? img.parentElement.parentElement.classList.remove('hide') : img.parentElement.parentElement.classList.add('hide');
            })
    }

    searchInput.addEventListener('input', renderCards);
    suitFilter.addEventListener('change', renderCards);
    randomButton.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * cards.length);
        searchInput.value = cards[randomIndex].name
        renderCards()
    })
    clearButton.addEventListener('click', () => {
        searchInput.value = ''
        suitFilter.value = ''
        renderCards()
    })

    deckButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.deck !== currentDeck) {
                deckButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDeck = btn.dataset.deck;
                renderCards();
            }
        });
    });
})