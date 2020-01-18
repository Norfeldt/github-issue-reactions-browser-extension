const URL =
  window.location.origin + window.location.pathname + window.location.search
const header = document.querySelector('#partial-discussion-sidebar')
header.style = `position: relative;height: 100%;`
let wrapper = getWrapper()

// The isolated world made it difficult to detect DOM changes in the shared DOM
// So this monkey-hack to make it refresh when ..
setInterval(() => {
  wrapper.remove()
  wrapper = getWrapper()
  addReactionNav()
}, 1000)

function getWrapper() {
  const header = document.querySelector('#partial-discussion-sidebar')
  const wrapper = header.appendChild(document.createElement('div'))
  wrapper.style = `
      position:sticky;
      position: -webkit-sticky;
      top:10px;`
  return wrapper
}

function addReactionNav() {
  const title = document.createElement('div')
  title.style = `font-weight: bold`
  title.appendChild(document.createTextNode('Reactions'))
  wrapper.appendChild(title)

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
