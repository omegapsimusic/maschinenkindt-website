// Thin wrapper around Spotify's embed IFrame API
// (https://developer.spotify.com/documentation/embeds/references/iframe-api).
// The script calls `window.onSpotifyIframeApiReady` exactly once when it has
// loaded; this module lets any number of components register a callback for
// that moment, whether they mount before or after the script finishes.

export type SpotifyEmbedController = {
  play: () => void;
  pause: () => void;
  addListener: (
    event: "playback_update" | "ready",
    cb: (e: { data: { isPaused: boolean; position: number; duration: number } }) => void
  ) => void;
};

export type SpotifyIFrameAPI = {
  createController: (
    element: Element,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

let api: SpotifyIFrameAPI | null = null;
let pending: Array<(api: SpotifyIFrameAPI) => void> = [];

export function onSpotifyIframeApiReady(cb: (api: SpotifyIFrameAPI) => void) {
  if (api) {
    cb(api);
    return;
  }
  pending.push(cb);

  if (typeof window !== "undefined" && !window.onSpotifyIframeApiReady) {
    window.onSpotifyIframeApiReady = (readyApi) => {
      api = readyApi;
      pending.forEach((p) => p(readyApi));
      pending = [];
    };
  }
}
