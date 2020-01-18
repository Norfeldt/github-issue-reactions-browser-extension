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

  // Grabbing all reactions Reactions 👍 🚀 🎉 😄 ❤️ 😕 👎 👀
  const reactionsNodes = document.querySelectorAll(`
    [alias="+1"].mr-1,
    [alias="rocket"].mr-1,
    [alias="tada"].mr-1,
    [alias="heart"].mr-1,
    [alias="smile"].mr-1,
    [alias="thinking_face"].mr-1,
    [alias="-1"].mr-1,
    [alias="eyes"].mr-1
  `)

  const reactionsNodesParents = [
    ...new Set(
      Array.from(reactionsNodes).map(node => node.parentElement.parentElement)
    ),
  ]

  reactionsNodesParents.forEach(node => {
    const a = document.createElement('a')
    const linkText = document.createTextNode('\n' + node.innerText)
    a.appendChild(linkText)
    a.title = node.innerText

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
    a.href = postURL
    a.style = `display:block;`

    wrapper.appendChild(a)
  })
}
