const URL =
  window.location.origin + window.location.pathname + window.location.search

const header = document.querySelector('#partial-discussion-sidebar')
header.style = `position: relative;height: 100%;`
const wrapper = header.appendChild(document.createElement('div'))
wrapper.style = `
      position:sticky;
      position: -webkit-sticky;
      top:10px;`
const title = document.createElement('div')
title.style = `font-weight: bold`
title.appendChild(document.createTextNode('Reactions'))
wrapper.appendChild(title)

addReactionNav()

function addReactionNav() {
  // Grabbing all 👍
  const plusOnes = document.querySelectorAll('[alias="+1"].mr-1')

  plusOnes.forEach(node => {
    const plusOneText = node.parentElement.parentElement.innerText

    let id = null
    while (id == null || node != null) {
      if (node.tagName === 'A' && node.name) {
        id = node.name
        break
      }

      if (node.id) {
        id = node.id
        break
      }

      node = node.parentNode
    }
    const postURL = URL + '#' + id

    const a = document.createElement('a')
    const linkText = document.createTextNode('\n' + plusOneText)
    a.appendChild(linkText)
    a.title = plusOneText
    a.href = postURL
    a.style = `display:block;`
    wrapper.appendChild(a)
  })
}
