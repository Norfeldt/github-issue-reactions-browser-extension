const header = document.querySelector('#partial-discussion-sidebar')
header.style = `position: relative;height: 100%;`
let wrapper = getWrapper()

addReactionNav(wrapper)

// Select the node that will be observed for mutations.
const targetNode = document.querySelector('body')

// Options for the observer (which mutations to observe).
const config = {
  childList: true,
  subtree: true,
}

// Create an observer instance linked to the callback function.
const observer = new MutationObserver((mutations) => {
  if (
    !targetNode.contains(wrapper) ||
    mutations.some((mutation) => mutation.target.matches('.js-timeline-item'))
  ) {
    wrapper.remove()
    wrapper = getWrapper()
    addReactionNav()
  }
})

// Start observing the target node for configured mutations.
observer.observe(targetNode, config)

// Create a sticking wrapper to place all reactions
function getWrapper() {
  const header = document.querySelector('#partial-discussion-sidebar')
  const wrapper = header.appendChild(document.createElement('div'))
  const top =
    document.querySelectorAll('.gh-header-sticky').length > 0 ? 70 : 10

  wrapper.style = `
      position: sticky;
      position: -webkit-sticky;
      top: ${top}px;`
  return wrapper
}

// Scan the site for reactions and stick it into the wrapper
function addReactionNav() {
  // Section header
  const title = document.createElement('div')
  title.style = `font-weight: bold`
  title.appendChild(document.createTextNode('Reactions'))
  wrapper.appendChild(title)

  const issueUrl =
    window.location.origin + window.location.pathname + window.location.search

  // Grabbing all reactions Reactions 👍 🚀 🎉 😄 ❤️ 😕 👎 👀
  document
    .querySelectorAll('div.comment-reactions-options')
    .forEach((reactionSection) => {
      let reactions = ''
      reactionSection
        .querySelectorAll('button.reaction-summary-item')
        .forEach((btn) => {
          reactions += btn.textContent.replace(/\s+/g, '') + ' '
        })
      const a = document.createElement('a')
      const linkText = document.createTextNode('\n' + reactions)
      a.appendChild(linkText)
      a.title = reactions

      let id = null
      while (id == null || node != null) {
        if (reactionSection.tagName === 'A' && reactionSection.name) {
          id = reactionSection.name
          break
        }
        if (reactionSection.id) {
          id = reactionSection.id
          break
        }
        reactionSection = reactionSection.parentNode
      }

      a.href = issueUrl + '#' + id
      a.style = `display:block;`

      wrapper.appendChild(a)
    })

  // Footer
  const footer = document.createElement('div')
  footer.style = `font-weight: bold`

  const line1Div = document.createElement('div')
  const line2Div = document.createElement('div')

  const laptopEmojiSpan = document.createElement('span')
  laptopEmojiSpan.appendChild(document.createTextNode('💻  '))
  line1Div.appendChild(laptopEmojiSpan)

  const extensionLink = document.createElement('a')
  extensionLink.href =
    'https://github.com/NorfeldtAbtion/github-issue-reactions-browser-extension'
  extensionLink.appendChild(document.createTextNode('Reactions Extension'))
  line1Div.appendChild(extensionLink)

  const madeBySpan = document.createElement('span')
  madeBySpan.appendChild(document.createTextNode('Made By '))
  line2Div.appendChild(madeBySpan)

  const authorLink = document.createElement('a')
  authorLink.href = 'https://github.com/Norfeldt'
  authorLink.appendChild(document.createTextNode('Norfeldt'))
  line2Div.appendChild(authorLink)

  const waveEmojiSpan = document.createElement('span')
  waveEmojiSpan.appendChild(document.createTextNode(' 👋'))
  footer.appendChild(waveEmojiSpan)

  footer.appendChild(line1Div)
  footer.appendChild(line2Div)
  wrapper.appendChild(footer)
}
