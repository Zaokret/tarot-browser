const cachedCards = localStorage.getItem('tb_cards')
const req = cachedCards ? Promise.resolve(JSON.parse(cachedCards)) : fetch('index.json').then(res => res.json())

function flattenHref(href) {
    const parts = href.split(`/`)
    const lastPart = parts[parts.length-1]
    return `./${lastPart}`;
}

function createEmoji(emoji) {
    const emojiEl = document.createElement('span')
    emojiEl.textContent = emoji
    return emojiEl
}

function insertFooter(prevCard, nextCard) {
    const footer = document.createElement('div')
    footer.id = 'sticky-footer'
    const prevEl = document.createElement('div')
    if(prevCard) {
        const linkEl = document.createElement('a')
        linkEl.href = flattenHref(prevCard.details)
        linkEl.textContent = '⏮ '+ prevCard.name
        prevEl.append(linkEl)
    }

    const homeDiv = document.createElement('div')
    homeDiv.id='home-link-wrapper'
    const homeEl = document.createElement('a')
    homeEl.href = document.location.origin + '/tarot-browser'
    homeEl.textContent = '🏠'
    homeDiv.append(homeEl)


    const nextEl = document.createElement('div')
    if(nextCard) {
        const linkEl = document.createElement('a')
        linkEl.href = flattenHref(nextCard.details)
        linkEl.textContent = nextCard.name + ' ⏭'
        nextEl.append(linkEl)
    }
    footer.append(prevEl, homeDiv, nextEl)
    document.body.append(footer)
}

const pathparts = document.location.pathname.split(`/`)
const lastPart = pathparts[pathparts.length-1]

req.then(arr => {
    const currIndex = arr.findIndex(item => item.details.includes(lastPart))
    const prevIndex = Math.max(0, currIndex-1)
    const nextIndex = Math.min(arr.length - 1, currIndex+1)
    insertFooter(arr[prevIndex], arr[nextIndex])
})