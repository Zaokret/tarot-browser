const grid = document.getElementById('cardGrid');
const searchInput = document.getElementById('search');
const suitFilter = document.getElementById('suitFilter');
const deckButtons = document.querySelectorAll('.deck-toggle button');
const randomButton = document.getElementById('random-button');
const clearButton = document.getElementById('clear-button')

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
  console.log({query, suit, currentDeck})
  cards.forEach(c => {
      const cardEl = document.getElementById(idFromCard(c))
      const toKeep = (!suit || c.suit === suit) && c.name.toLowerCase().includes(query)
      if(toKeep) {
          cardEl.src = c[currentDeck.toLowerCase()]
      }
      return toKeep ? cardEl.parentElement.parentElement.classList.remove('hide') : cardEl.parentElement.parentElement.classList.add('hide');
    }
  );
}

searchInput.addEventListener('input', renderCards);
suitFilter.addEventListener('change', renderCards);
randomButton.addEventListener('click', () => {
  const randomIndex = Math.floor(Math.random() * 78);
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
    deckButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDeck = btn.dataset.deck;
    renderCards();
  });
});
})