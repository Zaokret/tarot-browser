const grid = document.getElementById('cardGrid');
const searchInput = document.getElementById('search');
const suitFilter = document.getElementById('suitFilter');
const deckButtons = document.querySelectorAll('.deck-toggle button');
const randomButton = document.getElementById('random-button');
const clearButton = document.getElementById('clear-button')

function getDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  if (/android/i.test(ua)) {
    return 'mobile';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'mobile';
  }
  if (/windows phone/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

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

// const cachedCards = localStorage.getItem('tb_cards')
// const req = cachedCards ? Promise.resolve(JSON.parse(cachedCards)) : fetch('index.json').then(res => res.json())
let cards = []
fetch('index.json').then(res => res.json()).then(data => {
      cards=data;
  // localStorage.setItem('tb_cards', JSON.stringify(cards))
    let currentDeck = 'rider';

    const cardElements = Array.from(images)
    cards.forEach(card => {
      const cardEl = cardElements.find(el => el.id === idFromCard(card))
      cardEl.parentElement.dataset.audio = card.audio
      cardEl.parentElement.dataset.details = new URL(card.details, location.origin)
    })

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
                return toKeep ? img.parentElement.classList.remove('hide') : img.parentElement.classList.add('hide');
            })
    }

    searchInput.addEventListener('input', renderCards);
    suitFilter.addEventListener('change', () => {
      searchInput.value = ''
      renderCards()
    });
    randomButton.addEventListener('click', () => {
        const suit = suitFilter.value;
        const shownCards = cards.filter(card => !suit || card.suit === suit)
        const randomIndex = Math.floor(Math.random() * shownCards.length);
        searchInput.value = shownCards[randomIndex].name
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

    Array.from(grid.children).forEach(btn => btn.addEventListener('click', (e) => {
      const device = getDeviceType();
      if(device === 'mobile') {
        window.open(btn.dataset.details, "_blank");
      } else if(device === 'desktop') {
        const { title, url } = btn.dataset
        openWindow(url, title, e.clientX, e.clientY)
      }
    }))
})



let winCount = 0;
let offsetX = 0;
let offsetY = 0;
let draggingPopover = null;
let popoverStack = [];

function openWindow(url, title, x, y) {
  winCount++;
  const id = "window" + winCount;

  const win = document.createElement("div");
  win.className = "window";
  win.id = id;
  win.style.left = x + 10 + 'px'
  win.style.top = y + 20 + 'px'
  win.style.width = "400px";
  win.style.height = "500px";

  win.innerHTML = `
    <div class="window-header">
      <span>${title}</span>
      <div>
        <button onclick="openInNewWindow('${id}')">⧉</button>
        <button onclick="closeWindow('${id}')">✖</button>
      </div>
    </div>
    <div class="window-body">
      <iframe src="${url}"></iframe>
    </div>
  `;

  document.body.appendChild(win);

  popoverStack.push(win);
  updateZIndices();

  const header = win.querySelector('.window-header');
  header.addEventListener('mousedown', (e) => {
    draggingPopover = win;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  win.addEventListener('mousedown', (e) => {
    bringToFront(win)
  });
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (el) {
    const index = popoverStack.indexOf(el);
    if (index !== -1) popoverStack.splice(index, 1);
    el.remove();
    updateZIndices();
  }
}

function openInNewWindow(id) {
  const iframe = document.querySelector(`#${id} iframe`);
  if (iframe) window.open(iframe.src.replace('popups', 'pages'), "_blank");
}

function onMouseMove(e) {
  if (!draggingPopover) return;
  draggingPopover.style.left = `${e.clientX - offsetX}px`;
  draggingPopover.style.top = `${e.clientY - offsetY}px`;
}

function onMouseUp() {
  draggingPopover = null;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

function bringToFront(win) {
    console.log('hello')
  const index = popoverStack.indexOf(win);
  if (index !== -1) popoverStack.splice(index, 1);
  popoverStack.push(win);
  updateZIndices();
}

function updateZIndices() {
  popoverStack.forEach((win, i) => {
    win.style.zIndex = 10 + i;
  });
}