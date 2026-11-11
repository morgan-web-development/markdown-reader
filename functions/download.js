const REPO = 'morgan-web-development/markdown-reader'
// Used only if the GitHub Releases API is unreachable/rate-limited.
const FALLBACK_DOWNLOAD =
  'https://github.com/morgan-web-development/markdown-reader/releases/download/v1.0.0/Markdown.Reader.Setup.1.0.0.exe'
const FALLBACK_TAG = 'v1.0.0'
const FALLBACK_ASSET = 'Markdown.Reader.Setup.1.0.0.exe'

function pickInstaller(assets = []) {
  const exes = assets.filter((asset) => /\.exe$/i.test(asset.name))
  if (exes.length === 0) return null

  return (
    exes.find((asset) => /setup/i.test(asset.name)) ||
    exes.find((asset) => /markdown/i.test(asset.name)) ||
    exes[0]
  )
}

function trackDownload(env, request, meta = {}) {
  try {
    env.DOWNLOADS?.writeDataPoint({
      indexes: ['windows-installer'],
      blobs: [
        'download',
        request.headers.get('cf-ipcountry') || 'XX',
        meta.releaseTag || 'unknown',
        meta.assetName || 'unknown'
      ],
      doubles: [1]
    })
  } catch {
    // Tracking must never block the download redirect.
  }
}

async function resolveInstaller() {
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'markdown-reader-website'
    }
  })

  if (!response.ok) {
    return {
      url: FALLBACK_DOWNLOAD,
      releaseTag: FALLBACK_TAG,
      assetName: FALLBACK_ASSET,
      usedFallback: true
    }
  }

  const release = await response.json()
  const asset = pickInstaller(release.assets)

  if (!asset?.browser_download_url) {
    return {
      url: FALLBACK_DOWNLOAD,
      releaseTag: FALLBACK_TAG,
      assetName: FALLBACK_ASSET,
      usedFallback: true
    }
  }

  return {
    url: asset.browser_download_url,
    releaseTag: release.tag_name || FALLBACK_TAG,
    assetName: asset.name || FALLBACK_ASSET,
    usedFallback: false
  }
}

export async function onRequest(context) {
  const { request, env } = context

  try {
    const installer = await resolveInstaller()

    trackDownload(env, request, {
      releaseTag: installer.releaseTag,
      assetName: installer.assetName
    })

    return Response.redirect(installer.url, 302)
  } catch {
    trackDownload(env, request, {
      releaseTag: FALLBACK_TAG,
      assetName: FALLBACK_ASSET
    })
    return Response.redirect(FALLBACK_DOWNLOAD, 302)
  }
}
