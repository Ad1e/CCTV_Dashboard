import "./Dashboard.css";
import "./CameraFeed.css";
import { useState, useEffect, useCallback } from "react";
import bsuLogo from "../assets/bsu-logo.png";
import CameraFeed, { type Campus } from "./CameraFeed";

export type { Campus };

type FilterType = "all" | "online" | "offline";
type ColCount   = 2 | 3 | 4;
type LayoutMode = "matrix" | "uniform";
type ThemeMode = "dark" | "light";

const THEME_KEY = "bsu-cctv-theme";

// ── Camera data ────────────────────────────────────────────────────────────
const CAMPUSES: Campus[] = [
  { id:"CAM-01", name:"Main Campus",     location:"Administration Block", status:"online",     motion:true,  fps:30, signal:95, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-02", name:"Alangilan",       location:"Engineering Building", status:"online",     motion:false, fps:30, signal:88, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-03", name:"ARASOF-Nasugbu", location:"Science Complex",      status:"online",     motion:true,  fps:24, signal:76, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-04", name:"JPLPC-Malvar",   location:"Library & Research",   status:"offline",    motion:false, fps:0,  signal:0,  streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-05", name:"Lipa Campus",    location:"Student Center",       status:"online",     motion:false, fps:30, signal:91, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-06", name:"Balayan Campus", location:"IT & Innovation Hub",  status:"online",     motion:true,  fps:30, signal:84, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-07", name:"Lemery Campus",  location:"Health Sciences",      status:"online",     motion:false, fps:24, signal:97, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-08", name:"Lobo Campus",    location:"Creative Arts Bldg",   status:"offline",    motion:false, fps:0,  signal:0,  streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-09", name:"San Juan",       location:"Gymnasium & Courts",   status:"online",     motion:false, fps:30, signal:80, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-10", name:"Rosario Campus", location:"Commerce Building",    status:"online",     motion:false, fps:30, signal:93, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-11", name:"Mabini Campus",  location:"Extension Facilities", status:"connecting", motion:false, fps:24, signal:72, streamUrl:undefined, streamUrlHD:undefined },
];

const GRID_COLS: Record<ColCount, string> = {
  2: "repeat(2,1fr)",
  3: "repeat(3,1fr)",
  4: "repeat(4,1fr)",
};

function getMatrixSlotClass(idx: number): string {
  if (idx === 0) return "cf-slot-featured";
  if (idx <= 4)  return "cf-slot-sm";
  return "cf-slot-bottom";
}

// ── Icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const MatrixIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="10" height="14" rx="1"/>
    <rect x="14" y="2" width="8" height="6" rx="1"/>
    <rect x="14" y="10" width="8" height="6" rx="1"/>
    <rect x="2" y="18" width="20" height="4" rx="1"/>
  </svg>
);

// ── LiveClock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="live-clock">
      <div className="live-clock-time">
        {time.toLocaleTimeString("en-US", { hour12: false })}
      </div>
      <div className="live-clock-date">
        {time.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"2-digit" })}
      </div>
    </div>
  );
}

// ── Stat pill ──────────────────────────────────────────────────────────────
interface StatPillProps {
  label: string;
  value: number;
  color: "cyan" | "green" | "red" | "amber";
}
function StatPill({ label, value, color }: StatPillProps) {
  const colors = {
    cyan:  { bg:"rgba(56,189,248,0.1)",  border:"rgba(56,189,248,0.2)",  text:"#38bdf8" },
    green: { bg:"rgba(16,185,129,0.1)", border:"rgba(16,185,129,0.2)", text:"#34d399" },
    red:   { bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.2)",  text:"#f87171" },
    amber: { bg:"rgba(245,158,11,0.1)", border:"rgba(245,158,11,0.2)", text:"#fbbf24" },
  }[color];
  return (
    <div className="stat-pill-item" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
      <span className="stat-pill-value" style={{ color: colors.text }}>{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [filter,   setFilter]   = useState<FilterType>("all");
  const [search,   setSearch]   = useState<string>("");
  const [cols,     setCols]     = useState<ColCount>(4);
  const [layout,   setLayout]   = useState<LayoutMode>("matrix");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const s = localStorage.getItem(THEME_KEY);
    return s === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const online     = CAMPUSES.filter(c => c.status === "online").length;
  const offline    = CAMPUSES.filter(c => c.status === "offline").length;
  const connecting = CAMPUSES.filter(c => c.status === "connecting").length;
  const alerts     = CAMPUSES.filter(c => c.motion && c.status === "online").length;

  const filtered = CAMPUSES.filter(cam => {
    const q = search.toLowerCase();
    const matchSearch = cam.name.toLowerCase().includes(q)
      || cam.location.toLowerCase().includes(q)
      || cam.id.toLowerCase().includes(q);
    const matchFilter =
      filter === "all"     ? true :
      filter === "online"  ? cam.status === "online" :
      cam.status === "offline";
    return matchSearch && matchFilter;
  });

  const COL_ICONS: [ColCount, React.ReactNode][] = [
    [2, <><rect x="3"  y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></>],
    [3, <><rect x="3"  y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="4" height="18" rx="1"/><rect x="16" y="3" width="5" height="18" rx="1"/></>],
    [4, <><rect x="3"  y="3" width="3" height="18" rx="1"/><rect x="8"  y="3" width="3" height="18" rx="1"/><rect x="13" y="3" width="3" height="18" rx="1"/><rect x="18" y="3" width="3" height="18" rx="1"/></>],
  ];

  const FILTERS: [FilterType, string, number][] = [
    ["all",     "All",     CAMPUSES.length],
    ["online",  "Online",  online],
    ["offline", "Offline", offline + connecting],
  ];

  const expandedCam = CAMPUSES.find(c => c.id === expanded);

  return (
    <div className="dashboard-root">

      {/* ── Header ── */}
      <header className="dashboard-header">

        {/* Left: Logo + title */}
        <div className="dashboard-header-left">
          <img src={bsuLogo} alt="BSU" className="header-logo" />
          <div>
            <div className="dashboard-header-title-main">BSU Security Matrix</div>
            <div className="dashboard-header-title-sub">Real-time campus monitor · v2.1</div>
          </div>
        </div>

        {/* Center: Status pills */}
        <div className="header-stats">
          <StatPill label="Total"      value={CAMPUSES.length} color="cyan"  />
          <StatPill label="Online"     value={online}          color="green" />
          <StatPill label="Offline"    value={offline}         color="red"   />
          <StatPill label="Alerts"     value={alerts}          color="amber" />
        </div>

        {/* Right: system pill + clock */}
        <div className="dashboard-header-right">
          <div className="status-pill">
            <div className="status-pill-dot" />
            <span className="status-pill-label">SYSTEMS ACTIVE</span>
          </div>
          <button
            type="button"
            className="dashboard-theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <LiveClock />
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="dashboard-toolbar">
        <div className="dashboard-toolbar-search">
          <SearchIcon />
          <input
            id="cam-search"
            type="text"
            placeholder="Search campus, location, camera ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="dashboard-toolbar-search-input"
          />
        </div>

        <div className="dashboard-toolbar-filters">
          {FILTERS.map(([val, lbl, count]) => (
            <button key={val} id={`filter-${val}`}
              onClick={() => setFilter(val)}
              className={`dashboard-toolbar-filter-btn${filter === val ? " active" : ""}`}>
              {lbl}
              <span className="filter-count">{count}</span>
            </button>
          ))}
        </div>

        <div className="dashboard-toolbar-divider" />

        {/* Layout toggles */}
        <div className="dashboard-toolbar-cols">
          <button id="layout-matrix" title="Security Matrix"
            onClick={() => setLayout("matrix")}
            className={`dashboard-toolbar-cols-btn${layout === "matrix" ? " active" : ""}`}>
            <MatrixIcon />
          </button>
          {COL_ICONS.map(([n, icon]) => (
            <button key={n} id={`layout-cols-${n}`} title={`${n} columns`}
              onClick={() => { setLayout("uniform"); setCols(n); }}
              className={`dashboard-toolbar-cols-btn${layout === "uniform" && cols === n ? " active" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">{icon}</svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content label ── */}
      <div className="content-header">
        <span className="content-count">{filtered.length} / {CAMPUSES.length} cameras</span>
        {layout === "matrix" && <span className="content-tag content-tag-matrix">SECURITY MATRIX</span>}
        {filter !== "all" && <span className="content-tag content-tag-filter">{filter}</span>}
        {connecting > 0 && (
          <span className="content-tag content-tag-syncing">{connecting} syncing</span>
        )}
      </div>

      {/* ── Camera grid ── */}
      <div className="dashboard-content">
        {filtered.length === 0 ? (
          <div className="dashboard-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity:0.3 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p className="dashboard-empty-title">No cameras match your search</p>
          </div>
        ) : layout === "matrix" ? (
          <div className="cam-grid-matrix">
            {filtered.map((cam, idx) => (
              <div key={cam.id} className={getMatrixSlotClass(idx)}>
                <CameraFeed
                  cam={cam}
                  idx={CAMPUSES.indexOf(cam)}
                  featured={idx === 0}
                  streamUrl={cam.streamUrl}
                  streamUrlHD={cam.streamUrlHD}
                  expanded={expanded === cam.id}
                  onExpand={setExpanded}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="cam-grid" style={{ gridTemplateColumns: GRID_COLS[cols] }}>
            {filtered.map((cam, idx) => (
              <div key={cam.id} className="cam-enter" style={{ animationDelay:`${idx * 30}ms` }}>
                <CameraFeed
                  cam={cam}
                  idx={CAMPUSES.indexOf(cam)}
                  streamUrl={cam.streamUrl}
                  streamUrlHD={cam.streamUrlHD}
                  expanded={expanded === cam.id}
                  onExpand={setExpanded}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="dashboard-footer">
        <span className="dashboard-footer-title">BSU CCTV MONITOR — CAMPUS SECURITY MATRIX</span>
        <div className="footer-right">
          <div className="dashboard-footer-dot" />
          <span className="dashboard-footer-status">
            {online} online · {offline} offline{connecting > 0 ? ` · ${connecting} connecting` : ""} · {alerts} alerts
          </span>
        </div>
      </footer>

      {/* ── Modal ── */}
      {expanded && expandedCam && (
        <div className="cctv-modal-overlay" onClick={() => setExpanded(null)}>
          <div className="cctv-modal-content" onClick={e => e.stopPropagation()}>
            <button className="cctv-modal-close" onClick={() => setExpanded(null)}>✕</button>
            <CameraFeed
              cam={expandedCam}
              idx={CAMPUSES.findIndex(c => c.id === expanded)}
              featured
              streamUrl={expandedCam.streamUrl}
              streamUrlHD={expandedCam.streamUrlHD}
              expanded
              onExpand={() => setExpanded(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}