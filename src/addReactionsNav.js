const header = document.querySelector('#partial-discussion-sidebar')
header.style = 'position: relative; height: 100%;'

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

  wrapper.style =
    'position: sticky; position: -webkit-sticky; top: ' + top + 'px;'
  return wrapper
}

// Scan the site for reactions and stick it into the wrapper
function addReactionNav() {
  wrapper.innerHTML = ''
  wrapper.appendChild(Title())
  wrapper.appendChild(Reactions())
  wrapper.appendChild(Credits())
}

function Title() {
  const title = document.createElement('div')
  title.style = 'font-weight: bold; margin: 1.25rem 0 0.5rem 0;'
  title.appendChild(document.createTextNode('Reactions'))
  return title
}

function Reactions() {
  const all = document.createElement('div')

  const issueUrl =
    window.location.origin + window.location.pathname + window.location.search

  // Grabbing all reactions Reactions 👍 🚀 🎉 😄 ❤️ 😕 👎 👀
  document
    .querySelectorAll('.comment-reactions-options')
    .forEach((reactionSection) => {
      let reactions = ''
      reactionSection
        .querySelectorAll('button[class*="reaction"]')
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
      a.style = 'display: block;'

      all.appendChild(a)
    })

  return all
}

function Credits() {
  const credits = document.createElement('div')
  credits.style =
    'display: flex; align-items: center; margin: 1rem 0; font-size: 0.8rem; color: #777;'

  const laptopEmojiSpan = document.createElement('span')
  laptopEmojiSpan.style = 'margin-right: 0.25rem;'
  laptopEmojiSpan.appendChild(document.createTextNode('💻  '))

  const extensionLink = document.createElement('a')
  extensionLink.href =
    'https://github.com/Norfeldt/github-issue-reactions-browser-extension'
  extensionLink.appendChild(document.createTextNode('Reactions Extension'))

  const madeBySpan = document.createElement('span')
  madeBySpan.style = 'margin: 0 0.25rem;'
  madeBySpan.appendChild(document.createTextNode('made by'))

  const authorLink = document.createElement('a')
  authorLink.href = 'https://github.com/Norfeldt'
  authorLink.appendChild(document.createTextNode('Norfeldt'))

  credits.appendChild(laptopEmojiSpan)
  credits.appendChild(extensionLink)
  credits.appendChild(madeBySpan)
  credits.appendChild(authorLink)

  return credits
}
