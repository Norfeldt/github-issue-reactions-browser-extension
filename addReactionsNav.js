// Shorthand helpers for querying elements.
const one = (selector) => document.querySelector(selector)
const all = (selector) => document.querySelectorAll(selector)
const elm = (element) => document.createElement(element)
const text = (text) => document.createTextNode(text)

const header = one('#partial-discussion-sidebar')
header.style = 'position: relative; height: 100%;'

let wrapper = getWrapper()

addReactionNav(wrapper)

// Select the node that will be observed for mutations.
const targetNode = one('body')

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
  const header = one('#partial-discussion-sidebar')
  const wrapper = header.appendChild(elm('div'))
  const top = all('.gh-header-sticky').length > 0 ? 70 : 10

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
  const title = elm('div')
  title.style = 'font-weight: bold; margin: 1.25rem 0 0.5rem 0;'
  title.appendChild(text('Reactions'))
  return title
}

function Reactions() {
  const issueUrl =
    window.location.origin + window.location.pathname + window.location.search

  // Grabbing all reactions Reactions 👍 🚀 🎉 😄 ❤️ 😕 👎 👀
  const reactionSections = all('.comment-reactions-options')
  const reactions = elm('div')
  reactionSections.forEach((reactionSection) =>
    reactions.appendChild(ReactionItem(reactionSection, issueUrl))
  )
  return reactions
}

function ReactionItem(reactionSection, issueUrl) {
  // Get the reaction ID
  let id = getCommentId(reactionSection)

  // Construct the reaction text
  let reactions = elm('div')
  reactionSection
    .querySelectorAll('button.reaction-summary-item')
    .forEach((btn) => {
      // Get an array of the emoji and the count for each
      // reaction
      const reaction = btn.textContent
        .replace(/\s+/g, ' ')
        .split(' ')
        .filter(Boolean)

      const emoji = elm('span')
      emoji.appendChild(text(reaction[0]))
      emoji.style = 'margin-right: 0.4rem'

      const count = elm('span')
      count.style = 'margin-right: 0.6rem'
      count.appendChild(text(reaction[1]))

      reactions.appendChild(emoji)
      reactions.appendChild(count)
    })

  // Create the reaction link
  const a = elm('a')
  a.appendChild(reactions)
  a.title = reactions
  a.href = issueUrl + '#' + id
  a.style = 'display: block; margin: 0.2rem 0;'
  return a
}

function Credits() {
  const credits = elm('div')
  credits.style = 'margin: 1rem 0; font-size: 0.8rem; color: #777;'

  const extensionLink = elm('a')
  extensionLink.style = 'margin-left: 0.5rem; font-weight: bold'
  extensionLink.href =
    'https://github.com/NorfeldtAbtion/github-issue-reactions-browser-extension'
  extensionLink.appendChild(text('Reactions Extension'))

  const authorLink = elm('a')
  authorLink.href = 'https://github.com/Norfeldt'
  authorLink.appendChild(text('Norfeldt'))

  const coAuthorLink = elm('a')
  coAuthorLink.href = 'https://github.com/danawoodman'
  coAuthorLink.appendChild(text('danawoodman'))

  credits.appendChild(text('💻  '))
  credits.appendChild(extensionLink)
  credits.appendChild(text(' made by\n'))
  credits.appendChild(authorLink)
  credits.appendChild(text(', '))
  credits.appendChild(coAuthorLink)

  return credits
}

/**
 * Traverse up the tree of parent elements till we find
 * the link to the comment so we can get the reaction link.
 */
function getCommentId(elm) {
  let id = null
  let curr = elm
  while (id === null || node !== null) {
    if (elm.tagName === 'A' && curr.name) {
      id = curr.name
      break
    }
    if (curr.id) {
      id = curr.id
      break
    }
    curr = curr.parentNode
  }
  return id
}
