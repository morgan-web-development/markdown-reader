const REPO = 'morgan-web-development/markdown-reader'

function pickInstaller(assets = []) {
  const exes = assets.filter((asset) => /\.exe$/i.test(asset.name))
  if (exes.length === 0) return null

  return (
    exes.find((asset) => /setup/i.test(asset.name)) ||
    exes.find((asset) => /markdown/i.test(asset.name)) ||
    exes[0]
  )
}

export async function onRequest() {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'markdown-reader-website'
      }
    })

    if (!response.ok) {
      return new Response(`Could not look up the latest release (${response.status}).`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    const release = await response.json()
    const asset = pickInstaller(release.assets)

    if (!asset?.browser_download_url) {
      return new Response('No Windows installer was found on the latest release.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }

    return Response.redirect(asset.browser_download_url, 302)
  } catch (error) {
    return new Response(`Download lookup failed: ${error?.message || 'unknown error'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
