"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Layers,
  GitBranch,
  FlaskConical,
  BookOpen,
  Split,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Plus,
  Download,
  Upload,
  Save,
  Play,
  Pause,
  Maximize2,
  Check,
  Search,
  LockKeyhole,
  Activity,
  X,
  FileText,
  Network,
  SlidersHorizontal,
  Pencil,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import FactoryScene from "./components/factory-scene";
import LearningStudio from "./components/learning-studio";
import { evidenceFreshness } from "./lib/learning";
import {
  seed,
  LabData,
  REPO,
  LAB,
  labSchema,
  modelChecks,
} from "./lib/lab-data";
import { LEVELS } from "./lib/levels";
const NAV = [
  { id: "atlas", name: "Factory atlas", icon: Box },
  { id: "board", name: "Workboard", icon: GitBranch },
  { id: "validation", name: "Regression & acceptance", icon: FlaskConical },
  { id: "teach", name: "Teaching room", icon: BookOpen },
  { id: "decisions", name: "Decision log", icon: Split },
];
const columns = ["Next", "In progress", "Review", "Retained"];
type Kind = "zones" | "work" | "checks" | "decisions";
function Badge({
  children,
  tone = "",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}
function Source({
  url,
  label = "Source evidence",
}: {
  url: string;
  label?: string;
}) {
  return url ? (
    <a className="source" href={url} target="_blank" rel="noreferrer">
      {label}
      <ArrowUpRight size={13} />
    </a>
  ) : (
    <span className="muted small">Source not attached</span>
  );
}
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose}>
      <header>
        <h2>{title}</h2>
        <button aria-label="Close editor" className="iconbtn" onClick={onClose}>
          <X size={19} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
const fields: Record<Kind, Array<[string, string, string[]?]>> = {
  work: [
    ["title", "Title"],
    [
      "type",
      "Type",
      ["Experiment", "Cleanup", "Pull request", "Documentation"],
    ],
    ["status", "Workboard column", columns],
    ["branch", "Branch / revision"],
    ["detail", "Context and evidence"],
    ["next", "Next action"],
    ["url", "Evidence link (https)"],
  ],
  checks: [
    ["title", "Title"],
    [
      "status",
      "Evidence status",
      ["Needs evidence", "Not run", "Recorded pass", "Failed"],
    ],
    ["scope", "Check scope"],
    ["result", "Observed result"],
    ["date", "Run date (YYYY-MM-DD)"],
    ["revision", "Exact revision"],
    ["command", "Command / reproduction"],
    ["environment", "Environment"],
    ["limit", "What this does not prove"],
    ["url", "Evidence link (https)"],
  ],
  decisions: [
    ["title", "Title"],
    [
      "status",
      "Decision status",
      ["Open", "Bounded decision", "Proposed", "Superseded"],
    ],
    ["context", "Problem / context"],
    ["choice", "Current choice"],
    ["evidence", "Evidence"],
    ["limit", "Limitations"],
    ["risk", "Open risk"],
    ["next", "Next action"],
    ["url", "Evidence link (https)"],
  ],
  zones: [
    ["name", "Zone name"],
    ["short", "Short label"],
    ["code", "Display number"],
    ["group", "Area type", ["material", "production", "support"]],
    [
      "kind",
      "Geometry",
      [
        "dock",
        "racks",
        "weigh",
        "process",
        "lab",
        "pack",
        "utilities",
        "workshop",
        "control",
        "office",
      ],
    ],
    ["x", "Position X"],
    ["z", "Position Z"],
    ["w", "Width"],
    ["d", "Depth"],
    ["assets", "Assets (comma separated)"],
    ["owner", "Operational owner"],
    ["role", "Purpose"],
    ["boundary", "Authority boundary"],
    ["decision", "Operational decision"],
  ],
};
function Editor({
  kind,
  item,
  onClose,
  onSubmit,
}: {
  kind: Kind;
  item: any;
  onClose: () => void;
  onSubmit: (v: any) => string | void;
}) {
  const [draft, setDraft] = useState<any>(
      kind === "zones" ? { ...item, assets: item.assets.join(", ") } : item,
    ),
    [err, setErr] = useState("");
  return (
    <Dialog
      title={
        (item.id ? "Edit " : "Add ") +
        {
          zones: "factory zone",
          work: "work item",
          checks: "evidence record",
          decisions: "design decision",
        }[kind]
      }
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = { ...draft, id: draft.id || crypto.randomUUID() };
          if (kind === "zones") {
            for (const k of ["x", "z", "w", "d"]) v[k] = Number(v[k]);
            v.assets = v.assets
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
          const error = onSubmit(v);
          if (error) setErr(error);
        }}
      >
        <div className="editor-fields">
          {fields[kind].map(([k, label, options]) => (
            <label
              key={k}
              className={
                [
                  "x",
                  "z",
                  "w",
                  "d",
                  "kind",
                  "group",
                  "type",
                  "status",
                ].includes(k)
                  ? "compact"
                  : ""
              }
            >
              {label}
              {options ? (
                <select
                  value={draft[k] || ""}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                >
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : [
                  "detail",
                  "next",
                  "result",
                  "limit",
                  "context",
                  "choice",
                  "evidence",
                  "risk",
                  "role",
                  "boundary",
                  "decision",
                ].includes(k) ? (
                <textarea
                  rows={3}
                  value={draft[k] || ""}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              ) : (
                <input
                  required={["name", "title"].includes(k)}
                  type={
                    k === "url"
                      ? "url"
                      : ["x", "z", "w", "d"].includes(k)
                        ? "number"
                        : "text"
                  }
                  step="any"
                  value={draft[k] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              )}
            </label>
          ))}
        </div>
        {err && (
          <p role="alert" className="error">
            {err}
          </p>
        )}
        <footer>
          <span className="muted small">Apply, then save in this browser.</span>
          <button className="primary" type="submit">
            <Check size={15} />
            Apply changes
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
export default function Lab() {
  const [tab, setTab] = useState("atlas"),
    [data, setData] = useState<LabData>(seed),
    [explorerOpen, setExplorerOpen] = useState(false),
    [revision, setRevision] = useState(0),
    [ready, setReady] = useState(false),
    [dirty, setDirty] = useState(false),
    [saving, setSaving] = useState(false),
    [notice, setNotice] = useState(""),
    [selected, setSelected] = useState("lineA"),
    [layer, setLayer] = useState("Material"),
    [focus, setFocus] = useState("Site"),
    [reset, setReset] = useState(0),
    [scenarioId, setScenarioId] = useState("order"),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [filter, setFilter] = useState("All"),
    [query, setQuery] = useState(""),
    [editor, setEditor] = useState<{ kind: Kind; item: any } | null>(null),
    [results, setResults] = useState<ReturnType<typeof modelChecks> | null>(
      null,
    ),
    [showData, setShowData] = useState(false),
    [jsonText, setJsonText] = useState(""),
    [importError, setImportError] = useState(""),
    [level, setLevel] = useState(0),
    [subscriptions, setSubscriptions] = useState([
      "Historian",
      "MES projection",
    ]),
    [messages, setMessages] = useState<{ n: number; targets: string[] }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null),
    latest = useRef(data),
    serial = useRef(0);
  latest.current = data;
  const zone = data.zones.find((z) => z.id === selected) || data.zones[0],
    scenario =
      data.scenarios.find((s) => s.id === scenarioId) || data.scenarios[0],
    current = scenario.steps[Math.min(step, scenario.steps.length - 1)];
  const STORAGE = "demokit-public-workspace-v1";
  async function load() {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const b = JSON.parse(raw);
        setData(labSchema.parse(b.data));
        setRevision(Number.isSafeInteger(b.revision) ? b.revision : 0);
      }
      setNotice("");
      setDirty(false);
    } catch {
      setNotice(
        "Browser storage is unavailable or its saved data is invalid. The public baseline is loaded; export a copy to keep your work.",
      );
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    load();
    const h = location.hash.slice(1);
    if (NAV.some((n) => n.id === h)) setTab(h);
  }, []);
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    addEventListener("beforeunload", f);
    return () => removeEventListener("beforeunload", f);
  }, [dirty]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        setStep((s) => {
          if (s >= scenario.steps.length - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        }),
      3000,
    );
    return () => clearInterval(t);
  }, [playing, scenarioId, scenario.steps.length]);
  useEffect(() => {
    setSelected(current.zone);
    setFocus("Area");
  }, [playing, step, current.zone]);
  function go(id: string) {
    setTab(id);
    setFilter("All");
    setQuery("");
    history.replaceState(null, "", "#" + id);
  }
  function change(d: LabData) {
    setData(d);
    setResults(null);
    setDirty(true);
    setNotice("");
  }
  async function save() {
    setSaving(true);
    try {
      const valid = labSchema.parse(data),
        raw = localStorage.getItem(STORAGE),
        saved = raw ? JSON.parse(raw) : null;
      if (saved && saved.revision !== revision)
        throw Error(
          "Another tab changed the local workspace. Export your changes, then reload before saving.",
        );
      const next = revision + 1,
        payload = JSON.stringify({ data: valid, revision: next });
      if (payload.length > 750000)
        throw Error(
          "Workspace exceeds 750 KB. Export a copy and reduce it before saving.",
        );
      localStorage.setItem(STORAGE, payload);
      setRevision(next);
      if (latest.current === data) setDirty(false);
      setNotice(
        "Workspace saved in this browser. Revision " +
          next +
          ". Nothing was uploaded.",
      );
    } catch (e) {
      setNotice("Save failed: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  function apply(v: any) {
    const k = editor!.kind,
      arr = data[k] as any[],
      next = {
        ...data,
        [k]: arr.some((x) => x.id === v.id)
          ? arr.map((x) => (x.id === v.id ? v : x))
          : [...arr, v],
      },
      p = labSchema.safeParse(next);
    if (!p.success) return p.error.issues.map((x) => x.message).join("; ");
    change(p.data);
    setEditor(null);
    if (k === "zones") setSelected(v.id);
  }
  function add(k: Kind) {
    const templates: any = {
      work: {
        title: "",
        type: "Experiment",
        status: "Next",
        branch: "Proposed · no branch assigned",
        detail: "",
        next: "",
        url: "",
      },
      checks: {
        title: "",
        status: "Needs evidence",
        scope: "",
        result: "",
        date: "",
        revision: "",
        command: "",
        environment: "",
        limit: "",
        url: "",
      },
      decisions: {
        title: "",
        status: "Open",
        context: "",
        choice: "",
        evidence: "",
        limit: "",
        risk: "",
        next: "",
        url: "",
      },
      zones: {
        name: "",
        short: "New zone",
        code: String(data.zones.length + 1).padStart(2, "0"),
        kind: "process",
        group: "production",
        x: 0,
        z: 30,
        w: 8,
        d: 8,
        role: "",
        owner: "To be defined",
        assets: [],
        systems: [],
        events: [],
        decision: "To be defined",
        boundary: "Proposed zone; not accepted equipment",
      },
    };
    setEditor({ kind: k, item: templates[k] });
  }
  function exportData() {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "demokit-public-workspace.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function importData() {
    try {
      if (jsonText.length > 750000) throw Error("Workspace exceeds 750 KB");
      const p = labSchema.parse(JSON.parse(jsonText));
      change(p);
      setSelected(p.zones[0].id);
      setScenarioId(p.scenarios[0].id);
      setStep(0);
      setPlaying(false);
      setShowData(false);
      setNotice(
        "Workspace imported locally. Review before sharing; save in this browser or export a copy.",
      );
    } catch (e) {
      setImportError("Import rejected: " + (e as Error).message);
    }
  }
  const filteredWork = data.work.filter(
    (w) =>
      (filter === "All" || w.type === filter) &&
      [w.title, w.branch, w.detail]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#atlas" onClick={() => go("atlas")}>
          <span className="brandmark">
            <Box size={23} />
          </span>
          <span>
            DemoKit<small>FACTORY LAB</small>
          </span>
        </a>
        <div className="workspace-label">DEVELOP · EXPLAIN · VERIFY</div>
        <nav aria-label="Main navigation">
          {NAV.map((n) => (
            <button
              key={n.id}
              aria-label={n.name}
              className={tab === n.id ? "active" : ""}
              onClick={() => go(n.id)}
            >
              <n.icon size={18} />
              {n.name}
              {tab === n.id && <i className="navdot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <Network size={27} />
          <strong>People. Data. Machines.</strong>
          <p>
            One operational story.
            <br />
            Several ways to see it.
          </p>
          <a
            href="https://apathyte.github.io/#work"
            target="_blank"
            rel="noreferrer"
          >
            Tim’s public website <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="sidebar-bottom">
          <span className="avatar">TB</span>
          <span>
            Tim Boersma<small>Public teaching lab</small>
          </span>
          <LockKeyhole size={13} />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            DemoKit
            <ChevronRight size={13} />
            <span>{NAV.find((n) => n.id === tab)?.name}</span>
          </div>
          <div className="top-actions">
            <span className="snapshot">
              <i className="statusdot" />
              Open source · synthetic data
            </span>
            <button
              aria-label="Export workspace JSON"
              className="iconbtn"
              onClick={exportData}
            >
              <Download size={17} />
            </button>
            <button
              className="save-btn"
              disabled={!ready || saving || !dirty}
              onClick={save}
            >
              <Save size={14} />
              {saving
                ? "Saving…"
                : dirty
                  ? "Save in browser"
                  : "Local workspace"}
            </button>
          </div>
        </header>
        <main>
          <div className="public-banner">
            <span>
              Open teaching lab · fictional factory · no plant connection
            </span>
            <a
              href={REPO + "/blob/main/demokit/CONTRIBUTING.md"}
              target="_blank"
              rel="noreferrer"
            >
              Contribute on GitHub ↗
            </a>
          </div>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {
                  {
                    atlas: "THE OPERATIONAL MODEL",
                    board: "FROM EXPERIMENT TO BASELINE",
                    validation: "EVIDENCE BEFORE CONFIDENCE",
                    teach: "MAKE THE BOUNDARIES VISIBLE",
                    decisions: "ARCHITECTURE IN THE OPEN",
                  }[tab]
                }
              </div>
              <h1>
                {
                  {
                    atlas: "A factory, made legible.",
                    board: "Build with a clear baseline.",
                    validation: "What have we actually proven?",
                    teach: "Follow the meaning.",
                    decisions: "Keep the reasoning.",
                  }[tab]
                }
              </h1>
              <p>
                {
                  {
                    atlas:
                      "A reusable factory learning environment. Explore a slice, introduce a constraint, and question the response.",
                    board:
                      "Independent experiments, explicit next steps and evidence worth keeping.",
                    validation:
                      "Separate repository checks, simulated behaviour and real-world acceptance.",
                    teach:
                      "From a physical observation to an operational decision.",
                    decisions:
                      "Choices, evidence and unresolved questions travel with the model.",
                  }[tab]
                }
              </p>
            </div>
            {tab !== "teach" && (
              <div className="heading-actions">
                {tab === "atlas" ? (
                  <button
                    onClick={() => {
                      setJsonText(JSON.stringify(data, null, 2));
                      setImportError("");
                      setShowData(true);
                    }}
                  >
                    <SlidersHorizontal size={16} />
                    Model & data
                  </button>
                ) : (
                  <button
                    className="primary"
                    onClick={() =>
                      add(
                        tab === "board"
                          ? "work"
                          : tab === "validation"
                            ? "checks"
                            : "decisions",
                      )
                    }
                  >
                    <Plus size={16} />
                    {tab === "board"
                      ? "Work item"
                      : tab === "validation"
                        ? "Evidence record"
                        : "Decision"}
                  </button>
                )}
              </div>
            )}
          </div>
          {notice && (
            <div
              className={
                "notice " + (notice.includes("saved") ? "success" : "")
              }
              role="status"
            >
              <span>{notice}</span>
              {!ready && <button onClick={load}>Retry loading</button>}
              <button
                aria-label="Dismiss notification"
                className="iconbtn"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {dirty && (
            <div className="unsaved">
              Unsaved local changes · save in this browser or export a copy.
              Nothing is uploaded.
            </div>
          )}
          {tab === "atlas" && (
            <>
              <LearningStudio data={data} />
              <details
                className="model-explorer"
                onToggle={(e) => setExplorerOpen(e.currentTarget.open)}
              >
                <summary>
                  Explore and edit the full factory model · original
                  walkthroughs
                </summary>
                {explorerOpen && (
                  <>
                    <div className="metrics">
                      <div>
                        <span className="metric-icon">
                          <Box size={19} />
                        </span>
                        <strong>
                          {data.zones.length}
                          <small>operational zones</small>
                        </strong>
                      </div>
                      <div>
                        <span className="metric-icon">
                          <Layers size={19} />
                        </span>
                        <strong>
                          5<small>ISA-95 activity levels</small>
                        </strong>
                      </div>
                      <div>
                        <span className="metric-icon">
                          <Split size={19} />
                        </span>
                        <strong>
                          {data.scenarios.length}
                          <small>teaching scenarios</small>
                        </strong>
                      </div>
                      <div>
                        <span className="metric-icon amber">
                          <Activity size={19} />
                        </span>
                        <strong className="textmetric">
                          Synthetic model<small>No live plant connection</small>
                        </strong>
                      </div>
                    </div>
                    <section className="atlas-panel">
                      <div className="panel-toolbar">
                        <div>
                          <i className="purple-dot" />
                          <strong>Factory Atlas</strong>
                          <Badge>Experimental</Badge>
                        </div>
                        <div className="segmented">
                          {["Site", "Area", "Line / assets"].map((f) => (
                            <button
                              key={f}
                              className={focus === f ? "selected" : ""}
                              onClick={() => setFocus(f)}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                        <button
                          className="iconbtn"
                          aria-label="Reset camera"
                          onClick={() => {
                            setFocus("Site");
                            setReset((s) => s + 1);
                          }}
                        >
                          <Maximize2 size={16} />
                        </button>
                      </div>
                      <div className="atlas-body">
                        <div className="map-area">
                          <FactoryScene
                            zones={data.zones}
                            selected={zone.id}
                            onSelect={setSelected}
                            layer={layer}
                            links={
                              layer === "Events"
                                ? data.eventLinks
                                : data.materialLinks
                            }
                            focus={focus}
                            reset={reset}
                          />
                          <div className="map-top">
                            <span className="mono">SYNTHETIC / SITE 01</span>
                            <span className="map-hint">
                              Drag to orbit · scroll to zoom
                            </span>
                          </div>
                          <div className="flow-switch">
                            <span>OVERLAY</span>
                            {["Material", "Events", "None"].map((l) => (
                              <button
                                key={l}
                                className={layer === l ? "selected" : ""}
                                onClick={() => setLayer(l)}
                              >
                                <i
                                  style={{
                                    background:
                                      l === "Material"
                                        ? "#e6b170"
                                        : l === "Events"
                                          ? "#b799ec"
                                          : "#788292",
                                  }}
                                />
                                {l}
                              </button>
                            ))}
                          </div>
                          <div className="map-caption">
                            <span>SCHEMATIC GEOMETRY · THREE.JS</span>
                            <span>Visualisation ≠ physical proof</span>
                          </div>
                        </div>
                        <aside className="inspector">
                          <div className="eyebrow">
                            SELECTED ZONE <span>{zone.code}</span>
                          </div>
                          <select
                            aria-label="Select factory zone"
                            value={zone.id}
                            onChange={(e) => setSelected(e.target.value)}
                          >
                            {data.zones.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.code} · {z.name}
                              </option>
                            ))}
                          </select>
                          <div className="inspect-heading">
                            <h2>{zone.name}</h2>
                            <button
                              aria-label="Edit selected zone"
                              className="iconbtn"
                              onClick={() =>
                                setEditor({ kind: "zones", item: zone })
                              }
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                          <p>{zone.role}</p>
                          <dl>
                            <dt>OPERATIONAL OWNER</dt>
                            <dd>{zone.owner}</dd>
                            <dt>ASSETS / WORK UNITS</dt>
                            <dd className="asset-tags">
                              {zone.assets.map((a) => (
                                <span key={a}>{a}</span>
                              ))}
                            </dd>
                          </dl>
                          <div className="boundary">
                            <span>
                              <LockKeyhole size={13} />
                              AUTHORITY BOUNDARY
                            </span>
                            <p>{zone.boundary}</p>
                          </div>
                          <div className="system-row">
                            {zone.systems.map(([s, l]) => (
                              <span key={s}>
                                <b>L{l}</b>
                                {s}
                              </span>
                            ))}
                          </div>
                          <button
                            className="textbutton"
                            onClick={() => go("teach")}
                          >
                            Explore operational meaning
                            <ChevronRight size={14} />
                          </button>
                        </aside>
                      </div>
                      <div className="hierarchy-bar">
                        <span>Equipment hierarchy</span>
                        <b>Enterprise</b>
                        <ChevronRight size={12} />
                        <b>Site 01</b>
                        <ChevronRight size={12} />
                        <b>{zone.group} area</b>
                        <ChevronRight size={12} />
                        <b>{zone.short}</b>
                        <span className="hierarchy-note">
                          Proposed mapping · zones may span work centres
                        </span>
                      </div>
                    </section>
                    <section className="scenario-panel">
                      <div className="scenario-intro">
                        <div className="eyebrow">GUIDED WALKTHROUGH</div>
                        <select
                          aria-label="Choose teaching scenario"
                          value={scenarioId}
                          onChange={(e) => {
                            setScenarioId(e.target.value);
                            setStep(0);
                            setPlaying(false);
                          }}
                        >
                          {data.scenarios.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                        <p>{scenario.summary}</p>
                        <Badge tone="amber">
                          Synthetic sequence · no runtime actions
                        </Badge>
                      </div>
                      <div className="scenario-content">
                        <div className="scenario-steps">
                          {scenario.steps.map((s, i) => (
                            <button
                              key={i}
                              title={s.title}
                              className={
                                i === step ? "selected" : i < step ? "done" : ""
                              }
                              onClick={() => {
                                setStep(i);
                                setSelected(s.zone);
                                setPlaying(false);
                              }}
                            >
                              <span>{String(i + 1).padStart(2, "0")}</span>
                              <i />
                            </button>
                          ))}
                        </div>
                        <div className="step-detail">
                          <span className="level-pill">L{current.level}</span>
                          <div>
                            <h3>{current.title}</h3>
                            <p>{current.text}</p>
                            <code>{current.event}</code>
                            <span className="step-actor">{current.actor}</span>
                          </div>
                        </div>
                        <div className="play-controls">
                          <button
                            aria-label="Previous scenario step"
                            className="iconbtn"
                            disabled={step === 0}
                            onClick={() => {
                              setStep((s) => s - 1);
                              setSelected(scenario.steps[step - 1].zone);
                              setPlaying(false);
                            }}
                          >
                            <ChevronLeft size={17} />
                          </button>
                          <button
                            className="primary small-btn"
                            onClick={() => {
                              if (step === scenario.steps.length - 1)
                                setStep(0);
                              setPlaying(!playing);
                            }}
                          >
                            {playing ? <Pause size={14} /> : <Play size={14} />}{" "}
                            {playing ? "Pause" : "Play walkthrough"}
                          </button>
                          <button
                            aria-label="Next scenario step"
                            className="iconbtn"
                            disabled={step >= scenario.steps.length - 1}
                            onClick={() => {
                              setStep((s) => s + 1);
                              setSelected(scenario.steps[step + 1].zone);
                              setPlaying(false);
                            }}
                          >
                            <ChevronRight size={17} />
                          </button>
                          <span>
                            {step + 1} / {scenario.steps.length}
                          </span>
                        </div>
                      </div>
                    </section>
                    <div className="lower-grid">
                      <article className="mini-card">
                        <span className="eyebrow">OPEN TEACHING VEHICLE</span>
                        <h3>ISA-95 Factory Atlas</h3>
                        <p>
                          Public synthetic model. Extend the geometry, lessons
                          and evidence through reviewed contributions.
                        </p>
                        <Source url={LAB} label="Source & contributions" />
                      </article>
                      <article className="mini-card">
                        <span className="eyebrow">NEXT DESIGN QUESTION</span>
                        <h3>Where does an event become evidence?</h3>
                        <p>
                          Trace the difference between an observed state, a
                          workflow result and an authorised release.
                        </p>
                        <button
                          className="textbutton"
                          onClick={() => go("teach")}
                        >
                          Enter teaching room
                          <ArrowUpRight size={14} />
                        </button>
                      </article>
                    </div>
                  </>
                )}
              </details>
            </>
          )}
          {tab === "board" && (
            <>
              <div className="repo-strip">
                <span className="repo-icon">
                  <GitBranch size={23} />
                </span>
                <div>
                  <strong>Apathyte / public factory lab</strong>
                  <p>
                    <code>demokit/</code>
                    <span>
                      Manually maintained workboard · no live repository sync
                    </span>
                  </p>
                </div>
                <Source url={REPO} label="Open repository" />
                <Source
                  url={REPO + "/blob/main/demokit/docs/PROJECT_PLAN.md"}
                  label="Project plan"
                />
              </div>
              <div className="filterbar">
                <div className="chips">
                  {[
                    "All",
                    "Experiment",
                    "Cleanup",
                    "Pull request",
                    "Documentation",
                  ].map((f) => (
                    <button
                      key={f}
                      className={filter === f ? "selected" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <label className="search">
                  <Search size={15} />
                  <input
                    aria-label="Search workboard"
                    placeholder="Search branches or work…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="board">
                {columns.map((s, i) => (
                  <section key={s} className="board-column">
                    <h2>
                      <i className={"col-dot c" + i} />
                      {s}
                      <span>
                        {filteredWork.filter((w) => w.status === s).length}
                      </span>
                    </h2>
                    {filteredWork
                      .filter((w) => w.status === s)
                      .map((w) => (
                        <article key={w.id} className="work-card">
                          <div className="card-top">
                            <Badge>{w.type}</Badge>
                            <button
                              aria-label={"Edit " + w.title}
                              className="iconbtn"
                              onClick={() =>
                                setEditor({ kind: "work", item: w })
                              }
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                          <h3>{w.title}</h3>
                          <code>
                            <GitBranch size={12} />
                            {w.branch}
                          </code>
                          <p>{w.detail}</p>
                          <div className="next-action">
                            <span>NEXT ACTION</span>
                            <p>{w.next}</p>
                          </div>
                          <div className="card-bottom">
                            <Source url={w.url} label="Source" />
                            <select
                              aria-label={"Move " + w.title}
                              value={w.status}
                              onChange={(e) =>
                                change({
                                  ...data,
                                  work: data.work.map((v) =>
                                    v.id === w.id
                                      ? { ...v, status: e.target.value as any }
                                      : v,
                                  ),
                                })
                              }
                            >
                              {columns.map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </article>
                      ))}
                    {!filteredWork.some((w) => w.status === s) && (
                      <div className="empty">No matching work items.</div>
                    )}
                  </section>
                ))}
              </div>
              <div className="footnote">
                <LockKeyhole size={15} />
                Manually maintained workboard: proposed branch names are
                examples. Moving a card does not create a branch, merge a PR or
                run a test. Open GitHub for current repository state.
              </div>
            </>
          )}
          {tab === "validation" && (
            <>
              <div className="validation-summary">
                {["Recorded pass", "Needs evidence", "Not run", "Failed"].map(
                  (s, i) => (
                    <button
                      key={s}
                      className={filter === s ? "selected" : ""}
                      onClick={() => setFilter(filter === s ? "All" : s)}
                    >
                      <i className={"col-dot c" + i} />
                      <strong>
                        {data.checks.filter((c) => c.status === s).length}
                      </strong>
                      <span>{s}</span>
                    </button>
                  ),
                )}
              </div>
              <div className="evidence-alert">
                <AlertTriangle size={20} />
                <div>
                  <strong>
                    A pass belongs to its environment and revision.
                  </strong>
                  <p>
                    Only attach public evidence for the exact revision tested.
                    Empty gates remain unproven. Local model checks do not
                    validate a simulation, protocol adapter or machine.
                  </p>
                </div>
              </div>
              <div className="filterbar">
                <h2>Evidence register</h2>
                <div className="heading-actions">
                  <button onClick={() => setFilter("All")}>Show all</button>
                  <button onClick={() => setResults(modelChecks(data))}>
                    <Play size={14} />
                    Run lab model checks
                  </button>
                </div>
              </div>
              {results && (
                <div className="model-checks">
                  <h3>Lab data integrity · executed in this browser</h3>
                  {results.map((c) => (
                    <p key={c.name}>
                      <Badge tone={c.pass ? "green" : "red"}>
                        {c.pass ? "PASS" : "FAIL"}
                      </Badge>
                      <strong>{c.name}</strong>
                      <span>{c.detail}</span>
                    </p>
                  ))}
                  <small>
                    These checks validate this workspace’s data. They do not run
                    repository regression suites.
                  </small>
                </div>
              )}
              <div className="evidence-list">
                {data.checks
                  .filter((c) => filter === "All" || c.status === filter)
                  .map((c) => (
                    <details key={c.id} className="evidence-item">
                      <summary>
                        <span
                          className={
                            "evidence-icon " +
                            (c.status === "Recorded pass" ? "green" : "amber")
                          }
                        >
                          {c.status === "Recorded pass" ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <FlaskConical size={20} />
                          )}
                        </span>
                        <div>
                          <h3>{c.title}</h3>
                          <p>{c.scope}</p>
                        </div>
                        <Badge
                          tone={
                            c.status === "Recorded pass"
                              ? "green"
                              : c.status === "Failed"
                                ? "red"
                                : "amber"
                          }
                        >
                          {c.status}
                        </Badge>
                        <span className="evidence-date">
                          {c.date || "No run"}
                        </span>
                        <ChevronRight size={16} />
                      </summary>
                      <div className="evidence-detail">
                        <h4>{c.result}</h4>
                        <p className="evidence-freshness">
                          {c.date
                            ? evidenceFreshness(c.date)
                            : "No dated evidence"}
                          . A recorded pass does not automatically apply to the
                          current release or local edits.
                        </p>
                        <div className="evidence-grid">
                          {[
                            ["REVISION", c.revision || "Not recorded"],
                            ["ENVIRONMENT", c.environment],
                            ["COMMAND / REPRODUCTION", c.command],
                            ["LIMITATION", c.limit],
                          ].map(([l, v]) => (
                            <div key={l}>
                              <span>{l}</span>
                              <p>{v}</p>
                            </div>
                          ))}
                        </div>
                        <footer>
                          <Source url={c.url} />
                          <button
                            onClick={() =>
                              setEditor({ kind: "checks", item: c })
                            }
                          >
                            <Pencil size={14} />
                            Update record
                          </button>
                        </footer>
                      </div>
                    </details>
                  ))}
              </div>
              <div className="acceptance-strip">
                <h3>Acceptance ladder</h3>
                <p>
                  A · Data and schema → B · Browser → C · Adapter and simulation
                  → D · Physical equipment
                </p>
                <span>
                  Each gate needs its own evidence. Earlier gates do not imply
                  later gates passed.
                </span>
                <Source
                  url={REPO + "/blob/main/demokit/docs/ACCEPTANCE.md"}
                  label="Public acceptance plan"
                />
              </div>
            </>
          )}
          {tab === "teach" && (
            <>
              <div className="teaching-grid">
                <section className="teaching-levels">
                  <div className="section-label">01 / ACTIVITY & AUTHORITY</div>
                  <h2>Five levels. Different decisions.</h2>
                  <p>
                    ISA-95 activity levels describe functions. They are not a
                    network security architecture or the equipment hierarchy.
                  </p>
                  {[...LEVELS].reverse().map((l) => (
                    <button
                      key={l.id}
                      className={level === l.id ? "selected" : ""}
                      onClick={() => setLevel(l.id)}
                    >
                      <span style={{ color: l.color }}>L{l.id}</span>
                      <div>
                        <strong>{l.title}</strong>
                        <small>{l.desc}</small>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </section>
                <section className="teaching-focus">
                  <div className="section-label">THE OPERATIONAL QUESTION</div>
                  <span className="giant-level">L{level}</span>
                  <h2>
                    {
                      [
                        "What physically happened?",
                        "What did the device observe?",
                        "What may the controller do?",
                        "What work is authorised?",
                        "What has the business committed?",
                      ][level]
                    }
                  </h2>
                  <p>
                    {
                      [
                        "A box moved, a vessel heated, material changed. An animated model represents a process; actual movement needs independently observed evidence.",
                        "A scanner supplies an identity. A sensor reports a value, timestamp and quality. Neither alone establishes the business meaning.",
                        "PLC/DCS logic controls equipment within engineered limits. A dashboard displaying the same state does not inherit command authority.",
                        "MES/MOM coordinates execution, traceability and resources. Quality release belongs to the designated quality authority. Equipment completion is only part of the evidence.",
                        "ERP communicates demand and records business transactions. A released order is a commitment that still needs feasible planning and verified execution.",
                      ][level]
                    }
                  </p>
                  <div className="boundary">
                    <span>
                      <LockKeyhole size={14} />
                      KEEP THE DISTINCTION
                    </span>
                    <p>
                      {
                        [
                          "Animation ≠ measurement",
                          "Observation ≠ interpretation",
                          "Visibility ≠ control authority",
                          "Equipment event ≠ completed order",
                          "Planning change ≠ executable instruction",
                        ][level]
                      }
                    </p>
                  </div>
                </section>
              </div>
              <section className="pubsub-panel">
                <div className="section-label">
                  02 / PUBLISH ONCE · INTERPRET WITH CONTEXT
                </div>
                <div className="section-heading">
                  <div>
                    <h2>Follow an event across the boundary.</h2>
                    <p>
                      Toggle consumers, then publish a synthetic event to
                      inspect delivery.
                    </p>
                  </div>
                  <Badge tone="amber">In-browser teaching model</Badge>
                </div>
                <div className="pubsub-flow">
                  <div className="flow-node">
                    <Activity size={25} />
                    <strong>Synthetic publisher</strong>
                    <small>Owns state & records</small>
                    <code>teaching/site-01/line-a/state</code>
                  </div>
                  <span className="flow-arrow">→</span>
                  <div className="flow-node broker">
                    <Network size={28} />
                    <strong>MQTT broker</strong>
                    <small>Routes topic messages</small>
                    <Badge>Transport ≠ authority</Badge>
                  </div>
                  <span className="flow-arrow">→</span>
                  <div className="consumers">
                    {["Historian", "MES projection", "Three.js viewer"].map(
                      (s) => (
                        <label
                          key={s}
                          className={
                            subscriptions.includes(s) ? "selected" : ""
                          }
                        >
                          <input
                            type="checkbox"
                            checked={subscriptions.includes(s)}
                            onChange={() =>
                              setSubscriptions((v) =>
                                v.includes(s)
                                  ? v.filter((x) => x !== s)
                                  : [...v, s],
                              )
                            }
                          />
                          {s}
                          <small>
                            {s === "Historian"
                              ? "Retains observations"
                              : s === "MES projection"
                                ? "Adds execution context"
                                : "Presents state"}
                          </small>
                        </label>
                      ),
                    )}
                  </div>
                </div>
                <div className="publish-line">
                  <button
                    className="primary"
                    onClick={() => {
                      serial.current++;
                      setMessages((v) =>
                        [
                          { n: serial.current, targets: [...subscriptions] },
                          ...v,
                        ].slice(0, 5),
                      );
                    }}
                  >
                    <Play size={14} />
                    Publish teaching event
                  </button>
                  <p>
                    No broker connection is opened. Consumer roles are
                    illustrative. No message leaves this browser.
                  </p>
                </div>
                <div className="event-log" aria-live="polite">
                  {messages.length ? (
                    messages.map((m) => (
                      <div key={m.n}>
                        <span>#{String(m.n).padStart(3, "0")}</span>
                        <code>operation.state.changed</code>
                        <span>
                          {m.targets.length
                            ? m.targets.join(" · ")
                            : "No subscribed consumers"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>
                      Publish an event to inspect delivery. Subscribing gives
                      visibility, not permission to act.
                    </p>
                  )}
                </div>
              </section>
              <div className="lower-grid">
                <article className="mini-card">
                  <span className="eyebrow">03 / EQUIPMENT MODEL</span>
                  <h3>Hierarchy is not a control path.</h3>
                  <p>
                    Enterprise → site → area → work centre → work unit gives
                    equipment context. Material routes cross areas and use
                    shared resources. Keep routing and ownership explicit.
                  </p>
                </article>
                <article className="mini-card">
                  <span className="eyebrow">04 / SYSTEM BOUNDARY</span>
                  <h3>Observation, intent, decision, action.</h3>
                  <p>
                    The system responsible for an operation owns its authorised
                    state changes. A viewer can describe an observation; it
                    cannot turn it into an approved result. Integration needs an
                    explicit contract.
                  </p>
                  <Source
                    url={REPO + "/blob/main/demokit/docs/BOUNDARIES.md"}
                    label="Public system boundaries"
                  />
                </article>
              </div>
            </>
          )}
          {tab === "decisions" && (
            <>
              <div className="decision-intro">
                <span>
                  <FileText size={20} />
                  Living architecture record
                </span>
                <p>
                  A decision can be useful and bounded. Keep the untested part
                  visible.
                </p>
              </div>
              <div className="decision-list">
                {data.decisions.map((d, i) => (
                  <article key={d.id} className="decision-card">
                    <div className="decision-top">
                      <span className="decision-number">
                        ADR / {String(i + 1).padStart(3, "0")}
                      </span>
                      <Badge
                        tone={
                          d.status === "Bounded decision" ? "green" : "amber"
                        }
                      >
                        {d.status}
                      </Badge>
                      <button
                        aria-label={"Edit " + d.title}
                        className="iconbtn"
                        onClick={() =>
                          setEditor({ kind: "decisions", item: d })
                        }
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                    <h2>{d.title}</h2>
                    <p className="decision-context">{d.context}</p>
                    <div className="decision-choice">
                      <span>CURRENT CHOICE</span>
                      <p>{d.choice}</p>
                    </div>
                    <div className="decision-columns">
                      <div>
                        <h4>Evidence</h4>
                        <p>{d.evidence}</p>
                        <Source url={d.url} />
                      </div>
                      <div>
                        <h4>Limitations</h4>
                        <p>{d.limit}</p>
                      </div>
                      <div>
                        <h4>Open risk</h4>
                        <p>{d.risk}</p>
                      </div>
                    </div>
                    <div className="decision-next">
                      <ArrowUpRight size={17} />
                      <strong>Next action</strong>
                      <p>{d.next}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>Independent project · DemoKit / Factory Lab</span>
            <a href="./LICENSE">MIT licence</a>
            <a href="./THIRD_PARTY_NOTICES.txt">Third-party notices</a>
            <span>
              Synthetic public baseline · browser-local edits ·{" "}
              {ready ? "revision " + revision : "loading saved state"}
            </span>
            <a
              href="https://apathyte.github.io/"
              target="_blank"
              rel="noreferrer"
            >
              People · Data · Machines
              <ArrowUpRight size={12} />
            </a>
          </footer>
        </main>
      </div>
      {editor && (
        <Editor
          kind={editor.kind}
          item={editor.item}
          onClose={() => setEditor(null)}
          onSubmit={apply}
        />
      )}
      {showData && (
        <Dialog
          title="Model & workspace data"
          onClose={() => setShowData(false)}
        >
          <p className="dialog-intro">
            Edit a local copy of the public baseline. JSON includes zones,
            flows, scenarios, work items, checks and decisions. Saves stay in
            this browser; export a backup. Review every field before sharing a
            file or opening a pull request.
          </p>
          <div className="data-actions">
            <button
              onClick={() => {
                setShowData(false);
                add("zones");
              }}
            >
              <Plus size={16} />
              Add factory zone
            </button>
            <button onClick={exportData}>
              <Download size={16} />
              Export JSON
            </button>
            <button onClick={() => fileRef.current?.click()}>
              <Upload size={16} />
              Import file
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".json,application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 750000) {
                  setImportError("File exceeds 750 KB");
                  return;
                }
                setJsonText(await f.text());
              }
            }}
          />
          <label className="json-label">
            Workspace JSON
            <span>Review before applying · replaces the current workspace</span>
            <textarea
              aria-label="Workspace JSON"
              className="json-editor"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </label>
          {importError && (
            <p className="error" role="alert">
              {importError}
            </p>
          )}
          <footer>
            <span className="muted small">
              Validated schema · unknown endpoints rejected
            </span>
            <button className="primary" onClick={importData}>
              Apply workspace JSON
            </button>
          </footer>
        </Dialog>
      )}
    </div>
  );
}
