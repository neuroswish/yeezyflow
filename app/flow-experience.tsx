"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Timed transitions and mounted portals intentionally synchronize visual state from effects. */

import Image from "next/image";
import {
  createContext,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SVGProps,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import tracksJson from "./data/tracks.json";

type PlatformKey = "spotify" | "appleMusic" | "youtube" | "soundcloud";

export type Track = {
  title: string;
  duration: string;
  year: number;
  project: string;
  cover: string;
  note: string;
  id: string;
  youtubeId: string;
  artists: string[];
  features?: string[];
  links: Partial<Record<PlatformKey, string>>;
};

const CANONICAL_TRACKS = tracksJson as Track[];

const C = {
  coverFlow: {
    stage: "CoverFlowV2-module-scss-module__5wKb0q__stage",
    mask: "CoverFlowV2-module-scss-module__5wKb0q__mask",
    rail: "CoverFlowV2-module-scss-module__5wKb0q__rail",
    item: "CoverFlowV2-module-scss-module__5wKb0q__item",
    image: "CoverFlowV2-module-scss-module__5wKb0q__image",
  },
  meta: {
    meta: "FlowMeta-module-scss-module__UeIwgG__meta",
    inner: "FlowMeta-module-scss-module__UeIwgG__inner",
    heading: "FlowMeta-module-scss-module__UeIwgG__heading",
    titleRoll: "FlowMeta-module-scss-module__UeIwgG__titleRoll",
    title: "FlowMeta-module-scss-module__UeIwgG__title",
    album: "FlowMeta-module-scss-module__UeIwgG__album",
    details: "FlowMeta-module-scss-module__UeIwgG__details",
    detail: "FlowMeta-module-scss-module__UeIwgG__detail",
    tick: "FlowMeta-module-scss-module__UeIwgG__tick",
  },
  shell: {
    shell: "FlowShell-module-scss-module__YbKCLa__shell",
    header: "FlowShell-module-scss-module__YbKCLa__header",
    brandRow: "FlowShell-module-scss-module__YbKCLa__brandRow",
    brand: "FlowShell-module-scss-module__YbKCLa__brand",
    version: "FlowShell-module-scss-module__YbKCLa__version",
    actions: "FlowShell-module-scss-module__YbKCLa__actions",
    main: "FlowShell-module-scss-module__YbKCLa__main",
    aboutTip: "FlowShell-module-scss-module__YbKCLa__aboutTip",
    aboutBody: "FlowShell-module-scss-module__YbKCLa__aboutBody",
  },
  toolbar: {
    toolbar: "FlowToolbar-module-scss-module__ggoHVG__toolbar",
    button: "FlowToolbar-module-scss-module__ggoHVG__button",
  },
  menu: {
    root: "Menu-module-scss-module__HB4Aoa__root",
    content: "Menu-module-scss-module__HB4Aoa__content",
    highlight: "Menu-module-scss-module__HB4Aoa__highlight",
    row: "Menu-module-scss-module__HB4Aoa__row",
    item: "Menu-module-scss-module__HB4Aoa__item",
    separator: "Menu-module-scss-module__HB4Aoa__separator",
  },
  search: {
    root: "TrackSearch-module-scss-module__tf2BEa__root",
    backdrop: "TrackSearch-module-scss-module__tf2BEa__backdrop",
    dialog: "TrackSearch-module-scss-module__tf2BEa__dialog",
    field: "TrackSearch-module-scss-module__tf2BEa__field",
    icon: "TrackSearch-module-scss-module__tf2BEa__icon",
    input: "TrackSearch-module-scss-module__tf2BEa__input",
    hint: "TrackSearch-module-scss-module__tf2BEa__hint",
    close: "TrackSearch-module-scss-module__tf2BEa__close",
    listWrap: "TrackSearch-module-scss-module__tf2BEa__listWrap",
    list: "TrackSearch-module-scss-module__tf2BEa__list",
    row: "TrackSearch-module-scss-module__tf2BEa__row",
    cover: "TrackSearch-module-scss-module__tf2BEa__cover",
    meta: "TrackSearch-module-scss-module__tf2BEa__meta",
    title: "TrackSearch-module-scss-module__tf2BEa__title",
    sub: "TrackSearch-module-scss-module__tf2BEa__sub",
    dot: "TrackSearch-module-scss-module__tf2BEa__dot",
    empty: "TrackSearch-module-scss-module__tf2BEa__empty",
  },
  list: {
    section: "TrackList-module-scss-module__shkyeq__section",
    list: "TrackList-module-scss-module__shkyeq__list",
    highlight: "TrackList-module-scss-module__shkyeq__highlight",
    track: "Track-module-scss-module__JCH_oa__track",
    hit: "Track-module-scss-module__JCH_oa__hit",
    cover: "Track-module-scss-module__JCH_oa__cover",
    copy: "Track-module-scss-module__JCH_oa__copy",
    title: "Track-module-scss-module__JCH_oa__title",
    album: "Track-module-scss-module__JCH_oa__album",
    duration: "Track-module-scss-module__JCH_oa__duration",
  },
  player: {
    dock: "FloatingBarPlayer-module-scss-module__axPgMG__dock",
    bar: "FloatingBarPlayer-module-scss-module__axPgMG__bar",
    track: "FloatingBarPlayer-module-scss-module__axPgMG__track",
    cover: "FloatingBarPlayer-module-scss-module__axPgMG__cover",
    copy: "FloatingBarPlayer-module-scss-module__axPgMG__copy",
    title: "FloatingBarPlayer-module-scss-module__axPgMG__title",
    album: "FloatingBarPlayer-module-scss-module__axPgMG__album",
    dismiss: "FloatingBarPlayer-module-scss-module__axPgMG__dismiss",
    controls: "FloatingBarPlayer-module-scss-module__axPgMG__controls",
    play: "FloatingBarPlayer-module-scss-module__axPgMG__play",
    more: "FloatingBarPlayer-module-scss-module__axPgMG__more",
    platformIcon: "FloatingBarPlayer-module-scss-module__axPgMG__platformIcon",
    ytHost: "PlayerProvider-module-scss-module__1wX70G__ytHost",
    ytMount: "PlayerProvider-module-scss-module__1wX70G__ytMount",
  },
  experience: {
    page: "FlowExperience-module-scss-module__V1i9CW__page",
    listBody: "FlowExperience-module-scss-module__V1i9CW__listBody",
  },
} as const;

function IconBase({ children, size = 16, strokeWidth = 1.75, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const SearchIcon = (props: SVGProps<SVGSVGElement>) => <IconBase {...props}><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></IconBase>;
const ShuffleIcon = (props: SVGProps<SVGSVGElement>) => <IconBase {...props}><path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" /></IconBase>;
const FilterIcon = (props: SVGProps<SVGSVGElement>) => <IconBase {...props}><path d="M2 5h20" /><path d="M6 12h12" /><path d="M9 19h6" /></IconBase>;
const XIcon = (props: SVGProps<SVGSVGElement>) => <IconBase size={18} {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></IconBase>;
const PlayIcon = (props: SVGProps<SVGSVGElement>) => <IconBase fill="currentColor" strokeWidth={0} {...props}><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></IconBase>;
const PauseIcon = (props: SVGProps<SVGSVGElement>) => <IconBase fill="currentColor" strokeWidth={0} {...props}><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></IconBase>;
const MoreIcon = (props: SVGProps<SVGSVGElement>) => <IconBase strokeWidth={2.25} {...props}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></IconBase>;
const LinkIcon = (props: SVGProps<SVGSVGElement>) => <IconBase {...props}><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" /></IconBase>;
const CheckIcon = (props: SVGProps<SVGSVGElement>) => <IconBase {...props}><path d="M20 6 9 17l-5-5" /></IconBase>;

function coverPath(cover: string) {
  const normalized = cover.trim();
  return normalized && normalized !== "placeholder" ? `/covers/${normalized}.jpg` : "/covers/placeholder.jpg";
}

function CoverImage({
  track,
  fill = false,
  width = 48,
  height = 48,
  sizes,
  priority = false,
}: {
  track: Track;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  if (fill) {
    return <Image src={coverPath(track.cover)} alt="" fill sizes={sizes ?? "100vw"} priority={priority} draggable={false} quality={75} unoptimized />;
  }
  return <Image src={coverPath(track.cover)} alt="" width={width} height={height} priority={priority} draggable={false} quality={75} unoptimized />;
}

type SoundKind = "press" | "click" | "tap" | "hover" | "select" | "toggle" | "tick";
let sharedAudioContext: AudioContext | null = null;

function noiseImpulse(
  context: AudioContext,
  at: number,
  frequency: number,
  options: {
    duration?: number;
    decay?: number;
    filterType?: BiquadFilterType;
    filterQ?: number;
    gain?: number;
    randomization?: number;
  } = {},
) {
  const duration = options.duration ?? 0.004;
  const decay = options.decay ?? 20;
  const sampleCount = Math.max(1, Math.round(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < sampleCount; index += 1) {
    channel[index] = (2 * Math.random() - 1) * Math.exp(-index / decay);
  }
  const filter = context.createBiquadFilter();
  filter.type = options.filterType ?? "bandpass";
  filter.frequency.value = frequency * (1 + (Math.random() - 0.5) * (options.randomization ?? 0.1));
  filter.Q.value = options.filterQ ?? 8;
  const gain = context.createGain();
  gain.gain.value = options.gain ?? 1;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(at);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

function sound(kind: SoundKind, intensity = 1) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    sharedAudioContext ??= new AudioContextClass();
    if (sharedAudioContext.state === "suspended") void sharedAudioContext.resume();
    const context = sharedAudioContext;
    const at = context.currentTime;
    if (kind === "press") noiseImpulse(context, at, 2800, { duration: .005, decay: 30, filterQ: 6, gain: 1.5 * intensity });
    if (kind === "click") noiseImpulse(context, at, 4000, { decay: 25, gain: 3 * intensity });
    if (kind === "tap") {
      noiseImpulse(context, at, 2800, { duration: .005, decay: 30, filterQ: 6, gain: .75 * intensity });
      noiseImpulse(context, at + .001, 4000, { decay: 25, gain: 1.5 * intensity });
    }
    if (kind === "hover") noiseImpulse(context, at, 2000, { duration: .003, decay: 15, filterQ: 4, gain: .4 * intensity });
    if (kind === "select") noiseImpulse(context, at, 2000, { duration: .006, decay: 30, filterQ: 5, gain: 1.2 * intensity });
    if (kind === "toggle") noiseImpulse(context, at, 3200, { duration: .004, decay: 18, filterQ: 7, gain: 1.8 * intensity });
    if (kind === "tick") {
      noiseImpulse(context, at, 220, { duration: .018, decay: 55, filterType: "lowpass", filterQ: 1.2, gain: 1.6 * intensity, randomization: .06 });
      noiseImpulse(context, at, 480, { duration: .01, decay: 35, filterType: "bandpass", filterQ: 2.2, gain: .55 * intensity, randomization: .08 });
    }
  } catch {
    // Audio feedback is enhancement-only.
  }
}

interface YouTubePlayer {
  cueVideoById(id: string): void;
  loadVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  destroy(): void;
  getIframe(): HTMLIFrameElement;
}

interface YouTubeNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      width: number;
      height: number;
      host: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(event: { target: YouTubePlayer }): void;
        onStateChange(event: { data: number; target: YouTubePlayer }): void;
        onError(): void;
      };
    },
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubePromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  youtubePromise ??= new Promise<YouTubeNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube API failed to initialize"));
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        youtubePromise = null;
        reject(new Error("Failed to load YouTube IFrame API"));
      };
      document.head.appendChild(script);
    }
  });
  return youtubePromise;
}

function blockPictureInPicture(player: YouTubePlayer) {
  let iframe: HTMLIFrameElement;
  try {
    iframe = player.getIframe();
  } catch {
    return;
  }
  const clean = () => {
    iframe.tabIndex = -1;
    const allow = (iframe.getAttribute("allow") ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !/picture-in-picture/i.test(part))
      .join("; ");
    if (iframe.getAttribute("allow") !== allow) iframe.setAttribute("allow", allow);
    iframe.removeAttribute("allowfullscreen");
  };
  clean();
  if (!iframe.dataset.yeezyflowPipBlocked) {
    iframe.dataset.yeezyflowPipBlocked = "1";
    new MutationObserver(clean).observe(iframe, { attributes: true, attributeFilter: ["allow", "allowfullscreen"] });
  }
}

type PlayerValue = {
  activeSong: Track | null;
  isPlaying: boolean;
  selectSong(id: string): void;
  togglePlay(): void;
  clearSong(): void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside PlayerProvider");
  return value;
}

function PlayerProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const activeIdRef = useRef(activeId);
  const desiredPlayRef = useRef(isPlaying);
  const switchingRef = useRef(false);
  const activeSong = activeId ? CANONICAL_TRACKS.find((track) => track.id === activeId) ?? null : null;

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { desiredPlayRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const action = "enterpictureinpicture" as MediaSessionAction;
    try { navigator.mediaSession.setActionHandler(action, () => undefined); } catch { /* unsupported action */ }
    return () => {
      try { navigator.mediaSession.setActionHandler(action, null); } catch { /* unsupported action */ }
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const mount = document.createElement("div");
    mount.className = C.player.ytMount;
    host.appendChild(mount);
    let destroyed = false;
    void loadYouTubeApi()
      .then((namespace) => {
        if (destroyed) return;
        const playerVars: Record<string, string | number> = {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        };
        const player = new namespace.Player(mount, {
          width: 200,
          height: 200,
          host: "https://www.youtube-nocookie.com",
          playerVars,
          events: {
            onReady: ({ target }) => {
              if (destroyed) return target.destroy();
              playerRef.current = target;
              blockPictureInPicture(target);
              setReady(true);
            },
            onStateChange: ({ data, target }) => {
              if (destroyed) return;
              if (data === 1) {
                blockPictureInPicture(target);
                setIsPlaying(true);
                return;
              }
              if (data === 2) {
                if (switchingRef.current) return;
                setIsPlaying(false);
                return;
              }
              if (data === 0) {
                switchingRef.current = false;
                desiredPlayRef.current = false;
                setIsPlaying(false);
              }
            },
            onError: () => {
              switchingRef.current = false;
              desiredPlayRef.current = false;
              setIsPlaying(false);
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        switchingRef.current = false;
        desiredPlayRef.current = false;
        setIsPlaying(false);
        setReady(false);
      });
    return () => {
      destroyed = true;
      setReady(false);
      loadedIdRef.current = null;
      try { playerRef.current?.destroy(); } catch { /* no-op */ }
      playerRef.current = null;
      mount.remove();
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player) return;
    if (!activeSong) {
      try { player.stopVideo(); } catch { /* no-op */ }
      loadedIdRef.current = null;
      return;
    }
    if (loadedIdRef.current !== activeSong.youtubeId) {
      loadedIdRef.current = activeSong.youtubeId;
      try {
        if (switchingRef.current || desiredPlayRef.current) player.loadVideoById(activeSong.youtubeId);
        else player.cueVideoById(activeSong.youtubeId);
        blockPictureInPicture(player);
      } catch {
        switchingRef.current = false;
        desiredPlayRef.current = false;
        setIsPlaying(false);
      }
      return;
    }
    if (switchingRef.current || desiredPlayRef.current) {
      try { player.playVideo(); } catch {
        switchingRef.current = false;
        desiredPlayRef.current = false;
        setIsPlaying(false);
      }
    }
  }, [activeSong, ready]);

  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player || !activeId || !loadedIdRef.current) return;
    try {
      if (isPlaying) {
        switchingRef.current = true;
        player.playVideo();
      } else {
        switchingRef.current = false;
        player.pauseVideo();
      }
    } catch {
      switchingRef.current = false;
      desiredPlayRef.current = false;
      setIsPlaying(false);
    }
  }, [activeId, isPlaying, ready]);

  useEffect(() => {
    const exitPip = () => {
      if (document.pictureInPictureElement) void document.exitPictureInPicture().catch(() => undefined);
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") exitPip(); };
    document.addEventListener("enterpictureinpicture", exitPip, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("enterpictureinpicture", exitPip, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const selectSong = useCallback((id: string) => {
    if (activeIdRef.current === id) {
      setIsPlaying((playing) => {
        const next = !playing;
        desiredPlayRef.current = next;
        switchingRef.current = next;
        return next;
      });
      return;
    }
    switchingRef.current = true;
    desiredPlayRef.current = true;
    setActiveId(id);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!activeIdRef.current) return;
    setIsPlaying((playing) => {
      const next = !playing;
      desiredPlayRef.current = next;
      switchingRef.current = next;
      return next;
    });
  }, []);

  const clearSong = useCallback(() => {
    try { playerRef.current?.stopVideo(); } catch { /* no-op */ }
    switchingRef.current = false;
    desiredPlayRef.current = false;
    loadedIdRef.current = null;
    setIsPlaying(false);
    setActiveId(null);
  }, []);

  const value = useMemo(() => ({ activeSong, isPlaying, selectSong, togglePlay, clearSong }), [activeSong, isPlaying, selectSong, togglePlay, clearSong]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <div ref={hostRef} className={C.player.ytHost} aria-hidden="true" />
    </PlayerContext.Provider>
  );
}

function modulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

function wrappedDelta(value: number, length: number) {
  let delta = modulo(value, length);
  if (delta > length / 2) delta -= length;
  return delta;
}

function wrappedPixelDelta(from: number, to: number, range: number) {
  if (!range) return to - from;
  let delta = (to - from) % range;
  if (delta > range / 2) delta -= range;
  if (delta < -range / 2) delta += range;
  return delta;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function CoverFlow({
  tracks,
  activeIndex,
  onChange,
  onPlay,
}: {
  tracks: Track[];
  activeIndex: number;
  onChange(index: number): void;
  onPlay(id: string): void;
}) {
  const [desktop, setDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(activeIndex);
  const onChangeRef = useRef(onChange);
  const internalIndexRef = useRef<number | null>(null);
  const programmaticRef = useRef(false);
  const suppressClickRef = useRef(false);
  const draggingRef = useRef(false);
  const wheelTimerRef = useRef<number | null>(null);
  const pointerRef = useRef<{
    id: number;
    startX: number;
    startTarget: number;
    resumeTarget: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    moved: boolean;
    pointerType: string;
    wasProgrammatic: boolean;
    captureTarget: HTMLElement;
  } | null>(null);
  const cover = desktop ? 240 : 200;
  const spacing = desktop ? 178 : 148;
  const length = tracks.length;
  const signature = tracks.map((track) => track.id).join("|");
  const motionRef = useRef({ current: activeIndex * spacing, target: activeIndex * spacing, velocity: 0, last: 0, raf: 0 });
  const signatureRef = useRef(signature);
  const activeTrackIdRef = useRef(tracks[activeIndex]?.id);

  const applyPosition = useCallback((nextPosition: number) => {
    const stage = stageRef.current;
    if (!stage || !length) return;
    const total = length * spacing;
    stage.querySelectorAll<HTMLButtonElement>("[data-cover-index]").forEach((element) => {
      const index = Number(element.dataset.coverIndex);
      if (!Number.isFinite(index)) return;
      const raw = wrappedDelta(index * spacing - nextPosition, total) / spacing;
      const sign = Math.sign(raw);
      const distance = Math.min(Math.abs(raw), 3);
      const x = distance <= 1
        ? raw * (1.22 * spacing)
        : sign * (1.22 * spacing + (distance - 1) * spacing);
      const clampedSide = clamp(raw, -1, 1);
      const rotateY = -(52 * Math.sign(clampedSide)) * Math.pow(Math.abs(clampedSide), 1.35);
      const scale = Math.abs(raw) <= 1 ? 1 - .14 * Math.abs(raw) : .86;
      const z = 120 - 36 * distance;
      const opacity = Math.abs(raw) <= 3 ? 1 : clamp(1 - (Math.abs(raw) - 3) / .5, 0, 1);
      const imageOpacity = Math.max(.2, 1 - .22 * distance);
      const zIndex = Math.round((4 - Math.min(Math.abs(raw), 4)) * 1000);
      element.style.opacity = String(opacity);
      element.style.zIndex = String(zIndex);
      element.style.transform = `perspective(1100px) translateX(${x}px) translateZ(${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
      const image = element.querySelector<HTMLElement>("[data-cover-image]");
      if (image) image.style.opacity = String(imageOpacity);
    });
  }, [length, spacing]);

  useLayoutEffect(() => {
    activeRef.current = activeIndex;
    onChangeRef.current = onChange;
  }, [activeIndex, onChange]);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(min-width: 860px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const emitIndex = useCallback((position: number, currentSpacing: number, currentLength: number) => {
    if (!currentLength || programmaticRef.current) return;
    const index = modulo(Math.round(position / currentSpacing), currentLength);
    if (index !== activeRef.current) {
      internalIndexRef.current = index;
      sound("tick");
      onChangeRef.current(index);
    }
  }, []);

  const startSpring = useCallback(() => {
    const motion = motionRef.current;
    if (motion.raf) return;
    motion.last = performance.now();
    const step = (now: number) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const deltaMs = Math.min(32, Math.max(1, now - motion.last));
      motion.last = now;
      if (reduced) {
        motion.current = motion.target;
        motion.velocity = 0;
      } else {
        const dt = deltaMs / 1000;
        const acceleration = (-220 * (motion.current - motion.target) - 30 * motion.velocity) / .85;
        motion.velocity += acceleration * dt;
        motion.current += motion.velocity * dt;
      }
      applyPosition(motion.current);
      emitIndex(motion.current, Number(stageRef.current?.dataset.spacing ?? spacing), Number(stageRef.current?.dataset.length ?? length));
      if (Math.abs(motion.current - motion.target) <= .4 && Math.abs(motion.velocity) <= 1) {
        motion.current = motion.target;
        motion.velocity = 0;
        motion.raf = 0;
        applyPosition(motion.current);
        programmaticRef.current = false;
        emitIndex(motion.current, Number(stageRef.current?.dataset.spacing ?? spacing), Number(stageRef.current?.dataset.length ?? length));
        return;
      }
      motion.raf = window.requestAnimationFrame(step);
    };
    motion.raf = window.requestAnimationFrame(step);
  }, [applyPosition, emitIndex, length, spacing]);

  const setTarget = useCallback((value: number, jump = false) => {
    const motion = motionRef.current;
    motion.target = value;
    if (jump || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      motion.current = value;
      motion.velocity = 0;
      applyPosition(motion.current);
      emitIndex(value, Number(stageRef.current?.dataset.spacing ?? spacing), Number(stageRef.current?.dataset.length ?? length));
      programmaticRef.current = false;
      return;
    }
    startSpring();
  }, [applyPosition, emitIndex, length, spacing, startSpring]);

  useLayoutEffect(() => {
    if (!length) return;
    if (internalIndexRef.current === activeIndex) {
      internalIndexRef.current = null;
      signatureRef.current = signature;
      activeTrackIdRef.current = tracks[activeIndex]?.id;
      return;
    }
    const motion = motionRef.current;
    if (signatureRef.current !== signature) {
      const previousId = activeTrackIdRef.current;
      signatureRef.current = signature;
      if (previousId) {
        const preservedIndex = tracks.findIndex((track) => track.id === previousId);
        if (preservedIndex >= 0) {
          if (motion.raf) window.cancelAnimationFrame(motion.raf);
          const preservedPosition = preservedIndex * spacing;
          motion.current = preservedPosition;
          motion.target = preservedPosition;
          motion.velocity = 0;
          motion.raf = 0;
          applyPosition(motion.current);
        }
      }
    }
    const range = length * spacing;
    const delta = wrappedPixelDelta(motion.current, activeIndex * spacing, range);
    activeTrackIdRef.current = tracks[activeIndex]?.id;
    if (Math.abs(delta) < .5) {
      programmaticRef.current = false;
      return;
    }
    programmaticRef.current = true;
    setTarget(motion.current + delta);
  }, [activeIndex, applyPosition, length, setTarget, signature, spacing, tracks]);

  useLayoutEffect(() => {
    if (mounted) applyPosition(motionRef.current.current);
  }, [activeIndex, applyPosition, mounted, signature]);

  useEffect(() => () => {
    if (motionRef.current.raf) window.cancelAnimationFrame(motionRef.current.raf);
    if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
  }, []);

  const settlePosition = useCallback((position: number) => {
    if (!length) return 0;
    const destination = Math.round(position / spacing) * spacing;
    setTarget(destination);
    const index = modulo(Math.round(destination / spacing), length);
    if (index !== activeRef.current) {
      internalIndexRef.current = index;
      onChangeRef.current(index);
    }
    return destination;
  }, [length, setTarget, spacing]);

  const snapToIndex = useCallback((index: number, feedback: SoundKind = "tap") => {
    if (!length) return;
    sound(feedback);
    if (wheelTimerRef.current !== null) {
      window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = null;
    }
    const motion = motionRef.current;
    const range = length * spacing;
    const delta = wrappedPixelDelta(motion.current, index * spacing, range);
    const destination = Math.round((motion.current + delta) / spacing) * spacing;
    programmaticRef.current = true;
    internalIndexRef.current = index;
    onChangeRef.current(index);
    setTarget(destination);
  }, [length, setTarget, spacing]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      const dominant = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!dominant) return;
      event.preventDefault();
      if (pointerRef.current) return;
      const motion = motionRef.current;
      programmaticRef.current = false;
      setTarget(motion.target + dominant);
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => {
        wheelTimerRef.current = null;
        settlePosition(motionRef.current.target);
      }, 90);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [setTarget, settlePosition]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        snapToIndex(modulo(activeRef.current - 1, length), "tap");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        snapToIndex(modulo(activeRef.current + 1, length), "tap");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [length, snapToIndex]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || pointerRef.current) return;
    if (wheelTimerRef.current !== null) {
      window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = null;
    }
    const motion = motionRef.current;
    const resumeTarget = Math.round(motion.target / spacing) * spacing;
    if (motion.raf) {
      window.cancelAnimationFrame(motion.raf);
      motion.raf = 0;
    }
    motion.target = motion.current;
    motion.velocity = 0;
    const coverTarget = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-cover-index]")
      : null;
    const captureTarget = coverTarget ?? event.currentTarget;
    try { captureTarget.setPointerCapture(event.pointerId); } catch { /* window listeners are the fallback */ }
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startTarget: motion.current,
      resumeTarget,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
      pointerType: event.pointerType,
      wasProgrammatic: programmaticRef.current,
      captureTarget,
    };
  };

  const finishPointer = useCallback((
    pointerId: number,
    mode: "up" | "cancel",
    clientX?: number,
  ) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== pointerId) return;

    // Clear ownership before releasing capture so a bubbling lost-capture event is a no-op.
    pointerRef.current = null;
    draggingRef.current = false;
    if (pointer.captureTarget.hasPointerCapture(pointerId)) {
      try { pointer.captureTarget.releasePointerCapture(pointerId); } catch { /* no-op */ }
    }

    if (!pointer.moved) {
      programmaticRef.current = pointer.wasProgrammatic;
      settlePosition(pointer.resumeTarget);
      return;
    }

    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    programmaticRef.current = false;

    const now = performance.now();
    let releaseX = pointer.lastX;
    if (mode === "up" && typeof clientX === "number") {
      releaseX = clientX;
      const elapsed = now - pointer.lastTime;
      if (elapsed > 0 && elapsed < 64 && releaseX !== pointer.lastX) {
        pointer.velocity = ((releaseX - pointer.lastX) / elapsed) * 1000;
      }
    }
    const currentTarget = pointer.startTarget - (releaseX - pointer.startX);

    if (mode === "cancel") {
      settlePosition(currentTarget);
      return;
    }

    const releaseVelocity = now - pointer.lastTime < 80 ? -pointer.velocity : 0;
    const flingStrength = pointer.pointerType === "touch" ? .55 : .4;
    const startIndex = Math.round(pointer.startTarget / spacing);
    const distance = currentTarget - pointer.startTarget;
    let destination: number;
    if (Math.abs(releaseVelocity) >= 1100 && Math.abs(distance) >= 1.35 * spacing) {
      let projection = releaseVelocity * flingStrength * 1.35;
      const minimum = 4 * Math.sign(releaseVelocity) * spacing;
      if (Math.abs(projection) < Math.abs(minimum)) projection = minimum;
      const maximum = 32 * spacing;
      projection = clamp(projection, -maximum, maximum);
      destination = currentTarget + projection;
    } else if (Math.abs(releaseVelocity) >= 180 || Math.abs(distance) >= .22 * spacing) {
      const direction = Math.abs(releaseVelocity) >= 180 ? Math.sign(releaseVelocity) : Math.sign(distance) || 1;
      const stepped = (startIndex + direction) * spacing;
      const nearest = Math.round(currentTarget / spacing) * spacing;
      destination = direction > 0 ? Math.max(stepped, nearest) : Math.min(stepped, nearest);
    } else {
      destination = currentTarget;
    }
    settlePosition(destination);
  }, [settlePosition, spacing]);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (pointer.pointerType !== "touch" && (event.buttons & 1) === 0) {
      finishPointer(event.pointerId, "cancel");
      return;
    }
    const now = performance.now();
    const elapsed = now - pointer.lastTime;
    if (elapsed > 0 && elapsed < 64) pointer.velocity = ((event.clientX - pointer.lastX) / elapsed) * 1000;
    pointer.lastX = event.clientX;
    pointer.lastTime = now;
    const distance = event.clientX - pointer.startX;
    const threshold = event.pointerType === "touch" ? 14 : 6;
    if (!pointer.moved && Math.abs(distance) < threshold) return;
    if (!pointer.moved) {
      pointer.moved = true;
      draggingRef.current = true;
      programmaticRef.current = false;
    }
    setTarget(pointer.startTarget - distance);
  };

  useEffect(() => {
    const onWindowPointerUp = (event: PointerEvent) => finishPointer(event.pointerId, "up", event.clientX);
    const onWindowPointerCancel = (event: PointerEvent) => finishPointer(event.pointerId, "cancel");
    const onWindowBlur = () => {
      const pointer = pointerRef.current;
      if (pointer) finishPointer(pointer.id, "cancel");
    };
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerCancel);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerCancel);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [finishPointer]);

  return (
    <div
      ref={stageRef}
      className={C.coverFlow.stage}
      aria-label="Cover flow"
      data-spacing={spacing}
      data-length={length}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => finishPointer(event.pointerId, "up", event.clientX)}
      onPointerCancel={(event) => finishPointer(event.pointerId, "cancel")}
      onLostPointerCapture={(event) => finishPointer(event.pointerId, "cancel")}
    >
      <div className={C.coverFlow.mask}>
        <div className={C.coverFlow.rail}>
          {mounted && tracks.map((track, index) => {
            const circularDistance = Math.min(Math.abs(index - activeIndex), length - Math.abs(index - activeIndex));
            const style: CSSProperties = {
              width: cover,
              height: cover,
              marginLeft: -cover / 2,
              marginTop: -cover / 2,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            };
            return (
              <button
                key={track.id}
                type="button"
                className={C.coverFlow.item}
                aria-label={track.title}
                aria-current={index === activeIndex ? "true" : undefined}
                data-active={index === activeIndex ? "true" : "false"}
                data-cover-index={index}
                data-track-id={track.id}
                style={style}
                onMouseEnter={() => { if (!draggingRef.current) sound("hover"); }}
                onClick={() => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }
                  if (index === activeRef.current) {
                    sound("tap");
                    onPlay(track.id);
                  } else {
                    snapToIndex(index, "tap");
                  }
                }}
              >
                <span className={C.coverFlow.image} data-cover-image>
                  <CoverImage track={track} fill sizes="(max-width: 859px) 200px, 240px" priority={circularDistance <= 1} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function randomCharacter(character: string) {
  if (character === " " || character === "-" || character === "'") return character;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const pool = character === character.toUpperCase() && character !== character.toLowerCase()
    ? alphabet.slice(0, 26)
    : character === character.toLowerCase() && character !== character.toUpperCase()
      ? alphabet.slice(26, 52)
      : alphabet;
  return pool[Math.floor(Math.random() * pool.length)] ?? character;
}

function ScrambledAlbum({ text }: { text: string }) {
  const [visible, setVisible] = useState(text);
  const previousRef = useRef(text);
  useEffect(() => {
    if (text === previousRef.current) return;
    previousRef.current = text;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(text);
      return;
    }
    setVisible(Array.from(text, randomCharacter).join(""));
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      if (step <= 2) {
        setVisible(Array.from(text, randomCharacter).join(""));
        return;
      }
      const reveal = Math.ceil(((step - 2) / 4) * text.length);
      setVisible(Array.from(text, (character, index) => index < reveal ? character : randomCharacter(character)).join(""));
      if (step >= 6) {
        window.clearInterval(timer);
        setVisible(text);
      }
    }, 18);
    return () => window.clearInterval(timer);
  }, [text]);
  return <p className={C.meta.album} aria-label={text}>{visible}</p>;
}

function AnimatedNumber({ value, format = String }: { value: number; format?: (value: number) => string }) {
  const [visible, setVisible] = useState(value);
  const previousRef = useRef(value);
  useEffect(() => {
    const previous = previousRef.current;
    if (previous === value) {
      setVisible(value);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      previousRef.current = value;
      setVisible(value);
      return;
    }
    const difference = value - previous;
    const steps = Math.max(1, Math.min(Math.abs(difference), 18));
    const increment = difference / steps;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const next = step >= steps ? value : Math.round(previous + increment * step);
      previousRef.current = next;
      setVisible(next);
      if (step >= steps) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [value]);
  return <span className={C.meta.tick}>{format(visible)}</span>;
}

function durationSeconds(duration: string) {
  const [minutes, seconds] = duration.split(":").map(Number);
  return Number.isNaN(minutes) || Number.isNaN(seconds) ? 0 : minutes * 60 + seconds;
}

function formatDuration(value: number) {
  const whole = Math.max(0, Math.floor(value));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function AnimatedTitle({ track, direction }: { track: Track; direction: number }) {
  const [state, setState] = useState<{ current: Track; old: Track | null; direction: number }>({ current: track, old: null, direction });
  const previousTrackRef = useRef(track);
  const directionRef = useRef(direction);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => {
    const old = previousTrackRef.current;
    if (old.id === track.id) return;
    previousTrackRef.current = track;
    setState({ current: track, old, direction: directionRef.current });
    const timer = window.setTimeout(() => setState((current) => ({ ...current, old: null })), 330);
    return () => window.clearTimeout(timer);
  }, [track]);
  const forward = state.direction >= 0;
  return (
    <div className={C.meta.titleRoll}>
      {state.old ? (
        <h1
          className={`${C.meta.title} yf-title-layer`}
          data-motion={forward ? "out-forward" : "out-backward"}
          aria-hidden="true"
        >
          {state.old.title}
        </h1>
      ) : null}
      <h1
        key={state.current.id}
        className={`${C.meta.title} yf-title-layer`}
        data-motion={state.old ? (forward ? "in-forward" : "in-backward") : undefined}
      >
        {state.current.title}
      </h1>
    </div>
  );
}

function artistLabel(track: Track) {
  return track.artists.length ? track.artists.join(", ") : "—";
}

function AnimatedArtist({ track }: { track: Track }) {
  const [state, setState] = useState<{ current: Track; old: Track | null }>({ current: track, old: null });
  const previousTrackRef = useRef(track);
  useEffect(() => {
    const old = previousTrackRef.current;
    if (old.id === track.id) return;
    previousTrackRef.current = track;
    setState({ current: track, old });
    const timer = window.setTimeout(() => setState((current) => ({ ...current, old: null })), 290);
    return () => window.clearTimeout(timer);
  }, [track]);
  return (
    <>
      {state.old ? (
        <span className="yf-artist-layer" data-motion="out" aria-hidden="true">
          {artistLabel(state.old)}
        </span>
      ) : null}
      <span className="yf-artist-layer" data-motion={state.old ? "in" : undefined}>
        {artistLabel(state.current)}
      </span>
    </>
  );
}

function TrackMeta({ track, direction }: { track: Track; direction: number }) {
  return (
    <div className={C.meta.meta}>
      <div className={C.meta.inner}>
        <div className={C.meta.heading}>
          <AnimatedTitle track={track} direction={direction} />
          <ScrambledAlbum text={track.project} />
        </div>
        <dl className={C.meta.details}>
          <div className={C.meta.detail}>
            <dt>Year</dt>
            <dd><AnimatedNumber value={track.year} /></dd>
          </div>
          <div className={C.meta.detail}>
            <dt>Artist</dt>
            <dd><AnimatedArtist track={track} /></dd>
          </div>
          <div className={C.meta.detail}>
            <dt>Length</dt>
            <dd><AnimatedNumber value={durationSeconds(track.duration)} format={formatDuration} /></dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

type MenuEntry =
  | { kind: "separator"; key: string }
  | {
      kind: "item";
      key: string;
      label: string;
      active?: boolean;
      role?: "menuitem" | "menuitemradio";
      href?: string;
      icon?: ReactNode;
      closeOnSelect?: boolean;
      onSelect?(): void;
    };

function Dropdown({
  side = "bottom",
  triggerClass,
  triggerLabel,
  triggerTitle,
  triggerActive = false,
  trigger,
  entries,
  resetKey,
}: {
  side?: "top" | "bottom";
  triggerClass: string;
  triggerLabel: string;
  triggerTitle?: string;
  triggerActive?: boolean;
  trigger: ReactNode;
  entries: MenuEntry[];
  resetKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ right: number; top?: number; bottom?: number } | null>(null);
  const [highlight, setHighlight] = useState({ y: 0, height: 0, visible: false, animate: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [resetKey]);

  const place = useCallback(() => {
    const button = triggerRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(side === "bottom" ? { top: rect.bottom + 8 } : { bottom: Math.max(8, window.innerHeight - rect.top + 8) }),
    });
  }, [side]);

  useEffect(() => {
    if (!open) {
      setHighlight((current) => ({ ...current, visible: false, animate: false }));
      return;
    }
    place();
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      sound("toggle");
      setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        sound("toggle");
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", key);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("pointerdown", outside);
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  const moveHighlight = (element: HTMLElement) => {
    const menu = menuRef.current;
    if (!menu) return;
    const menuRect = menu.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    setHighlight((current) => ({
      y: itemRect.top - menuRect.top + menu.scrollTop,
      height: itemRect.height,
      visible: true,
      animate: current.visible,
    }));
  };

  const menu = mounted && open && position ? createPortal(
    <ul
      ref={menuRef}
      className={C.menu.content}
      role="menu"
      id={menuId}
      style={{ ...position, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onMouseLeave={() => setHighlight((current) => ({ ...current, visible: false, animate: false }))}
    >
      <div
        className={C.menu.highlight}
        aria-hidden="true"
        data-visible={highlight.visible ? "true" : "false"}
        data-animate={highlight.animate ? "true" : "false"}
        style={{ transform: `translateY(${highlight.y}px)`, height: highlight.height }}
      />
      {entries.map((entry) => {
        if (entry.kind === "separator") return <li key={entry.key} role="separator" className={C.menu.separator} aria-hidden="true" />;
        const itemClass = C.menu.item;
        const content = <>{entry.icon}{entry.label}</>;
        const onActivate = () => {
          entry.onSelect?.();
          if (entry.closeOnSelect !== false) setOpen(false);
        };
        return (
          <li
            key={entry.key}
            role="none"
            className={C.menu.row}
            onMouseEnter={(event) => { sound("hover"); moveHighlight(event.currentTarget); }}
          >
            {entry.href ? (
              <a
                role="menuitem"
                className={itemClass}
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                data-active={entry.active ? "true" : undefined}
                onClick={onActivate}
              >
                {content}
              </a>
            ) : (
              <button
                type="button"
                role={entry.role ?? "menuitem"}
                className={itemClass}
                data-active={entry.active ? "true" : undefined}
                aria-checked={entry.role === "menuitemradio" ? Boolean(entry.active) : undefined}
                onClick={onActivate}
              >
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>,
    document.body,
  ) : null;

  return (
    <div className={C.menu.root}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={triggerLabel}
        title={triggerTitle}
        data-active={triggerActive ? "true" : "false"}
        onMouseEnter={() => sound("hover")}
        onClick={() => { sound("toggle"); setOpen((current) => !current); }}
      >
        {trigger}
      </button>
      {menu}
    </div>
  );
}

type SortMode = "newest" | "oldest" | "title" | "album" | "shuffle" | null;
type ViewMode = "flow" | "list";

function Toolbar({
  sortMode,
  view,
  onSearch,
  onShuffle,
  onSort,
  onViewChange,
}: {
  sortMode: SortMode;
  view: ViewMode;
  onSearch(): void;
  onShuffle(): void;
  onSort(mode: Exclude<SortMode, "shuffle" | null>): void;
  onViewChange(view: ViewMode): void;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = window.localStorage.getItem("yeezyflow-theme");
    setTheme(saved === "light" || saved === "dark" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);
  const applyTheme = (next: "light" | "dark") => {
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("yeezyflow-theme", next);
    setTheme(next);
  };
  const namedSorts: Array<{ mode: Exclude<SortMode, "shuffle" | null>; label: string }> = [
    { mode: "newest", label: "Latest" },
    { mode: "oldest", label: "Oldest" },
    { mode: "title", label: "Song" },
    { mode: "album", label: "Album" },
  ];
  const entries: MenuEntry[] = [
    ...namedSorts.map(({ mode, label }) => ({
      kind: "item" as const,
      key: mode,
      label,
      role: "menuitemradio" as const,
      active: sortMode === mode,
      onSelect: () => { sound("select"); onSort(mode); },
    })),
    { kind: "separator", key: "sort-theme" },
    { kind: "item", key: "light", label: "Light", role: "menuitemradio", active: theme === "light", onSelect: () => { sound("select"); applyTheme("light"); } },
    { kind: "item", key: "dark", label: "Dark", role: "menuitemradio", active: theme === "dark", onSelect: () => { sound("select"); applyTheme("dark"); } },
    { kind: "separator", key: "theme-view" },
    { kind: "item", key: "list", label: "List", role: "menuitemradio", active: view === "list", onSelect: () => { sound("select"); onViewChange("list"); } },
    { kind: "item", key: "flow", label: "Coverflow", role: "menuitemradio", active: view === "flow", onSelect: () => { sound("select"); onViewChange("flow"); } },
  ];
  const filterActive = namedSorts.some(({ mode }) => sortMode === mode);

  return (
    <div className={C.toolbar.toolbar} role="toolbar" aria-label="Library controls">
      <button
        type="button"
        className={C.toolbar.button}
        aria-label="Search tracks"
        title="Search (⌘K)"
        onMouseEnter={() => sound("hover")}
        onPointerDown={(event) => {
          if (event.button === 0) {
            event.preventDefault();
            sound("tap");
            onSearch();
          }
        }}
        onClick={(event) => {
          if (event.detail === 0) {
            sound("tap");
            onSearch();
          }
        }}
      >
        <SearchIcon />
      </button>
      <button
        type="button"
        className={C.toolbar.button}
        data-active={sortMode === "shuffle" ? "true" : "false"}
        aria-label="Shuffle tracks"
        title="Shuffle"
        onMouseEnter={() => sound("hover")}
        onClick={() => { sound("tap"); onShuffle(); }}
      >
        <ShuffleIcon />
      </button>
      <Dropdown
        triggerClass={C.toolbar.button}
        triggerLabel="Filter tracks"
        triggerTitle="Filter"
        triggerActive={filterActive}
        trigger={<FilterIcon />}
        entries={entries}
      />
    </div>
  );
}

function Shell({
  children,
  actions,
  brandLabel,
  onBrandClick,
}: {
  children: ReactNode;
  actions: ReactNode;
  brandLabel: string;
  onBrandClick(): void;
}) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutRendered, setAboutRendered] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (aboutOpen) {
      setAboutRendered(true);
      return;
    }
    if (!aboutRendered) return;
    const timer = window.setTimeout(() => setAboutRendered(false), 180);
    return () => window.clearTimeout(timer);
  }, [aboutOpen, aboutRendered]);
  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAboutOpen(false);
      }
    };
    const outside = (event: PointerEvent) => {
      if (!rowRef.current?.contains(event.target as Node)) setAboutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", outside);
    };
  }, [aboutOpen]);
  return (
    <div className={C.shell.shell}>
      <header className={C.shell.header}>
        <div className={C.shell.brandRow} ref={rowRef}>
          <button
            type="button"
            className={C.shell.brand}
            aria-label={brandLabel}
            onMouseEnter={() => sound("hover")}
            onClick={() => { sound("tap"); onBrandClick(); }}
          >
            yeezyflow
          </button>
          <button
            type="button"
            className={C.shell.version}
            aria-label="About yeezyflow 1.0.0"
            aria-expanded={aboutOpen}
            aria-controls="yeezyflow-about-tip"
            onMouseEnter={() => sound("hover")}
            onClick={() => { sound("tap"); setAboutOpen((open) => !open); }}
          >
            1.0.0
          </button>
          {aboutOpen || aboutRendered ? (
            <div
              id="yeezyflow-about-tip"
              className={`${C.shell.aboutTip} ${aboutOpen ? "yf-about-enter" : "yf-about-exit"}`}
              role="tooltip"
              aria-hidden={!aboutOpen}
            >
              <p className={C.shell.aboutBody}>Yeezyflow maps 55 Kanye West tracks from 2004–2026. No audio is hosted here; playback streams through public videos using YouTube’s embedded player.</p>
            </div>
          ) : null}
        </div>
        <div className={C.shell.actions}>{actions}</div>
      </header>
      <main className={C.shell.main}>{children}</main>
    </div>
  );
}

function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function searchTracks(tracks: Track[], query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return tracks;
  const terms = normalized.split(/\s+/).filter(Boolean);
  return tracks
    .map((track) => {
      const title = normalizeSearch(track.title);
      const project = normalizeSearch(track.project);
      const artists = normalizeSearch(track.artists.join(" "));
      const year = String(track.year);
      const corpus = `${title} ${project} ${artists} ${year}`;
      if (!terms.every((term) => corpus.includes(term))) return null;
      let score = 0;
      if (title.startsWith(normalized)) score += 40;
      else if (title.includes(normalized)) score += 24;
      if (project.startsWith(normalized)) score += 12;
      else if (project.includes(normalized)) score += 8;
      if (artists.includes(normalized)) score += 4;
      if (year.includes(normalized)) score += 2;
      score += Math.max(0, 8 - title.length / 6);
      return { track, score };
    })
    .filter((entry): entry is { track: Track; score: number } => entry !== null)
    .sort((left, right) => right.score - left.score || left.track.title.localeCompare(right.track.title))
    .map(({ track }) => track);
}

type SearchHandle = { focus(): void };

const TrackSearch = forwardRef<SearchHandle, {
  tracks: Track[];
  open: boolean;
  onOpenChange(open: boolean): void;
  onSelect(id: string): void;
}>(function TrackSearch({ tracks, open, onOpenChange, onSelect }, ref) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [fades, setFades] = useState({ top: false, bottom: false });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const results = useMemo(() => searchTracks(tracks, query), [tracks, query]);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus({ preventScroll: true }) }));
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      setFades({ top: false, bottom: false });
      inputRef.current?.blur();
      return;
    }
    setActive(0);
    queueMicrotask(() => inputRef.current?.focus({ preventScroll: true }));
  }, [open]);
  useEffect(() => setActive((index) => results.length ? Math.min(index, results.length - 1) : 0), [results.length]);

  const updateFades = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setFades({
      top: list.scrollTop > 1,
      bottom: list.scrollTop + list.clientHeight < list.scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (list) list.scrollTop = 0;
    const frame = window.requestAnimationFrame(updateFades);
    return () => window.cancelAnimationFrame(frame);
  }, [open, query, updateFades]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !row) return;
    if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop;
    else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight;
    }
    updateFades();
  }, [active, open, updateFades]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        sound("toggle");
        onOpenChange(false);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        if (results.length) {
          sound("tick");
          setActive((index) => (index + 1) % results.length);
        }
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        if (results.length) {
          sound("tick");
          setActive((index) => modulo(index - 1, results.length));
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        const track = results[active];
        if (track) {
          sound("select");
          onSelect(track.id);
          onOpenChange(false);
        }
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [active, onOpenChange, onSelect, open, results]);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const list = listRef.current;
      const target = event.target;
      if (!(target instanceof Node)) {
        event.preventDefault();
        return;
      }
      if (target instanceof Element && target.closest("[data-search-field]")) return;
      if (!list || !list.contains(target) || !(list.scrollHeight > list.clientHeight + 1)) {
        event.preventDefault();
        return;
      }
      const delta = (event.touches[0]?.clientY ?? touchY) - touchY;
      const atTop = list.scrollTop <= 0;
      const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
      if ((atTop && delta > 0) || (atBottom && delta < 0)) event.preventDefault();
    };
    document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart, true);
      document.removeEventListener("touchmove", onTouchMove, true);
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!mounted) return null;
  const activeDescendant = results[active] ? `${listId}-${results[active].id}` : undefined;
  return createPortal(
    <div className={C.search.root} data-open={open ? "true" : "false"} role="presentation" aria-hidden={!open}>
      <button type="button" className={C.search.backdrop} tabIndex={open ? 0 : -1} aria-label="Close search" onClick={() => { sound("toggle"); onOpenChange(false); }} />
      <div className={C.search.dialog} role="dialog" aria-modal={open} aria-label="Search tracks">
        <div className={C.search.field} data-search-field>
          <SearchIcon className={C.search.icon} />
          <input
            ref={inputRef}
            className={C.search.input}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            placeholder="Search anything"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            tabIndex={open ? 0 : -1}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={open ? activeDescendant : undefined}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
          />
          <kbd className={C.search.hint}>esc</kbd>
          <button type="button" className={C.search.close} tabIndex={open ? 0 : -1} aria-label="Close search" onClick={() => { sound("toggle"); onOpenChange(false); }}><XIcon /></button>
        </div>
        <div className={C.search.listWrap} data-fade-top={fades.top ? "true" : "false"} data-fade-bottom={fades.bottom ? "true" : "false"}>
          <div ref={listRef} id={listId} className={C.search.list} role="listbox" aria-label="Tracks" onScroll={updateFades}>
            {results.length === 0 ? <p className={C.search.empty}>No matches</p> : results.map((track, index) => {
              const selected = index === active;
              return (
                <button
                  id={`${listId}-${track.id}`}
                  key={track.id}
                  type="button"
                  role="option"
                  tabIndex={open ? 0 : -1}
                  aria-selected={selected}
                  data-index={index}
                  data-active={selected ? "true" : "false"}
                  className={C.search.row}
                  onMouseEnter={() => { sound("hover"); setActive(index); }}
                  onClick={() => { sound("select"); onSelect(track.id); onOpenChange(false); }}
                >
                  <span className={C.search.cover}><CoverImage track={track} fill sizes="40px" /></span>
                  <span className={C.search.meta}>
                    <span className={C.search.title}>{track.title}</span>
                    <span className={C.search.sub}>{track.project}<span className={C.search.dot} aria-hidden="true">·</span>{track.year}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
});

function TrackList({ tracks }: { tracks: Track[] }) {
  const { activeSong, isPlaying, selectSong } = usePlayer();
  const listRef = useRef<HTMLOListElement>(null);
  const [highlight, setHighlight] = useState({ y: 0, height: 0, visible: false });
  const showHighlight = (element: HTMLElement) => {
    const list = listRef.current;
    if (!list) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = element.getBoundingClientRect();
    setHighlight({ y: rowRect.top - listRect.top + list.scrollTop, height: rowRect.height, visible: true });
  };
  return (
    <section className={C.list.section} aria-label="Track index">
      <ol ref={listRef} className={C.list.list} onMouseLeave={() => setHighlight((current) => ({ ...current, visible: false }))}>
        <div className={C.list.highlight} aria-hidden="true" data-visible={highlight.visible ? "true" : "false"} style={{ transform: `translateY(${highlight.y}px)`, height: highlight.height }} />
        {tracks.map((track) => {
          const active = activeSong?.id === track.id;
          return (
            <li key={track.id} className={C.list.track} data-active={active ? "true" : "false"} onMouseEnter={(event) => { sound("hover"); showHighlight(event.currentTarget); }}>
              <button
                type="button"
                className={C.list.hit}
                aria-pressed={active}
                aria-label={`${active && isPlaying ? "Pause" : "Play"} ${track.title}`}
                onClick={() => { sound(active ? "tap" : "select"); selectSong(track.id); }}
              >
                <span className={C.list.cover}><CoverImage track={track} width={48} height={48} /></span>
                <span className={C.list.copy}>
                  <span className={C.list.title}>{track.title}</span>
                  <span className={C.list.album}>{track.project}</span>
                </span>
                <span className={C.list.duration}>{track.duration}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const platforms: Array<{ key: PlatformKey; label: string; icon?: string }> = [
  { key: "spotify", label: "Spotify", icon: "/icons/icon-spotify.svg" },
  { key: "appleMusic", label: "Apple Music", icon: "/icons/icon-apple.svg" },
  { key: "youtube", label: "YouTube", icon: "/icons/icon-youtube.svg" },
  { key: "soundcloud", label: "SoundCloud" },
];

function FloatingPlayer({ onFocusTrack }: { onFocusTrack(id: string): void }) {
  const { activeSong, isPlaying, togglePlay, clearSong } = usePlayer();
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const dragRef = useRef<{ id: number; startY: number; lastY: number; lastTime: number; velocity: number } | null>(null);

  useEffect(() => {
    setCopied(false);
    setDragging(false);
    setOffset(0);
    dragRef.current = null;
  }, [activeSong?.id]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!activeSong) return null;

  const copyLink = async () => {
    sound("select");
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${activeSong.id}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dismiss = Math.max(0, event.clientY - drag.startY) > 56 || drag.velocity > .45;
    dragRef.current = null;
    setDragging(false);
    if (dismiss) {
      sound("toggle");
      setOffset(120);
      window.setTimeout(() => { clearSong(); setOffset(0); }, 160);
      return;
    }
    setOffset(0);
  };

  const entries: MenuEntry[] = platforms.flatMap(({ key, label, icon }) => {
    const href = activeSong.links[key];
    if (!href) return [];
    return [{
      kind: "item" as const,
      key,
      label,
      href,
      icon: icon ? <Image className={C.player.platformIcon} src={icon} alt="" width={16} height={16} data-platform={key} unoptimized /> : undefined,
      onSelect: () => sound("tap"),
    }];
  });
  entries.push({
    kind: "item",
    key: "copy",
    label: copied ? "Copied" : "Copy link",
    closeOnSelect: false,
    icon: copied ? <CheckIcon className={C.player.platformIcon} /> : <LinkIcon className={C.player.platformIcon} />,
    onSelect: () => { void copyLink(); },
  });

  return (
    <div className={C.player.dock} role="region" aria-label="Now playing">
      <div
        className={`${C.player.bar} squircle`}
        data-dragging={dragging ? "true" : "false"}
        style={{ transform: offset ? `translateY(${offset}px)` : undefined, opacity: offset ? Math.max(.35, 1 - offset / 140) : undefined }}
      >
        <button
          type="button"
          className={C.player.track}
          aria-label={`Focus ${activeSong.title}`}
          onMouseEnter={() => sound("hover")}
          onClick={() => { sound("select"); onFocusTrack(activeSong.id); }}
        >
          <span className={`${C.player.cover} squircle`}><CoverImage track={activeSong} width={40} height={40} /></span>
          <div className={C.player.copy}>
            <p className={C.player.title}>{activeSong.title}</p>
            <p className={C.player.album}>{activeSong.project}</p>
          </div>
        </button>
        <div
          className={C.player.dismiss}
          aria-label="Drag down to dismiss player"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { id: event.pointerId, startY: event.clientY, lastY: event.clientY, lastTime: performance.now(), velocity: 0 };
            setDragging(true);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.id !== event.pointerId) return;
            const now = performance.now();
            drag.velocity = (event.clientY - drag.lastY) / Math.max(now - drag.lastTime, 1);
            drag.lastY = event.clientY;
            drag.lastTime = now;
            setOffset(Math.max(0, event.clientY - drag.startY));
          }}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        />
        <div className={C.player.controls}>
          <button type="button" className={C.player.play} aria-label={isPlaying ? "Pause" : "Play"} onMouseEnter={() => sound("hover")} onClick={() => { sound("tap"); togglePlay(); }}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <Dropdown
            side="top"
            triggerClass={C.player.more}
            triggerLabel={`More options for ${activeSong.title}`}
            trigger={<MoreIcon />}
            entries={entries}
            resetKey={activeSong.id}
          />
        </div>
      </div>
    </div>
  );
}

function projectName(track: Track) {
  const project = track.project?.trim() || "Untitled";
  return project === "Untitled" ? `\uffff${project}` : project;
}

function sortTracks(mode: Exclude<SortMode, null>) {
  const next = [...CANONICAL_TRACKS];
  if (mode === "title") return next.sort((left, right) => left.title.localeCompare(right.title, undefined, { sensitivity: "base" }));
  if (mode === "album") return next.sort((left, right) => projectName(left).localeCompare(projectName(right), undefined, { sensitivity: "base" }) || left.title.localeCompare(right.title, undefined, { sensitivity: "base" }));
  if (mode === "newest") return next.sort((left, right) => right.year - left.year || left.title.localeCompare(right.title, undefined, { sensitivity: "base" }));
  if (mode === "oldest") return next.sort((left, right) => left.year - right.year || left.title.localeCompare(right.title, undefined, { sensitivity: "base" }));
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

function FlowApp({ initialTrackId }: { initialTrackId?: string }) {
  const player = usePlayer();
  const initialIndex = initialTrackId ? CANONICAL_TRACKS.findIndex((track) => track.id === initialTrackId) : 0;
  const [tracks, setTracks] = useState(CANONICAL_TRACKS);
  const [sortMode, setSortMode] = useState<SortMode>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [direction, setDirection] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("flow");
  const searchRef = useRef<SearchHandle>(null);
  const activeTrack = tracks[activeIndex] ?? tracks[0];

  useEffect(() => {
    if (initialTrackId) return;
    for (const key of new URLSearchParams(window.location.search).keys()) {
      const index = CANONICAL_TRACKS.findIndex((track) => track.id === key);
      if (index >= 0) {
        setActiveIndex(index);
        break;
      }
    }
  }, [initialTrackId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        sound("toggle");
        setSearchOpen((open) => {
          const next = !open;
          if (next) queueMicrotask(() => searchRef.current?.focus());
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (view !== "flow" || !player.activeSong) return;
    const index = tracks.findIndex((track) => track.id === player.activeSong?.id);
    if (index >= 0 && index !== activeIndex) setActiveIndex(index);
    // Matches the original behavior: re-focus when returning to coverflow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const changeIndex = useCallback((index: number) => {
    setActiveIndex((current) => {
      const length = tracks.length;
      setDirection(modulo(index - current, length) <= modulo(current - index, length) ? 1 : -1);
      return index;
    });
  }, [tracks.length]);

  const focusTrack = useCallback((id: string) => {
    const index = tracks.findIndex((track) => track.id === id);
    if (index < 0) return;
    changeIndex(index);
    setView("flow");
  }, [changeIndex, tracks]);

  const applySort = useCallback((mode: Exclude<SortMode, null>) => {
    const currentId = tracks[activeIndex]?.id;
    const next = sortTracks(mode);
    const nextIndex = mode === "shuffle" ? Math.floor(Math.random() * Math.max(next.length, 1)) : 0;
    const oldPosition = currentId ? next.findIndex((track) => track.id === currentId) : -1;
    if (oldPosition >= 0 && next.length) setDirection(modulo(nextIndex - oldPosition, next.length) <= modulo(oldPosition - nextIndex, next.length) ? 1 : -1);
    else setDirection(1);
    setTracks(next);
    setSortMode(mode);
    setActiveIndex(nextIndex);
  }, [activeIndex, tracks]);

  const openSearch = () => {
    setSearchOpen(true);
    queueMicrotask(() => searchRef.current?.focus());
  };

  if (!activeTrack) return null;
  return (
    <>
      <Shell
        brandLabel={view === "flow" ? "Switch to list view" : "Switch to flow view"}
        onBrandClick={() => setView((current) => current === "flow" ? "list" : "flow")}
        actions={
          <Toolbar
            sortMode={sortMode}
            view={view}
            onSearch={openSearch}
            onShuffle={() => applySort("shuffle")}
            onSort={applySort}
            onViewChange={setView}
          />
        }
      >
        {view === "flow" ? (
          <div className={C.experience.page}>
            <CoverFlow tracks={tracks} activeIndex={activeIndex} onChange={changeIndex} onPlay={player.selectSong} />
            <TrackMeta track={activeTrack} direction={direction} />
          </div>
        ) : (
          <div className={C.experience.listBody}><TrackList tracks={tracks} /></div>
        )}
      </Shell>
      <TrackSearch ref={searchRef} tracks={tracks} open={searchOpen} onOpenChange={setSearchOpen} onSelect={focusTrack} />
      <FloatingPlayer onFocusTrack={focusTrack} />
    </>
  );
}

export function FlowExperience({ initialTrackId }: { initialTrackId?: string }) {
  return <PlayerProvider><FlowApp initialTrackId={initialTrackId} /></PlayerProvider>;
}
