const wesBosYellow = '#ffc600'
const cobalt2BackgroundBlue = '#183348'
const DISPLAY = 'DISPLAY'

const getBrowser = () => {
  if (navigator.userAgent.match(/Chrome/)) return chrome

  return browser
}

const [sideBarId, wrapperId] = [
  '#partial-discussion-sidebar',
  '#reactions-wrapper',
]

function debounce(func: Function, timeout = 2000): Function {
  let timer: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args)
    }, timeout)
  }
}

// INITIAL LOADING INDICATOR
injectWrapper({ withLoadingSpinner: true })

// CHANGE PAGE
const mainObserver = new MutationObserver((_mutations) => {
  debounce(() => {
    startObservingComments()
    addReactionNav()
  })()
})

function getCommentSection() {
  return (
    document.querySelector('.Layout-main') ?? // Issues & PR
    document.querySelector('.js-discussion-quote-selection') // Discussion
  )
}

const commentSection = getCommentSection()
if (commentSection !== null) {
  mainObserver.observe(commentSection, {
    childList: true,
    subtree: true,
  })
}

function startObservingComments() {
  const commentSection = getCommentSection()
  if (!commentSection) return

  const commentsObserver = new MutationObserver((mutations) => {
    debounce(() => {
      addReactionNav()
    })()
  })

  commentsObserver.observe(commentSection, { childList: true, subtree: true })
}

// Create a sticking wrapper to place all reactions
function injectWrapper({ withLoadingSpinner } = { withLoadingSpinner: false }) {
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
  wrapper.innerHTML = ''
  wrapper.appendChild(Title('Reactions'))

  if (withLoadingSpinner) {
    wrapper.appendChild(LoadingSpinner())
  }

  header.appendChild(wrapper)
}

function LoadingSpinner() {
  const loadingSpinner = document.createElement('div')
  const side = '25px'
  loadingSpinner.style.width = side
  loadingSpinner.style.height = side
  loadingSpinner.style.border = `2px solid ${cobalt2BackgroundBlue}`
  loadingSpinner.style.borderTop = `2px solid ${wesBosYellow}`
  loadingSpinner.style.borderRadius = '50%'
  loadingSpinner.style.animation = 'spin 1s linear infinite'
  const style = document.createElement('style')
  document.head.appendChild(style)
  const keyframes = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }`
  style.sheet?.insertRule(keyframes)

  return loadingSpinner
}

// Scan the site for reactions and stick it into the wrapper
function addReactionNav() {
  document.querySelector(wrapperId)?.remove()
  injectWrapper()
  const wrapper = document.querySelector(wrapperId)
  if (!wrapper) {
    return
  }

  wrapper.appendChild(Reactions())
  if (window.location.pathname.match(/\/discussions\//)) {
    wrapper.appendChild(Title('Discussion Votes'))
    wrapper.appendChild(DiscussionVotes())
  }
  wrapper.appendChild(Credits())
}

function Title(title: string) {
  const element = document.createElement('div') satisfies HTMLDivElement
  element.style.display = 'flex'
  element.style.justifyContent = 'space-between'
  element.style.alignItems = 'center'
  element.style.fontWeight = 'bold'
  element.style.margin = '1.25rem 0 0.5rem 0'

  element.appendChild(document.createTextNode(title))

  const switchDiv = document.createElement('div')
  switchDiv.appendChild(SvgBlockIcon())
  switchDiv.appendChild(Switch())
  switchDiv.appendChild(SvgInlineBlockIcon())
  element.appendChild(switchDiv)

  return element
}

const reactionClass = 'reaction-sidebar-link'

function Reactions() {
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
      linkContainer.classList.add(reactionClass)

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

  getBrowser()
    .storage.sync.get([DISPLAY])
    .then((result: { [x: string]: string }) => {
      const display = (result[DISPLAY] as Display) ?? 'block'
      const elements = Array.from(
        document.getElementsByClassName(reactionClass)
      ) as HTMLDivElement[]
      for (let element of elements) {
        element.style.display = display
      }
    })

  if (all.childElementCount === 0) {
    const noReactions = document.createElement('div')
    noReactions.innerText = '🤷‍♂️ no reactions found'
    all.appendChild(noReactions)
  }

  return all
}

function DiscussionVotes() {
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
    a.classList.add(reactionClass)
    const linkText = document.createTextNode('\n⬆️ ' + votes)
    a.appendChild(linkText)
    a.title = url
    a.href = url
    all.appendChild(a)
  })

  return all
}

function Credits() {
  const credits = document.createElement('div')
  credits.style.display = 'flex'
  credits.style.gap = '0.5rem'
  credits.style.alignItems = 'center'
  credits.style.margin = '1rem 0'
  credits.style.fontSize = '0.8rem'
  credits.style.color = '#777'

  const laptopEmojiSpan = document.createElement('span')
  laptopEmojiSpan.appendChild(document.createTextNode('💻'))

  const extensionLink = document.createElement('a')
  extensionLink.href =
    'https://github.com/Norfeldt/github-issue-reactions-browser-extension'
  extensionLink.appendChild(document.createTextNode('Reactions Extension'))

  const madeBySpan = document.createElement('span')
  madeBySpan.appendChild(document.createTextNode(' by '))

  const authorLink = document.createElement('a')
  authorLink.href = 'https://github.com/Norfeldt'
  authorLink.appendChild(document.createTextNode('Norfeldt'))

  credits.appendChild(laptopEmojiSpan)
  credits.appendChild(extensionLink)
  credits.appendChild(madeBySpan)
  credits.appendChild(authorLink)

  return credits
}

// Create the switch container, label, input, and handle elements
function Switch() {
  const switchContainer = document.createElement('span')
  const switchLabel = document.createElement('label')
  const switchInput = document.createElement('span')
  switchLabel.appendChild(switchInput)
  const switchHandle = document.createElement('span')
  switchHandle.setAttribute('class', 'switch-handle-reactions-layout')
  switchLabel.appendChild(switchHandle)
  switchContainer.appendChild(switchLabel)

  // Add CSS styles to the switch container
  switchContainer.style.display = 'inline-block'
  switchContainer.style.position = 'relative'
  switchContainer.style.backgroundColor = cobalt2BackgroundBlue
  switchContainer.style.borderRadius = '14px'
  switchContainer.style.width = '30px'
  switchContainer.style.height = '17px'

  // Add CSS styles to the switch label
  switchLabel.style.display = 'block'
  switchLabel.style.position = 'relative'
  switchLabel.style.width = '100%'
  switchLabel.style.height = '100%'
  switchLabel.style.cursor = 'pointer'

  // Add CSS styles to the switch input
  switchInput.style.display = 'none'

  // Add CSS styles to the switch handle
  switchHandle.style.display = 'block'
  switchHandle.style.position = 'absolute'
  switchHandle.style.top = '1px'
  switchHandle.style.width = '14px'
  switchHandle.style.height = '14px'
  switchHandle.style.borderRadius = '14px'
  switchHandle.style.backgroundColor = wesBosYellow
  switchHandle.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
  switchHandle.style.transition = 'left 0.2s ease-in-out'

  const toggle = (value: boolean) => {
    switchHandle.style.left = value ? '12px' : '2px'
  }

  getBrowser()
    .storage.sync.get([DISPLAY])
    .then((result) => {
      toggle(result[DISPLAY] === 'inline-block')
    })

  // Add an event listener to the switch
  switchContainer.addEventListener('click', async function changeSwitch() {
    // Get Layout from storage and change it to the opposite (either block or inline-block)
    const settings = await getBrowser().storage.sync.get([DISPLAY])
    const display: Display =
      settings[DISPLAY] === 'inline-block' ? 'block' : 'inline-block'
    getBrowser().storage.sync.set({ [DISPLAY]: display })
  })

  getBrowser().storage.onChanged.addListener(function (changes, _namespace) {
    for (const key in changes) {
      const storageChange = changes[key]
      if (key === DISPLAY) {
        toggle(storageChange.newValue === 'inline-block')
      }
    }
  })

  return switchContainer
}

getBrowser().storage.onChanged.addListener(function (changes) {
  for (let key in changes) {
    if (key === DISPLAY) {
      const display =
        changes[key].newValue === 'block' ? 'block' : 'inline-block'
      const elements = Array.from(
        document.getElementsByClassName(reactionClass)
      ) as HTMLDivElement[]
      for (let element of elements) {
        element.style.display = display
      }
    }
  }
})

function SvgBlockIcon() {
  const svg = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="14" />
      <line x1="1.5" y1="1.5" x2="3.5" y2="1.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="3.5" x2="3.5" y2="3.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="5.5" x2="7.5" y2="5.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="7.5" x2="3.5" y2="7.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="9.5" x2="5.5" y2="9.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="11.5" x2="3.5" y2="11.5" stroke=${wesBosYellow} stroke-linecap="round"/>
    </svg>
  `
  const span = document.createElement('span')
  span.innerHTML = svg

  return span
}

function SvgInlineBlockIcon() {
  const svg = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="14" height="14" />
      <line x1="1.5" y1="1.5" x2="3.5" y2="1.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="5.5" y1="1.5" x2="7.5" y2="1.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="3.5" x2="7.5" y2="3.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="9.5" y1="3.5" x2="11.5" y2="3.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="1.5" y1="5.5" x2="5.5" y2="5.5" stroke=${wesBosYellow} stroke-linecap="round"/>
      <line x1="7.5" y1="5.5" x2="9.5" y2="5.5" stroke=${wesBosYellow} stroke-linecap="round"/>
    </svg>
  `
  const span = document.createElement('span')
  span.innerHTML = svg

  return span
}

declare interface Element {
  dataset: DOMStringMap
  name: string
}

type Display = 'block' | 'inline-block'

type Settings = {
  [DISPLAY]: Display
}
