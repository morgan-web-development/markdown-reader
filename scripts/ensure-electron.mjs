import { spawnSync } from 'child_process'
import { createRequire } from 'module'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const electronDir = join(root, 'node_modules', 'electron')
const distDir = join(electronDir, 'dist')
const exePath = join(distDir, 'electron.exe')
const pathTxt = join(electronDir, 'path.txt')

if (process.platform !== 'win32') {
  process.exit(0)
}

if (existsSync(exePath) && existsSync(pathTxt)) {
  process.exit(0)
}

const { version } = require(join(electronDir, 'package.json'))
const { downloadArtifact } = require('@electron/get')

const zipPath = await downloadArtifact({
  version,
  artifactName: 'electron',
  platform: 'win32',
  arch: process.arch === 'arm64' ? 'arm64' : 'x64'
})

rmSync(distDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })

const expand = spawnSync(
  'powershell.exe',
  [
    '-NoProfile',
    '-Command',
    `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${distDir.replace(/'/g, "''")}' -Force`
  ],
  { stdio: 'inherit' }
)

if (expand.status !== 0 || !existsSync(exePath)) {
  console.error('Failed to extract Electron binary.')
  process.exit(1)
}

writeFileSync(pathTxt, 'electron.exe')

const versionFile = join(distDir, 'version')
if (!existsSync(versionFile)) {
  writeFileSync(versionFile, version)
} else {
  const installed = readFileSync(versionFile, 'utf8').replace(/^v/, '').trim()
  if (installed !== version) {
    writeFileSync(versionFile, version)
  }
}

console.log(`Electron ${version} ready`)
