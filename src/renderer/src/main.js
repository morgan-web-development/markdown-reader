import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/source-serif-4/400.css'
import '@fontsource/source-serif-4/600.css'
import '@fontsource/source-serif-4/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import './style.css'

const THEME_KEY = 'markdown-reader-theme'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const emptyState = document.getElementById('empty-state')
const article = document.getElementById('article')
const fileNameEl = document.getElementById('file-name')
const openFileBtn = document.getElementById('open-file')
const openAgainBtn = document.getElementById('open-again')
const themeToggle = document.getElementById('theme-toggle')

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem(THEME_KEY, next)
  themeToggle.setAttribute(
    'aria-label',
    next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  )
  themeToggle.title = next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
}

function showFile({ name, content }) {
  const rawHtml = md.render(content ?? '')
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['style']
  })

  article.innerHTML = safeHtml
  fileNameEl.textContent = name
  document.title = `${name} — Markdown Reader`

  emptyState.classList.add('is-hidden')
  emptyState.setAttribute('aria-hidden', 'true')
  article.classList.remove('is-hidden')
  article.setAttribute('aria-hidden', 'false')
  fileNameEl.classList.remove('is-hidden')
  fileNameEl.setAttribute('aria-hidden', 'false')
  openAgainBtn.classList.remove('is-hidden')
  openAgainBtn.setAttribute('aria-hidden', 'false')
}

async function openFile() {
  if (!window.api?.openFile) {
    console.error('File API is not available')
    return
  }

  try {
    const file = await window.api.openFile()
    if (file) {
      showFile(file)
    }
  } catch (error) {
    console.error('Failed to open file:', error)
  }
}

function isMarkdownFile(file) {
  if (!file?.name) return false
  return /\.(md|markdown|mdown|mkd)$/i.test(file.name)
}

async function handleDroppedFile(file) {
  if (!isMarkdownFile(file)) return

  const content = await file.text()
  showFile({ name: file.name, content })
}

setTheme(getTheme())

themeToggle.addEventListener('click', () => {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark')
})

openFileBtn.addEventListener('click', openFile)
openAgainBtn.addEventListener('click', openFile)

window.addEventListener('dragover', (event) => {
  event.preventDefault()
  document.body.classList.add('is-dragging')
})

window.addEventListener('dragleave', (event) => {
  if (event.relatedTarget === null) {
    document.body.classList.remove('is-dragging')
  }
})

window.addEventListener('drop', async (event) => {
  event.preventDefault()
  document.body.classList.remove('is-dragging')

  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await handleDroppedFile(file)
  }
})
