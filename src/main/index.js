import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import { readFile } from 'fs/promises'
import { basename, extname, join } from 'path'

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown', '.mdown', '.mkd'])

const MARKDOWN_FILTERS = [
  {
    name: 'Markdown',
    extensions: ['md', 'markdown', 'mdown', 'mkd']
  },
  { name: 'All Files', extensions: ['*'] }
]

function isAllowedExternalUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function attachWindowSecurity(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    const current = win.webContents.getURL()
    if (url !== current) {
      event.preventDefault()
      if (isAllowedExternalUrl(url)) {
        shell.openExternal(url)
      }
    }
  })
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 560,
    minHeight: 400,
    show: false,
    title: 'Markdown Reader',
    backgroundColor: '#f4f5f7',
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  })

  attachWindowSecurity(mainWindow)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

async function openMarkdownFile(browserWindow) {
  const result = await dialog.showOpenDialog(browserWindow, {
    title: 'Open Markdown File',
    properties: ['openFile'],
    filters: MARKDOWN_FILTERS
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const extension = extname(filePath).toLowerCase()

  if (!MARKDOWN_EXTENSIONS.has(extension)) {
    return null
  }

  const content = await readFile(filePath, 'utf8')

  return {
    path: filePath,
    name: basename(filePath),
    content
  }
}

app.whenReady().then(() => {
  // Drop the default File/Edit/View menu so only the app chrome shows.
  Menu.setApplicationMenu(null)

  const mainWindow = createWindow()

  ipcMain.handle('dialog:openFile', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) {
      return null
    }
    return openMarkdownFile(win)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event) => {
    event.preventDefault()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
