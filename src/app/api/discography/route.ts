// Discography endpoint — backed by the real Spotify Web API via the
// Client Credentials flow (https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow).
//
// Requires SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in .env.local (or the
// hosting provider's env config). Optionally set SPOTIFY_ARTIST_ID to skip
// the artist name search on every cold start.
//
// If credentials are missing or any request to Spotify fails, this falls
// back to mock data so the page never breaks.

export interface Release {
  id: string
  catalog: string // house catalog number, assigned in release order, e.g. "MK-004"
  name: string
  releaseDate: string // yyyy-mm-dd | yyyy-mm | yyyy, from album.release_date
  albumType: "album" | "single" | "compilation"
  totalTracks: number
  cover: string | null // album.images[0].url
  spotifyUrl: string // album.external_urls.spotify
}

const ARTIST_NAME = "Maschinenkindt"
const TOKEN_URL = "https://accounts.spotify.com/api/token"
const API_BASE = "https://api.spotify.com/v1"

// Module-scoped caches — survive across requests within the same server
// process/lambda instance, avoiding a token+search round trip per request.
let tokenCache: { token: string; expiresAt: number } | null = null
let artistIdCache: string | null = null
let albumsCache: { releases: Release[]; expiresAt: number } | null = null

const ALBUMS_TTL_MS = 10 * 60 * 1000 // 10 minutes

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET")
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = {
    token: data.access_token,
    // shave 60s off the real expiry as a safety margin
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return tokenCache.token
}

async function resolveArtistId(token: string): Promise<string> {
  if (process.env.SPOTIFY_ARTIST_ID) return process.env.SPOTIFY_ARTIST_ID
  if (artistIdCache) return artistIdCache

  const url = `${API_BASE}/search?${new URLSearchParams({
    q: `artist:${ARTIST_NAME}`,
    type: "artist",
    limit: "5",
  })}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Spotify artist search failed: ${res.status}`)
  }

  const data = (await res.json()) as {
    artists: { items: { id: string; name: string }[] }
  }
  const items = data.artists.items
  if (items.length === 0) {
    throw new Error(`No Spotify artist found for "${ARTIST_NAME}"`)
  }

  const exact = items.find(
    (a) => a.name.toLowerCase() === ARTIST_NAME.toLowerCase()
  )
  artistIdCache = (exact ?? items[0]).id
  return artistIdCache
}

interface SpotifyAlbum {
  id: string
  name: string
  album_type: "album" | "single" | "compilation"
  release_date: string
  total_tracks: number
  images: { url: string }[]
  external_urls: { spotify: string }
}

async function fetchAllAlbums(
  token: string,
  artistId: string
): Promise<SpotifyAlbum[]> {
  const albums: SpotifyAlbum[] = []
  let url: string | null =
    `${API_BASE}/artists/${artistId}/albums?` +
    new URLSearchParams({
      include_groups: "album,single,compilation",
      market: "DE",
      // Spotify's albums endpoint caps limit at 10 (not the usual 50)
      limit: "10",
    })

  // Follow pagination, capped so a runaway `next` chain can't loop forever.
  for (let page = 0; page < 10 && url; page++) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) {
      throw new Error(`Spotify albums request failed: ${res.status}`)
    }
    const data: { items: SpotifyAlbum[]; next: string | null } =
      await res.json()
    albums.push(...data.items)
    url = data.next
  }

  return albums
}

function dedupeAndMap(albums: SpotifyAlbum[]): Release[] {
  const seen = new Set<string>()
  const deduped: SpotifyAlbum[] = []
  for (const album of albums) {
    const key = `${album.name.trim().toLowerCase()}::${album.release_date}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(album)
  }

  // Oldest first so catalog numbers reflect real release order.
  deduped.sort((a, b) => a.release_date.localeCompare(b.release_date))

  return deduped.map((album, i) => ({
    id: album.id,
    catalog: `MK-${String(i + 1).padStart(3, "0")}`,
    name: album.name,
    releaseDate: album.release_date,
    albumType: album.album_type,
    totalTracks: album.total_tracks,
    cover: album.images[0]?.url ?? null,
    spotifyUrl: album.external_urls.spotify,
  }))
}

function getMockReleases(): Release[] {
  const mock = [
    { name: "Nachtmesse", releaseDate: "2025-11-13", albumType: "album" as const, totalTracks: 9 },
    { name: "Eisenherz", releaseDate: "2025-06-06", albumType: "single" as const, totalTracks: 4 },
    { name: "Kadaverbeat", releaseDate: "2024-10-31", albumType: "single" as const, totalTracks: 2 },
    { name: "Sturmwerk", releaseDate: "2024-03-21", albumType: "album" as const, totalTracks: 8 },
    { name: "Aschekult", releaseDate: "2023-09-09", albumType: "single" as const, totalTracks: 5 },
    { name: "Urschlag", releaseDate: "2022-12-01", albumType: "single" as const, totalTracks: 1 },
  ]
  return mock.map((m, i) => ({
    id: `mock-${i}`,
    catalog: `MK-${String(i + 1).padStart(3, "0")}`,
    name: m.name,
    releaseDate: m.releaseDate,
    albumType: m.albumType,
    totalTracks: m.totalTracks,
    cover: null,
    spotifyUrl: "https://open.spotify.com/",
  }))
}

export async function GET() {
  if (albumsCache && albumsCache.expiresAt > Date.now()) {
    return Response.json(
      { source: "spotify", count: albumsCache.releases.length, releases: albumsCache.releases },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const token = await getAccessToken()
    const artistId = await resolveArtistId(token)
    const albums = await fetchAllAlbums(token, artistId)
    const releases = dedupeAndMap(albums).sort((a, b) =>
      b.releaseDate.localeCompare(a.releaseDate)
    )

    albumsCache = { releases, expiresAt: Date.now() + ALBUMS_TTL_MS }

    return Response.json(
      { source: "spotify", count: releases.length, releases },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("[discography] falling back to mock data:", err)
    const releases = getMockReleases().sort((a, b) =>
      b.releaseDate.localeCompare(a.releaseDate)
    )
    return Response.json(
      {
        source: "mock",
        count: releases.length,
        releases,
        error: err instanceof Error ? err.message : "unknown error",
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  }
}
