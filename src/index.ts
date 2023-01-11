console.log('running github issue reactions', Math.random())

const [sideBarId, wrapperId] = [
  '#partial-discussion-sidebar',
  '#reactions-wrapper',
]

function debounce(func: Function, timeout = 2000): Function {
  let timer: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      // @ts-expect-error
      func.apply(this, args)
    }, timeout)
  }
}

// CHANGE PAGE
const mainObserver = new MutationObserver((mutations) => {
  // console.log('mainObserver')
  debounce(() => {
    startObservingComments()
    addReactionNav()
  })()
})

const layoutMain = document.querySelector('.Layout-main')
if (layoutMain !== null) {
  mainObserver.observe(layoutMain, {
    childList: true,
    subtree: true,
  })
}

function startObservingComments() {
  // console.log('startObservingComments')
  const commentSection =
    document.querySelector('.Layout-main') ?? // Issues & PR
    document.querySelector('.js-discussion-quote-selection') // Discussion
  if (!commentSection) return

  const commentsObserver = new MutationObserver((mutations) => {
    debounce(() => {
      addReactionNav()
    })()
  })

  commentsObserver.observe(commentSection, { childList: true, subtree: true })
}

// Create a sticking wrapper to place all reactions
function injectWrapper() {
  // console.log('injectWrapper')
  const header = document.querySelector(sideBarId) as HTMLDivElement
  if (!header) return
  header.style.position = 'relative'
  header.style.height = '100%'

  const wrapper = document.createElement('div')
  wrapper.setAttribute('id', wrapperId.replace('#', ''))
  const top =
    document.querySelectorAll('.gh-header-sticky').length > 0 ? 70 : 10
  wrapper.style.position = 'sticky'
  wrapper.style.setProperty('position', '-webkit-sticky', 'important')
  wrapper.style.top = top + 'px'

  header.appendChild(wrapper)
}

// Scan the site for reactions and stick it into the wrapper
function addReactionNav() {
  // console.log('addReactionNav')
  document.querySelector(wrapperId)?.remove()
  injectWrapper()
  const wrapper = document.querySelector(wrapperId)
  if (!wrapper) {
    return
  }

  wrapper.innerHTML = ''
  wrapper.appendChild(Title('Reactions'))
  wrapper.appendChild(Reactions())
  if (window.location.pathname.match(/\/discussions\//)) {
    wrapper.appendChild(Title('Discussion Votes'))
    wrapper.appendChild(DiscussionVotes())
  }
  wrapper.appendChild(Credits())
}

function Title(title: string) {
  // console.log('Title')
  const element = document.createElement('div')
  element.style.setProperty('font-weight', 'bold')
  element.style.setProperty('margin', '1.25rem 0 0.5rem 0')
  element.appendChild(document.createTextNode(title))

  return element
}

function Reactions() {
  // console.log('Reactions')
  const all = document.createElement('div')

  const issueUrl =
    window.location.origin + window.location.pathname + window.location.search
  // Grabbing all reactions Reactions 👍 🚀 🎉 😄 ❤️ 😕 👎 👀
  const reactions = ['👍', '🚀', '🎉', '😄', '❤️', '😕', '👎', '👀']
  Array.from(document.querySelectorAll('.js-comment-reactions-options'))
    .filter((node) =>
      reactions.some((reaction) => node.textContent?.includes(reaction))
    )
    .forEach((reactionSection) => {
      let reactions = ''
      reactionSection
        .querySelectorAll('button[class*="reaction"]')
        .forEach((btn) => {
          const { textContent } = btn
          if (textContent?.match(/\d/g)) {
            reactions += textContent.replace(/\s+/g, '') + ' '
          }
        })
      const linkContainer = document.createElement('div')
      const a = document.createElement('a')
      const linkText = document.createTextNode('  ' + reactions)
      linkContainer.appendChild(a)
      a.appendChild(linkText)
      a.title = reactions

      let id = null
      while (id == null) {
        if (reactionSection.tagName === 'A' && reactionSection.name) {
          id = reactionSection.name
          break
        }
        if (reactionSection.id) {
          id = reactionSection.id
          break
        }
        // @ts-expect-error
        reactionSection = reactionSection.parentNode
      }

      linkContainer.style.margin = '0.5rem 0'
      a.href = issueUrl + '#' + id
      a.style.border = '1px solid var(--color-border-default, #d2dff0)'
      a.style.borderRadius = '100px'
      a.style.padding = '2px 7px'
      a.style.color = 'var(--color-fg-muted)'

      all.appendChild(linkContainer)
    })
  return all
}

function DiscussionVotes() {
  // console.log('DiscussionVotes')

  const all = document.createElement('div')
  document.querySelectorAll('[data-url]').forEach((discussionComment) => {
    const vote = discussionComment.querySelector('.js-default-vote-count')
    let url = discussionComment.dataset?.url?.replace(
      '/comments/',
      '#discussioncomment-'
    )
    if (!url) return

    if (url.match(/body$/)) {
      url = `${
        window.location.origin +
        window.location.pathname +
        window.location.search
      }#${discussionComment.children[0].id}`
    }

    if (!vote || url.match(/votes$/)) return
    const votes = vote.textContent
    const a = document.createElement('a')
    const linkText = document.createTextNode('\n⬆️ ' + votes)
    a.appendChild(linkText)
    a.title = url
    a.href = url
    a.style.display = 'block;'
    all.appendChild(a)
  })

  return all
}

function Credits() {
  // console.log('Credits')
  const credits = document.createElement('div')
  credits.style.display = 'flex'
  credits.style.alignItems = 'center'
  credits.style.margin = '1rem 0'
  credits.style.fontSize = '0.8rem'
  credits.style.color = '#777'

  const laptopEmojiSpan = document.createElement('span')
  laptopEmojiSpan.style.marginRight = '0.25rem;'
  laptopEmojiSpan.appendChild(document.createTextNode('💻  '))

  const extensionLink = document.createElement('a')
  extensionLink.href =
    'https://github.com/Norfeldt/github-issue-reactions-browser-extension'
  extensionLink.appendChild(document.createTextNode('Reactions Extension'))

  const madeBySpan = document.createElement('span')
  madeBySpan.style.margin = '0 0.25rem;'
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

declare interface Element {
  dataset: DOMStringMap
  name: string
}
