import "./Dashboard.css";
import "./CameraFeed.css";
import { useState, useEffect } from "react";
import bsuLogo from "../assets/bsu-logo.png";
import CameraFeed, { type Campus } from "./CameraFeed";

// ── Re-exports ─────────────────────────────────────────────────────────────
export type { Campus };

type FilterType = "all" | "online" | "offline";
type ColCount   = 2 | 3 | 4;
type LayoutMode = "matrix" | "uniform";
type NavPage    = "dashboard" | "alerts" | "cameras" | "settings";

// ── Camera data ────────────────────────────────────────────────────────────
// Fill streamUrl / streamUrlHD once your MediaMTX/FFmpeg server is running.
// Example: streamUrl: "http://192.168.1.10:8888/cam-01/index.m3u8"
const CAMPUSES: Campus[] = [
  { id:"CAM-01", name:"Main Campus",           location:"Administration Block",  status:"online",     motion:true,  fps:30, signal:95, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-02", name:"Alangilan Campus",       location:"Engineering Building",  status:"online",     motion:false, fps:30, signal:88, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-03", name:"ARASOF-Nasugbu",         location:"Science Complex",       status:"online",     motion:true,  fps:24, signal:76, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-04", name:"JPLPC-Malvar",           location:"Library & Research",    status:"offline",    motion:false, fps:0,  signal:0,  streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-05", name:"Lipa Campus",            location:"Student Center",        status:"online",     motion:false, fps:30, signal:91, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-06", name:"Balayan Campus",         location:"IT & Innovation Hub",   status:"online",     motion:true,  fps:30, signal:84, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-07", name:"Lemery Campus",          location:"Health Sciences",       status:"online",     motion:false, fps:24, signal:97, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-08", name:"Lobo Campus",            location:"Creative Arts Bldg",    status:"offline",    motion:false, fps:0,  signal:0,  streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-09", name:"San Juan Campus",        location:"Gymnasium & Courts",    status:"online",     motion:false, fps:30, signal:80, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-10", name:"Rosario Campus",         location:"Commerce Building",     status:"online",     motion:false, fps:30, signal:93, streamUrl:undefined, streamUrlHD:undefined },
  { id:"CAM-11", name:"Mabini Campus",          location:"Extension Facilities",  status:"connecting", motion:false, fps:24, signal:72, streamUrl:undefined, streamUrlHD:undefined },
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

// ── SVG Icon helpers ───────────────────────────────────────────────────────
const Icon = {
  grid:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  bell:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  camera:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  search:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  matrixLayout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="10" height="14" rx="1"/>
      <rect x="14" y="2" width="8" height="6" rx="1"/>
      <rect x="14" y="10" width="8" height="6" rx="1"/>
      <rect x="2" y="18" width="20" height="4" rx="1"/>
    </svg>
  ),
};

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
        {time.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"2-digit", year:"numeric" })}
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  accentBg: string;
  trend?: string;
  trendColor?: "green" | "red" | "amber";
  cardAccent?: string;
}
function StatCard({ icon, label, value, accentBg, trend, trendColor = "green", cardAccent }: StatCardProps) {
  return (
    <div className="stat-card" style={{ '--card-accent': cardAccent } as React.CSSProperties}>
      <div className="stat-icon-wrap" style={{ background: accentBg }}>{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && <div className={`stat-trend ${trendColor}`}>{trend}</div>}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  alertCount: number;
  logoSrc: string;
}
function Sidebar({ activePage, onNavigate, alertCount, logoSrc }: SidebarProps) {
  const NAV: { id: NavPage; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "dashboard", icon: Icon.grid,     label: "Dashboard" },
    { id: "alerts",    icon: Icon.bell,     label: "Alerts", badge: alertCount > 0 ? alertCount : undefined },
    { id: "cameras",   icon: Icon.camera,   label: "Cameras" },
  ];
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo-wrap">
        <img src={logoSrc} alt="BSU Logo" />
      </div>
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar-nav-item${activePage === item.id ? " active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
            <span className="nav-tooltip">{item.label}</span>
          </button>
        ))}
        <div className="sidebar-divider" />
      </nav>
      <div className="sidebar-bottom">
        <button
          id="nav-settings"
          className={`sidebar-nav-item${activePage === "settings" ? " active" : ""}`}
          onClick={() => onNavigate("settings")}
        >
          {Icon.settings}
          <span className="nav-tooltip">Settings</span>
        </button>
      </div>
    </aside>
  );
}

// ── Health bars ────────────────────────────────────────────────────────────
function HealthBars({ online, total }: { online: number; total: number }) {
  const pct = Math.round((online / total) * 100);
  const netPct = 82; // simulated
  return (
    <div className="header-health">
      <div className="health-item">
        <span className="health-label">UPTIME</span>
        <div className="health-bar-track"><div className="health-bar-fill green" style={{ width: `${pct}%` }} /></div>
        <span className="health-value">{pct}%</span>
      </div>
      <div className="health-item">
        <span className="health-label">NETWORK</span>
        <div className="health-bar-track"><div className="health-bar-fill cyan" style={{ width: `${netPct}%` }} /></div>
        <span className="health-value">{netPct}%</span>
      </div>
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
  const [navPage,  setNavPage]  = useState<NavPage>("dashboard");

  const online     = CAMPUSES.filter(c => c.status === "online").length;
  const offline    = CAMPUSES.filter(c => c.status === "offline").length;
  const connecting = CAMPUSES.filter(c => c.status === "connecting").length;
  const alerts     = CAMPUSES.filter(c => c.motion && c.status === "online").length;

  const filtered = CAMPUSES.filter(cam => {
    const q = search.toLowerCase();
    const matchSearch =
      cam.name.toLowerCase().includes(q) ||
      cam.location.toLowerCase().includes(q) ||
      cam.id.toLowerCase().includes(q);
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

  const expandedCam = CAMPUSES.find(c => c.id === expanded);

  const FILTERS: [FilterType, string, number][] = [
    ["all",     "All",     CAMPUSES.length],
    ["online",  "Online",  online],
    ["offline", "Offline", offline],
  ];

  return (
    <div className="dashboard-root">
      {/* ── Sidebar ── */}
      <Sidebar
        activePage={navPage}
        onNavigate={setNavPage}
        alertCount={alerts}
        logoSrc={bsuLogo}
      />

      {/* ── Main area ── */}
      <div className="dashboard-main-area">

        {/* ── Header ── */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <div>
              <div className="dashboard-header-title-main">BSU Security Matrix</div>
              <div className="dashboard-header-title-sub">Real-time campus monitor · v2.1</div>
            </div>
          </div>

          <HealthBars online={online} total={CAMPUSES.length} />

          <div className="status-pill">
            <div className="status-pill-dot" />
            <span className="status-pill-label">ALL SYSTEMS ACTIVE</span>
          </div>

          <LiveClock />
        </header>

        {/* ── Stat cards ── */}
        <div className="stat-grid">
          <StatCard
            icon="🎥" label="Total Cameras" value={CAMPUSES.length}
            accentBg="rgba(56,189,248,0.1)"  cardAccent="rgba(56,189,248,0.05)"
            trend="11 feeds" trendColor="green"
          />
          <StatCard
            icon="✅" label="Online" value={online}
            accentBg="rgba(16,185,129,0.1)" cardAccent="rgba(16,185,129,0.05)"
            trend={`${Math.round((online/CAMPUSES.length)*100)}% uptime`} trendColor="green"
          />
          <StatCard
            icon="🔴" label="Offline" value={offline}
            accentBg="rgba(239,68,68,0.1)"  cardAccent="rgba(239,68,68,0.05)"
            trend={offline > 0 ? `${offline} down` : "All clear"} trendColor={offline > 0 ? "red" : "green"}
          />
          <StatCard
            icon="⚡" label="Motion Alerts" value={alerts}
            accentBg="rgba(245,158,11,0.1)" cardAccent="rgba(245,158,11,0.05)"
            trend={alerts > 0 ? "Active" : "Clear"} trendColor={alerts > 0 ? "amber" : "green"}
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="dashboard-toolbar">
          <div className="dashboard-toolbar-search">
            {Icon.search}
            <input
              id="cam-search"
              type="text"
              placeholder="Search campus, location, ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dashboard-toolbar-search-input"
            />
          </div>

          <div className="dashboard-toolbar-filters">
            {FILTERS.map(([val, lbl, count]) => (
              <button key={val} id={`filter-${val}`} onClick={() => setFilter(val)}
                className={`dashboard-toolbar-filter-btn${filter === val ? " active" : ""}`}>
                {lbl.toUpperCase()}
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
              {Icon.matrixLayout}
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

        {/* ── Grid ── */}
        <div className="dashboard-content">
          <div className="content-header">
            <span className="content-count">
              Showing {filtered.length} of {CAMPUSES.length} cameras
            </span>
            {layout === "matrix" && (
              <span className="content-tag content-tag-matrix">SECURITY MATRIX</span>
            )}
            {filter !== "all" && (
              <span className="content-tag content-tag-filter">{filter}</span>
            )}
            {connecting > 0 && (
              <span className="content-tag" style={{ background:"rgba(245,158,11,0.08)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.2)" }}>
                {connecting} syncing
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="dashboard-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p className="dashboard-empty-title">No cameras found</p>
              <p className="dashboard-empty-desc">Try adjusting your search or filter</p>
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
                <div key={cam.id} className="cam-enter" style={{ animationDelay: `${idx * 35}ms` }}>
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
          <span className="dashboard-footer-title">BSU CCTV MONITOR v2.1 — CAMPUS SECURITY MATRIX</span>
          <div className="footer-right">
            <div className="dashboard-footer-dot" />
            <span className="dashboard-footer-status">
              {online} online · {offline} offline · {connecting > 0 ? `${connecting} connecting · ` : ""}{alerts} alerts
            </span>
          </div>
        </footer>
      </div>

      {/* ── Expanded modal ── */}
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