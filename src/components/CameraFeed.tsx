import { useRef, useEffect } from "react";
import "./CameraFeed.css";
import { useHlsPlayer } from "../hooks/useHlsPlayer";

// ── Types (exported so Dashboard can import them) ─────────────────────────
export type CameraStatus = "online" | "offline" | "connecting";

export interface Campus {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  motion: boolean;
  fps: number;
  signal: number;
  streamUrl?: string;
  streamUrlHD?: string;
}

export interface CameraFeedProps {
  cam: Campus;
  idx: number;
  featured?: boolean;
  streamUrl?: string;
  streamUrlHD?: string;
  expanded: boolean;
  onExpand: (id: string | null) => void;
}

// ── Per-camera accent palette ──────────────────────────────────────────────
const PALETTE: [string, string][] = [
  ["#38bdf8","#0ea5e9"],["#818cf8","#6366f1"],["#34d399","#10b981"],
  ["#fbbf24","#f59e0b"],["#a78bfa","#8b5cf6"],["#22d3ee","#06b6d4"],
  ["#f472b6","#ec4899"],["#2dd4bf","#14b8a6"],["#fb923c","#f97316"],
  ["#c084fc","#a855f7"],["#67e8f9","#22d3ee"],
];

// ── Signal bars ────────────────────────────────────────────────────────────
function SignalBars({ value }: { value: number }) {
  const BARS = 5;
  const active = Math.round((value / 100) * BARS);
  const color = value > 70 ? "#10b981" : value > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="cf-signal">
      {Array.from({ length: BARS }).map((_, i) => (
        <div key={i} className="cf-signal-bar" style={{
          height: `${((i + 1) / BARS) * 100}%`,
          background: i < active ? color : "rgba(255,255,255,0.1)",
        }} />
      ))}
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CameraStatus }) {
  const cls = status === "online" ? "cf-status cf-status-online" :
              status === "offline" ? "cf-status cf-status-offline" :
              "cf-status cf-status-connecting";
  const dotCls = status === "online" ? "cf-status-dot cf-status-dot-online" :
                 status === "offline" ? "cf-status-dot cf-status-dot-offline" :
                 "cf-status-dot cf-status-dot-connecting";
  const label = status === "online" ? "LIVE" : status === "offline" ? "OFFLINE" : "CONNECTING";
  return (
    <div className={cls}>
      <div className={dotCls} />
      {label}
    </div>
  );
}

// ── Animated placeholder (demo / no-stream) ────────────────────────────────
function PlaceholderVisual({ cam, idx }: { cam: Campus; idx: number }) {
  const [c1, c2] = PALETTE[idx % PALETTE.length];

  if (cam.status === "offline") {
    return (
      <div className="cf-nosignal">
        <div className="cf-nosignal-noise" />
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" style={{ position:"relative", opacity:0.8 }}>
          <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A9.466 9.466 0 0112 5c4.478 0 8.268-2.943 9.542-7a9.59 9.59 0 01-.81 2.1m-3.247 2.833A9.479 9.479 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.569 9.569 0 011.308-2.643" strokeLinecap="round"/>
        </svg>
        <span className="cf-nosignal-label">NO SIGNAL</span>
        <span className="cf-nosignal-sub">Connection lost</span>
      </div>
    );
  }

  return (
    <div style={{ position:"absolute", inset:0, background:`#04090f`, overflow:"hidden" }}>
      {/* Radial colour backdrop */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 28% 65%,${c1}22 0%,transparent 52%),radial-gradient(ellipse at 78% 28%,${c2}16 0%,transparent 50%),linear-gradient(170deg,#04060d 0%,#05090f 100%)` }} />
      {/* Scanlines */}
      <div className="cf-scanlines" />
      {/* City silhouette */}

      <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", opacity:0.14 }} viewBox="0 0 320 80" preserveAspectRatio="none">
        <rect x="10"  y="35" width="38" height="45" fill={c1} opacity="0.8"/>
        <rect x="20"  y="18" width="18" height="17" fill={c1} opacity="0.6"/>
        <rect x="65"  y="22" width="56" height="58" fill={c1} opacity="0.65"/>
        <rect x="80"  y="6"  width="28" height="16" fill={c1} opacity="0.5"/>
        <rect x="155" y="38" width="28" height="42" fill={c1} opacity="0.6"/>
        <rect x="195" y="12" width="76" height="68" fill={c1} opacity="0.45"/>
        <rect x="280" y="40" width="38" height="40" fill={c1} opacity="0.55"/>
        <ellipse cx="148" cy="32" rx="14" ry="19" fill={c2} opacity="0.4"/>
        <rect    x="145" y="48" width="6" height="14" fill={c2} opacity="0.28"/>
        <ellipse cx="272" cy="36" rx="11" ry="17" fill={c2} opacity="0.35"/>
      </svg>
      {/* Corner brackets */}
      {[
        { top:8, left:8,   borderTop:`1.5px solid ${c1}88`, borderLeft:`1.5px solid ${c1}88`   },
        { top:8, right:8,  borderTop:`1.5px solid ${c1}88`, borderRight:`1.5px solid ${c1}88`  },
        { bottom:8, left:8,  borderBottom:`1.5px solid ${c1}88`, borderLeft:`1.5px solid ${c1}88`  },
        { bottom:8, right:8, borderBottom:`1.5px solid ${c1}88`, borderRight:`1.5px solid ${c1}88` },
      ].map((st, i) => (
        <div key={i} style={{ position:"absolute", width:13, height:13, pointerEvents:"none", ...st as React.CSSProperties }} />
      ))}
    </div>
  );
}

// ── CameraFeed ─────────────────────────────────────────────────────────────
export default function CameraFeed({
  cam, idx, featured = false, streamUrl, streamUrlHD, expanded, onExpand,
}: CameraFeedProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [c1] = PALETTE[idx % PALETTE.length];

  const activeUrl = expanded ? (streamUrlHD ?? streamUrl) : streamUrl;

  const { status } = useHlsPlayer(videoRef, activeUrl, {
    startLevel: expanded ? 0 : -1,
    lowLatency: false,
  });

  const displayStatus: CameraStatus = activeUrl ? status : cam.status;

  // Pause when scrolled out of view
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) video.play().catch(()=>{}); else video.pause(); },
      { threshold: 0.1 }
    );
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  const cardCls = [
    "cf-card cam-enter",
    featured ? "cf-card-featured" : "",
    expanded  ? "cf-card-expanded"  : "",
    displayStatus === "offline" ? "cf-card-offline" : "",
    cam.motion && displayStatus === "online" ? "cf-motion" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={containerRef}
      className={cardCls}
      style={{
        '--cam-accent': c1,
        '--cam-glow': `${c1}30`,
      } as React.CSSProperties}
      onClick={() => onExpand(expanded ? null : cam.id)}
    >
      {/* ── Feed area ── */}
      <div className="cf-feed">

        {/* Real HLS video */}
        {activeUrl && (
          <video
            ref={videoRef}
            className="cf-video"
            muted playsInline autoPlay
            style={{ display: displayStatus === "online" ? "block" : "none" }}
          />
        )}

        {/* Placeholder or connecting spinner */}
        {(displayStatus !== "online" || !activeUrl) && (
          displayStatus === "connecting" && activeUrl ? (
            <div className="cf-connecting">
              <div className="cf-connecting-spinner" />
              <span className="cf-connecting-label">CONNECTING…</span>
            </div>
          ) : (
            <PlaceholderVisual cam={cam} idx={idx} />
          )
        )}

        {/* Hover quick-actions overlay */}
        <div className="cf-actions" onClick={e => e.stopPropagation()}>
          <button className="cf-action-btn" title="Snapshot" onClick={() => {
            // Snapshot: draw video frame to canvas and download
            const video = videoRef.current;
            if (!video) return;
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            canvas.getContext("2d")?.drawImage(video, 0, 0);
            const a = document.createElement("a");
            a.href = canvas.toDataURL("image/png");
            a.download = `${cam.id}_snapshot.png`;
            a.click();
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2"/><circle cx="12" cy="14" r="3"/><path d="m8 7 1.5-3h5L16 7"/>
            </svg>
            SNAP
          </button>
          <button className="cf-action-btn" title="Expand" onClick={(e) => {
            e.stopPropagation();
            onExpand(cam.id);
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
            FULL
          </button>
        </div>

        {/* Status badge */}
        <StatusBadge status={displayStatus} />

        {/* Motion badge */}
        {cam.motion && displayStatus === "online" && (
          <div className="cf-motion-badge">⚡ MOTION</div>
        )}

        {/* Featured badge */}
        {featured && <div className="cf-main-badge">MAIN FEED</div>}

        {/* REC indicator (only when online and not featured — featured already shows MAIN FEED) */}
        {displayStatus === "online" && !featured && (
          <div className="cf-rec">
            <div className="cf-rec-dot" />
            <span className="cf-rec-label">REC</span>
          </div>
        )}

        {/* FPS counter */}
        {displayStatus === "online" && cam.fps > 0 && (
          <div className="cf-fps" style={{ color: `${c1}99` }}>{cam.fps}fps</div>
        )}

        {/* Camera ID watermark */}
        <div className="cf-cam-id">{cam.id}</div>

        {/* Location label overlay (bottom of video) — name only, no duplication */}
        {displayStatus === "online" && (
          <div className="cf-label-overlay">
            <div className="cf-label-name">{cam.name}</div>
            <div className="cf-label-location">{cam.location}</div>
          </div>
        )}
      </div>

      {/* ── Info strip (below video) ── */}
      <div className="cf-info">
        <div className="cf-info-left">
          <div className="cf-info-name">{cam.name}</div>
          <div className="cf-info-loc">{cam.location}</div>
        </div>
        <div className="cf-info-right">
          {displayStatus === "online"
            ? <><span className="cf-badge cf-badge-live">LIVE</span><SignalBars value={cam.signal} /></>
            : displayStatus === "connecting"
            ? <span className="cf-badge cf-badge-connecting">SYNC</span>
            : <span className="cf-badge cf-badge-offline">OFFLINE</span>
          }
        </div>
      </div>
    </div>
  );
}
