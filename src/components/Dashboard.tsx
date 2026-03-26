import "../components/dashboard.css";
import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type CameraStatus = "online" | "offline";

interface Campus {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  motion: boolean;
  fps: number;
  signal: number;
  }

type FilterType = "all" | "online" | "offline";
type ColCount = 2 | 3 | 4;

// ── Data ───────────────────────────────────────────────────────────────────

const CAMPUSES: Campus[] = [
  { id: "CAM-01", name: "Main Campus",     location: "Administration Block",  status: "online",  motion: true,  fps: 30, signal: 95 },
  { id: "CAM-02", name: "Alangilan Campus",    location: "Engineering Building",  status: "online",  motion: false, fps: 30, signal: 88 },
  { id: "CAM-03", name: "ARASOF-Nasugbu Campus",    location: "Science Complex",       status: "online",  motion: true,  fps: 24, signal: 76 },
  { id: "CAM-04", name: "JPLPC-Malvar Campus",     location: "Library & Research",    status: "offline", motion: false, fps: 0,  signal: 0  },
  { id: "CAM-05", name: "Lipa Campus",     location: "Student Center",        status: "online",  motion: false, fps: 30, signal: 91 },
  { id: "CAM-06", name: "Balayan Campus",     location: "IT & Innovation Hub",   status: "online",  motion: true,  fps: 30, signal: 84 },
  { id: "CAM-07", name: "Lemery Campus",      location: "Health Sciences",       status: "online",  motion: false, fps: 24, signal: 97 },
  { id: "CAM-08", name: "Lobo Campus",     location: "Creative Arts Bldg",    status: "offline", motion: false, fps: 0,  signal: 0  },
  { id: "CAM-09", name: "San Juan Campus",   location: "Gymnasium & Courts",    status: "online",  motion: false, fps: 30, signal: 80 },
  { id: "CAM-10", name: "Rosario Campus", location: "Commerce Building",     status: "online",  motion: false, fps: 30, signal: 93 },
  { id: "CAM-11", name: "Mabini Campus",    location: "Extension Facilities",  status: "online",  motion: false, fps: 24, signal: 72 },
];

const FEED_COLORS: [string, string][] = [
  ["#0ea5e9", "#0284c7"],
  ["#6366f1", "#4f46e5"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#8b5cf6", "#7c3aed"],
  ["#06b6d4", "#0891b2"],
  ["#ec4899", "#db2777"],
  ["#14b8a6", "#0d9488"],
  ["#f97316", "#ea580c"],
  ["#a855f7", "#9333ea"],
  ["#22d3ee", "#06b6d4"],
];

// Design tokens — all colours kept here, no Tailwind opacity modifiers used
const C = {
  bgPage:       "#030712",
  bgPanel:      "#111827",
  border:       "rgba(255,255,255,0.07)",
  borderFaint:  "rgba(255,255,255,0.04)",
  textPrimary:  "#f9fafb",
  textSecond:   "#6b7280",
  textMuted:    "#374151",
  sky:          "#0ea5e9",
  emerald:      "#10b981",
  emeraldLight: "#34d399",
  red:          "#ef4444",
  redLight:     "#f87171",
  yellow:       "#facc15",
} as const;

const GRID_COLS: Record<ColCount, string> = {
  2: "repeat(2,1fr)",
  3: "repeat(3,1fr)",
  4: "repeat(4,1fr)",
};

// ── FeedVisual ─────────────────────────────────────────────────────────────

function FeedVisual({ cam, idx }: { cam: Campus; idx: number }) {
  const [c1, c2] = FEED_COLORS[idx % FEED_COLORS.length];

  if (cam.status === "offline") {
    return (
      <div style={{ position:"relative", width:"100%", height:"100%", background:C.bgPage, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.02) 3px)" }} />
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="1.5">
          <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A9.466 9.466 0 0112 5c4.478 0 8.268-2.943 9.542-7a9.59 9.59 0 01-.81 2.1m-3.247 2.833A9.479 9.479 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.569 9.569 0 011.308-2.643" strokeLinecap="round"/>
        </svg>
        <span style={{ color:C.red, fontSize:11, fontFamily:"monospace", letterSpacing:"0.15em" }}>NO SIGNAL</span>
        <span style={{ color:C.textSecond, fontSize:10, fontFamily:"monospace" }}>CONNECTION LOST</span>
      </div>
    );
  }

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden", background:C.bgPage }}>
      {/* Gradient bg */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 30% 60%,${c1}28 0%,transparent 55%),radial-gradient(ellipse at 75% 30%,${c2}1a 0%,transparent 50%),linear-gradient(180deg,#04080f 0%,#060d18 100%)` }} />
      {/* Scanlines */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.22) 3px)", backgroundSize:"100% 4px" }} />
      {/* Animated scan bar */}
      <div style={{ position:"absolute", left:0, right:0, height:1, pointerEvents:"none", background:`linear-gradient(90deg,transparent,${c1}90,transparent)`, animation:"cctvScan 3s linear infinite", animationDelay:`${idx * 0.27}s` }} />
      {/* City silhouette */}
      <svg style={{ position:"absolute", bottom:0, left:0, width:"100%", opacity:0.18 }} viewBox="0 0 320 80" preserveAspectRatio="none">
        <rect x="20"  y="30" width="40" height="50" fill={c1} opacity="0.7"/>
        <rect x="30"  y="15" width="20" height="15" fill={c1} opacity="0.5"/>
        <rect x="80"  y="20" width="60" height="60" fill={c1} opacity="0.6"/>
        <rect x="95"  y="5"  width="30" height="15" fill={c1} opacity="0.4"/>
        <rect x="160" y="35" width="30" height="45" fill={c1} opacity="0.5"/>
        <rect x="200" y="10" width="80" height="70" fill={c1} opacity="0.4"/>
        <rect x="285" y="40" width="35" height="40" fill={c1} opacity="0.5"/>
        <ellipse cx="150" cy="30" rx="15" ry="20" fill={c2} opacity="0.35"/>
        <rect x="147" y="45" width="6"   height="15" fill={c2} opacity="0.25"/>
        <ellipse cx="275" cy="35" rx="12" ry="18" fill={c2} opacity="0.3"/>
      </svg>
      {/* Corner brackets */}
      {([
        { top:6, left:6,  borderTop:`1.5px solid ${c1}90`, borderLeft:`1.5px solid ${c1}90`   },
        { top:6, right:6, borderTop:`1.5px solid ${c1}90`, borderRight:`1.5px solid ${c1}90`  },
        { bottom:6, left:6,  borderBottom:`1.5px solid ${c1}90`, borderLeft:`1.5px solid ${c1}90`  },
        { bottom:6, right:6, borderBottom:`1.5px solid ${c1}90`, borderRight:`1.5px solid ${c1}90` },
      ] as React.CSSProperties[]).map((st, i) => (
        <div key={i} style={{ position:"absolute", width:14, height:14, ...st }} />
      ))}
      {/* REC */}
      <div style={{ position:"absolute", top:10, left:10, display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:C.red, animation:"recPulse 1.4s ease infinite", boxShadow:`0 0 6px ${C.red}` }} />
        <span style={{ fontSize:9, fontFamily:"monospace", color:"rgba(255,255,255,0.5)", letterSpacing:"0.15em" }}>REC</span>
      </div>
      {/* FPS */}
      <div style={{ position:"absolute", top:10, right:10, fontSize:9, fontFamily:"monospace", color:`${c1}cc`, letterSpacing:"0.1em" }}>{cam.fps}fps</div>
    </div>
  );
}


// ── SignalBars ─────────────────────────────────────────────────────────────

function SignalBars({ value }: { value: number }) {
  const BARS = 5;
  const active = Math.round((value / 100) * BARS);
  const color = value > 70 ? C.emerald : value > 40 ? C.yellow : C.red;
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:12 }}>
      {Array.from({ length: BARS }).map((_, i) => (
        <div key={i} style={{ width:3, borderRadius:2, height:`${((i+1)/BARS)*100}%`, background: i < active ? color : "#374151", transition:"background 0.3s" }} />
      ))}
    </div>
  );
}

export default Dashboard;

// ── Badge ──────────────────────────────────────────────────────────────────

function Badge({ label, bg, color, border }: { label: string; bg: string; color: string; border: string }) {
  return (
    <span style={{ fontSize:9, fontFamily:"monospace", fontWeight:700, padding:"2px 6px", borderRadius:4, background:bg, color, border:`1px solid ${border}`, letterSpacing:"0.1em" }}>
      {label}
    </span>
  );
}

// ── CameraCard ─────────────────────────────────────────────────────────────

interface CameraCardProps {
  cam: Campus;
  idx: number;
  expanded: boolean;
  onExpand: (id: string | null) => void;
}

function CameraCard({ cam, idx, expanded, onExpand }: CameraCardProps) {
  const isAlert   = false;
  const isOffline = cam.status === "offline";

  const shadow = expanded
    ? `0 0 0 2px ${C.sky}, 0 0 24px ${C.sky}40`
    : isAlert
    ? `0 0 0 1px ${C.yellow}80, 0 0 18px ${C.yellow}20`
    : isOffline
    ? `0 0 0 1px ${C.red}50`
    : `0 0 0 1px ${C.border}`;

  return (
    <div
      onClick={() => onExpand(expanded ? null : cam.id)}
      style={{ background:C.bgPanel, borderRadius:12, overflow:"hidden", cursor:"pointer", boxShadow:shadow, opacity:isOffline ? 0.72 : 1, transition:"transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
      className="cam-enter"
    >
      {/* 16:9 feed */}
      <div style={{ position:"relative", width:"100%", aspectRatio:"16/9" }}>
        <FeedVisual cam={cam} idx={idx} />
        <div style={{ position:"absolute", bottom:6, left:8, fontSize:9, fontFamily:"monospace", color:"rgba(255,255,255,0.2)", letterSpacing:"0.1em" }}>{cam.id}</div>
      </div>
      {/* Info strip */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderTop:`1px solid ${C.borderFaint}` }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cam.name}</div>
          <div style={{ fontSize:10, fontFamily:"monospace", color:C.textSecond, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1 }}>{cam.location}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:8, flexShrink:0 }}>
          {cam.status === "online" ? (
            <>
              <Badge label="LIVE" bg="rgba(16,185,129,0.1)"  color={C.emeraldLight} border="rgba(16,185,129,0.25)" />
              <SignalBars value={cam.signal} />
            </>
          ) : (
            <Badge label="OFFLINE" bg="rgba(239,68,68,0.1)" color={C.redLight} border="rgba(239,68,68,0.25)" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accentBg }: { icon: string; label: string; value: number; accentBg: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, background:C.bgPanel, border:`1px solid ${C.border}` }}>
      <div style={{ width:36, height:36, borderRadius:8, background:accentBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:22, fontWeight:700, color:C.textPrimary, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:10, fontFamily:"monospace", color:C.textSecond, letterSpacing:"0.15em", textTransform:"uppercase", marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

// ── LiveClock ──────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign:"right" }}>
      <div style={{ fontSize:13, fontFamily:"monospace", color:C.sky, letterSpacing:"0.15em" }}>
        {time.toLocaleTimeString("en-US", { hour12: false })}
      </div>
      <div style={{ fontSize:10, fontFamily:"monospace", color:C.textMuted, letterSpacing:"0.1em", marginTop:2 }}>
        {time.toLocaleDateString("en-US", { month:"short", day:"2-digit", year:"numeric" })}
      </div>
    </div>
  );
}


// ── Root ───────────────────────────────────────────────────────────────────
function Dashboard() {
  const [filter,   setFilter]   = useState<FilterType>("all");
  const [search,   setSearch]   = useState<string>("");
  const [cols,     setCols]     = useState<ColCount>(4);
  const [expanded, setExpanded] = useState<string | null>(null);

  const online  = CAMPUSES.filter(c => c.status === "online").length;
  const offline = CAMPUSES.filter(c => c.status === "offline").length;
  const alerts  = CAMPUSES.filter(c => c.motion && c.status === "online").length;

  const filtered = CAMPUSES.filter(cam => {
    const q = search.toLowerCase();
    const matchSearch =
      cam.name.toLowerCase().includes(q) ||
      cam.location.toLowerCase().includes(q) ||
      cam.id.toLowerCase().includes(q);
    const matchFilter =
      filter === "all"     ? true :
      filter === "online"  ? cam.status === "online"  :
      filter === "offline" ? cam.status === "offline" : true;
    return matchSearch && matchFilter;
  });

  const FILTERS: [FilterType, string][] = [
    ["all","All"], ["online","Online"], ["offline","Offline"],
  ];

  const COL_ICONS: [ColCount, React.ReactNode][] = [
    [2, <><rect x="3"  y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></>],
    [3, <><rect x="3"  y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="16" y="3" width="5" height="18" rx="1"/></>],
    [4, <><rect x="3"  y="3" width="3" height="18" rx="1"/><rect x="8"  y="3" width="3" height="18" rx="1"/><rect x="13" y="3" width="3" height="18" rx="1"/><rect x="18" y="3" width="3" height="18" rx="1"/></>],
  ];

  return (
    <div className="dashboard-root">


      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-header-logo">
            <img src="/bsu-logo.png" alt="BSU Logo" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
          </div>
          <div className="dashboard-header-title">
            <div className="dashboard-header-title-main">Dashboard</div>
            <div className="dashboard-header-title-sub">REAL-TIME CAMPUS MONITOR</div>
          </div>
        </div>

        <div className="status-pill">
          <div className="status-pill-dot" />
          <span className="status-pill-label">ALL SYSTEMS ACTIVE</span>
        </div>

        <LiveClock />
      </header>

      {/* ── Stats ── */}
      <div className="stat-grid">
        <StatCard icon="🎥" label="Total Cameras" value={CAMPUSES.length} accentBg="rgba(14,165,233,0.12)"  />
        <StatCard icon="✅" label="Online"         value={online}          accentBg="rgba(16,185,129,0.12)"  />
        <StatCard icon="🔴" label="Offline"        value={offline}         accentBg="rgba(239,68,68,0.12)"   />
      </div>

      {/* ── Toolbar ── */}
      <div className="dashboard-toolbar">
        {/* Search */}
        <div className="dashboard-toolbar-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search campus..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dashboard-toolbar-search-input"
          />
        </div>

        {/* Filters */}
        <div className="dashboard-toolbar-filters">
          {FILTERS.map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)} className={`dashboard-toolbar-filter-btn${filter===val ? " active" : ""}`}>
              {lbl.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Column toggles */}
        <div className="dashboard-toolbar-cols">
          {COL_ICONS.map(([n, icon]) => (
            <button key={n} onClick={() => setCols(n)} className={`dashboard-toolbar-cols-btn${cols===n ? " active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">{icon}</svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="dashboard-main">
        <div className="dashboard-main-header">
          <span className="dashboard-main-header-count">
            Showing {filtered.length} of {CAMPUSES.length} cameras
          </span>
          {filter !== "all" && (
            <span className="dashboard-main-header-filter">
              {filter}
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="dashboard-main-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="dashboard-main-empty-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p className="dashboard-main-empty-title">No cameras found</p>
            <p className="dashboard-main-empty-desc">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="cam-grid" style={{ gridTemplateColumns:GRID_COLS[cols] }}>
            {filtered.map((cam, idx) => (
              <div key={cam.id} className="cam-enter" style={{ animationDelay:`${idx * 40}ms` }}>
                <CameraCard cam={cam} idx={CAMPUSES.indexOf(cam)} expanded={expanded === cam.id} onExpand={setExpanded} />
              </div>
            ))}
          </div>
        )}
        {/* Enlarged floating camera modal */}
        {expanded && (
          <div className="cctv-modal-overlay" onClick={() => setExpanded(null)}>
            <div className="cctv-modal-content" onClick={e => e.stopPropagation()}>
              <button className="cctv-modal-close" onClick={() => setExpanded(null)}>&times;</button>
              <CameraCard cam={CAMPUSES.find(c => c.id === expanded)!} idx={CAMPUSES.findIndex(c => c.id === expanded)} expanded={true} onExpand={() => setExpanded(null)} />
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="dashboard-footer">
        <span className="dashboard-footer-title">CCTV MONITOR v2.0 — CAMPUS SECURITY</span>
        <span className="dashboard-footer-status">{online} online · {offline} offline · {alerts} alerts</span>
      </footer>
    </div>
  );
}