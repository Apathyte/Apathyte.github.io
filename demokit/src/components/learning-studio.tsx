import { useEffect, useMemo, useState } from "react";
import FactoryScene from "./factory-scene";
import type { LabData } from "../lib/schema";
import rawLessons from "../lib/lessons.json";
import {
  availableLesson,
  AUTHORITY_LINKS,
  catalogueSchema,
  comparison,
  initialLessonState,
  presentationSchema,
  previewSlice,
  STAGES,
  transition,
  VIEWS,
} from "../lib/learning";
import type { LessonAction } from "../lib/learning";
const catalogue = catalogueSchema.parse(rawLessons);
const PREFS = "demokit-learning-presentation-v1";
const legend: Record<string, string> = {
  Material: "Solid amber arrows · movement of identified material.",
  Events:
    "Dashed cyan arrows · observations and state information; no permission is implied.",
  Authority:
    "Dotted violet arrows · decision or approval relationships, not network routes.",
  None: "Flows hidden; zone selection and boundary register remain available.",
};
export default function LearningStudio({ data }: { data: LabData }) {
  const [lessonId, setLessonId] = useState("shortage"),
    [state, setState] = useState(initialLessonState),
    [view, setView] = useState<string>(VIEWS[0]),
    [scope, setScope] = useState("Lesson slice"),
    [layer, setLayer] = useState("Material"),
    [selected, setSelected] = useState("lineA"),
    [follow, setFollow] = useState(true),
    [focus, setFocus] = useState("Area"),
    [reset, setReset] = useState(0),
    [notes, setNotes] = useState(false),
    [present, setPresent] = useState(false),
    [loaded, setLoaded] = useState(false),
    [notice, setNotice] = useState(""),
    [proposal, setProposal] = useState(""),
    [preview, setPreview] = useState<ReturnType<typeof previewSlice> | null>(
      null,
    ),
    [proposalError, setProposalError] = useState("");
  const lesson =
    catalogue.lessons.find((l) => l.id === lessonId) || catalogue.lessons[0];
  const ids = useMemo(() => data.zones.map((z) => z.id), [data.zones]);
  const activeIds = useMemo(
    () => (scope === "Whole site" ? ids : lesson.slice),
    [scope, ids, lesson],
  );
  const shownZones = useMemo(
    () => data.zones.filter((z) => activeIds.includes(z.id)),
    [data.zones, activeIds],
  );
  const allLinks = useMemo(
    () =>
      layer === "Events"
        ? data.eventLinks
        : layer === "Authority"
          ? AUTHORITY_LINKS.filter(
              ([a, b]) => ids.includes(a) && ids.includes(b),
            )
          : data.materialLinks,
    [layer, data.eventLinks, data.materialLinks, ids],
  );
  const links = useMemo(
    () =>
      allLinks.filter(
        ([a, b]) => activeIds.includes(a) && activeIds.includes(b),
      ),
    [allLinks, activeIds],
  );
  const boundaries = useMemo(
    () =>
      [
        ...data.materialLinks.map(([a, b]) => ({ a, b, kind: "Material" })),
        ...data.eventLinks.map(([a, b]) => ({ a, b, kind: "Events" })),
        ...[
          ["utilities", "lineA"],
          ["utilities", "lineB"],
        ]
          .filter(([a, b]) => ids.includes(a) && ids.includes(b))
          .map(([a, b]) => ({ a, b, kind: "Shared resource" })),
        ...AUTHORITY_LINKS.filter(
          ([a, b]) => ids.includes(a) && ids.includes(b),
        ).map(([a, b]) => ({ a, b, kind: "Authority" })),
      ].filter(({ a, b }) => activeIds.includes(a) !== activeIds.includes(b)),
    [data.materialLinks, data.eventLinks, ids, activeIds],
  );
  const choice = lesson.choices.find((c) => c.id === state.choice),
    compared = comparison(lesson, view, state),
    stageZone = lesson.zones[state.stage];
  const blockedZone = compared.blocked
    ? lesson.id === "hold"
      ? "packing"
      : lesson.zones[2]
    : "";
  const name = (id: string) => data.zones.find((z) => z.id === id)?.short || id;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS);
      if (raw) {
        const p = presentationSchema.parse(JSON.parse(raw));
        if (catalogue.lessons.some((l) => l.id === p.lessonId))
          setLessonId(p.lessonId);
        setScope(p.scope);
        setView(p.view);
        setFollow(p.follow);
        setNotes(p.notes);
      }
    } catch {
      setNotice(
        "Presentation preferences could not be loaded. Model workspace unchanged.",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        PREFS,
        JSON.stringify({
          schemaVersion: 1,
          lessonId,
          scope,
          view,
          follow,
          notes,
        }),
      );
    } catch {
      setNotice("Presentation preferences could not be saved in this browser.");
    }
  }, [loaded, lessonId, scope, view, follow, notes]);
  useEffect(() => {
    if (follow) {
      setSelected(stageZone);
      setFocus("Area");
    } else if (!activeIds.includes(selected)) {
      setSelected(stageZone);
    }
  }, [stageZone, follow, activeIds]);
  useEffect(() => {
    document.body.classList.toggle("lesson-presenting", present);
    return () => document.body.classList.remove("lesson-presenting");
  }, [present]);
  function act(action: LessonAction) {
    const next = transition(lesson, state, action);
    setState(next);
    if (action.type !== "choose")
      setView(
        next.stage < 2 ? VIEWS[0] : next.stage >= 4 ? VIEWS[2] : VIEWS[1],
      );
  }
  function chooseLesson(id: string) {
    setLessonId(id);
    setState(initialLessonState());
    setView(VIEWS[0]);
  }
  function sampleProposal() {
    setProposal(
      JSON.stringify(
        {
          schemaVersion: 1,
          kind: "factory-slice-proposal",
          title: "Fictional preparation slice",
          provenance: "Original synthetic exercise",
          zones: [
            { id: "prep", label: "Preparation", mapsTo: "dosing" },
            { id: "review", label: "Quality review", mapsTo: "quality" },
          ],
          boundaries: [
            {
              from: "review",
              to: "prep",
              kind: "Authority",
              meaning: "Eligibility approval before addition",
            },
          ],
        },
        null,
        2,
      ),
    );
    setPreview(null);
    setProposalError("");
  }
  return (
    <section
      className={"learning-studio" + (present ? " is-presenting" : "")}
      aria-label="Interactive factory lesson"
    >
      <div className="lesson-topline">
        <div>
          <span className="eyebrow">
            LEARN THE OPERATION · QUESTION THE ASSUMPTIONS
          </span>
          <p>A line, a department, or a site. The lesson sets the boundary.</p>
        </div>
        <button onClick={() => setPresent(!present)}>
          {present ? "Exit presentation" : "Present this lesson"}
        </button>
      </div>
      <div className="lesson-controls">
        <label>
          Choose an operational question
          <select
            aria-label="Choose an operational question"
            value={lessonId}
            onChange={(e) => chooseLesson(e.target.value)}
          >
            {catalogue.lessons.map((l) => (
              <option
                key={l.id}
                value={l.id}
                disabled={!availableLesson(l, ids)}
              >
                {l.title}
                {availableLesson(l, ids) ? "" : " · mappings missing"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Scope
          <select
            aria-label="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option>Lesson slice</option>
            <option>Whole site</option>
          </select>
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={notes}
            onChange={(e) => setNotes(e.target.checked)}
          />
          Facilitator notes
        </label>
      </div>
      {notice && <p role="status">{notice}</p>}
      {!availableLesson(lesson, ids) ? (
        <p className="notice">
          This saved model lacks zones required by the selected lesson. Your
          workspace has not been replaced. Select a compatible lesson or update
          the model mapping.
        </p>
      ) : (
        <>
          <div
            className="comparison-bar"
            role="group"
            aria-label="Compare the same factory slice"
          >
            {VIEWS.map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
            <span>Same geometry · different assumptions</span>
          </div>
          <div className="learning-grid">
            <div className="learning-model">
              <div className="model-heading">
                <span>
                  SITE 01 /{" "}
                  {scope === "Whole site" ? "ALL ZONES" : "SELECTED SLICE"}
                </span>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={follow}
                    onChange={(e) => setFollow(e.target.checked)}
                  />
                  Follow lesson
                </label>
                <button
                  onClick={() => {
                    setFollow(false);
                    setFocus("Site");
                    setReset((x) => x + 1);
                  }}
                >
                  Overview
                </button>
              </div>
              <div className="learning-map">
                <FactoryScene
                  zones={shownZones}
                  selected={selected}
                  onSelect={(id) => {
                    setSelected(id);
                    setFollow(false);
                  }}
                  layer={layer}
                  links={links}
                  focus={focus}
                  reset={reset}
                  blockedZone={blockedZone}
                />
              </div>
              <div
                className={
                  "comparison-state " + (compared.blocked ? "constrained" : "")
                }
                aria-live="polite"
              >
                <strong>{compared.label}</strong>
                <p>{compared.summary}</p>
              </div>
              <div className="learning-map-controls">
                <label>
                  Inspect zone
                  <select
                    aria-label="Inspect zone"
                    value={
                      shownZones.some((z) => z.id === selected)
                        ? selected
                        : shownZones[0]?.id
                    }
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setFollow(false);
                      setFocus("Area");
                    }}
                  >
                    {shownZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.short}
                      </option>
                    ))}
                  </select>
                </label>
                <div
                  className="layer-choices"
                  role="group"
                  aria-label="Relationship overlay"
                >
                  {["Material", "Events", "Authority", "None"].map((l) => (
                    <button
                      key={l}
                      aria-pressed={layer === l}
                      onClick={() => setLayer(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <p className="flow-legend">
                <span className={"line-key " + layer.toLowerCase()} />
                {legend[layer]}
                {blockedZone && layer === "Material"
                  ? " Red dashed handovers into " +
                    name(blockedZone) +
                    " are blocked in this illustration."
                  : ""}
              </p>
              {layer !== "None" && (
                <details className="flow-register">
                  <summary>
                    Read {layer.toLowerCase()} connections ({links.length})
                  </summary>
                  <ul>
                    {links.map(([a, b], i) => (
                      <li key={i}>
                        {name(a)} → {name(b)}
                        {layer === "Material" && b === blockedZone
                          ? " · blocked"
                          : ""}
                      </li>
                    ))}
                  </ul>
                  <p>
                    Illustrative routing. Validate the contract and owner before
                    applying it to an operation.
                  </p>
                </details>
              )}
            </div>
            <article className="lesson-paper" aria-labelledby="lesson-title">
              <div className="lesson-stage-label">
                {String(state.stage + 1).padStart(2, "0")} / 06 ·{" "}
                {STAGES[state.stage]}
              </div>
              <div className="stage-track" aria-hidden="true">
                {STAGES.map((s, i) => (
                  <i key={s} className={i <= state.stage ? "reached" : ""} />
                ))}
              </div>
              <h2 id="lesson-title">{lesson.title}</h2>
              <p className="lesson-question">{lesson.question}</p>
              <div className="lesson-copy" aria-live="polite">
                {state.stage === 0 && (
                  <>
                    <h3>The situation</h3>
                    <p>{lesson.situation}</p>
                    <aside>{lesson.assumption}</aside>
                  </>
                )}
                {state.stage === 1 && (
                  <>
                    <h3>What the reference assumes</h3>
                    <p>{lesson.reference}</p>
                    <aside>
                      A teaching baseline, not a perfect ISA-95 factory.
                    </aside>
                  </>
                )}
                {state.stage === 2 && (
                  <>
                    <h3>Now the flow breaks.</h3>
                    <p>{lesson.disruption}</p>
                    <code>{lesson.signal}</code>
                    <aside>
                      An event exposes a condition. It does not authorise a
                      response.
                    </aside>
                  </>
                )}
                {state.stage === 3 && (
                  <>
                    <h3>Choose a response</h3>
                    <p>{lesson.owner}</p>
                    <div className="response-choices">
                      {lesson.choices.map((c) => (
                        <button
                          key={c.id}
                          aria-pressed={state.choice === c.id}
                          onClick={() => act({ type: "choose", id: c.id })}
                        >
                          <strong>{c.title}</strong>
                          <span>{c.action}</span>
                        </button>
                      ))}
                    </div>
                    {!choice && (
                      <p className="choice-help">
                        Select a response to continue.
                      </p>
                    )}
                  </>
                )}
                {state.stage === 4 && choice && (
                  <>
                    <h3>{choice.title}</h3>
                    <span
                      className={
                        "verdict " +
                        (choice.verdict === "Unacceptable shortcut"
                          ? "rejected"
                          : "")
                      }
                    >
                      {choice.verdict}
                    </span>
                    <dl className="consequence-list">
                      {[
                        ["Material", choice.material],
                        ["Information", choice.information],
                        [
                          "People & authority",
                          choice.people + " " + choice.authority,
                        ],
                        ["Residual risk", choice.risk],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
                {state.stage === 5 && (
                  <>
                    <h3>What would make the claim credible?</h3>
                    <ul>
                      {lesson.evidence.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                    <h3>Discuss before concluding</h3>
                    <ul>
                      {lesson.prompts.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <aside>
                      No operational evidence is collected here. These are
                      requirements for a future test.
                    </aside>
                  </>
                )}
              </div>
              <div className="lesson-navigation">
                <button
                  disabled={state.stage === 0}
                  onClick={() => act({ type: "back" })}
                >
                  Back
                </button>
                <span>{STAGES[state.stage]}</span>
                {state.stage < 5 ? (
                  <button
                    className="lesson-next"
                    disabled={state.stage === 3 && !choice}
                    onClick={() => act({ type: "next" })}
                  >
                    {state.stage === 1
                      ? "Introduce disruption"
                      : state.stage === 3
                        ? "See consequences"
                        : "Next"}
                  </button>
                ) : (
                  <button
                    className="lesson-next"
                    onClick={() => act({ type: "reset" })}
                  >
                    Restart lesson
                  </button>
                )}
              </div>
              <div className="lesson-secondary">
                <button onClick={() => act({ type: "reset" })}>
                  Reset exercise
                </button>
                {state.stage < 2 && (
                  <button onClick={() => act({ type: "disrupt" })}>
                    Jump to disruption
                  </button>
                )}
              </div>
              <p className="simulation-note">
                Scripted teaching branches. No plant commands, physical
                simulation or predicted savings.
              </p>
            </article>
          </div>
          {notes && (
            <aside className="facilitator-panel">
              <span className="eyebrow">FACILITATOR NOTES</span>
              <p>{lesson.facilitator}</p>
              <ul>
                {lesson.prompts.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </aside>
          )}
          <details className="boundary-register">
            <summary>
              What sits outside this slice? · {boundaries.length} boundary
              connections
            </summary>
            <p>
              A selection changes the teaching boundary, not the dependencies.
              Shared resources and external decision owners remain part of the
              discussion.
            </p>
            {boundaries.length ? (
              <ul>
                {boundaries.map(({ a, b, kind }, i) => (
                  <li key={i}>
                    <strong>{kind}</strong>
                    {name(a)} → {name(b)}{" "}
                    <span>
                      {activeIds.includes(a) ? "outbound" : "inbound"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                The full site is selected. External suppliers, demand and
                applicable procedures still need their own model and evidence.
              </p>
            )}
          </details>
        </>
      )}
      <details className="slice-proposal">
        <summary>Try a factory-slice mapping · JSON proposal</summary>
        <p>
          Validate a fictional mapping. This preview does not interpret UML,
          publish data or overwrite your workspace. Do not paste customer
          information.
        </p>
        <button onClick={sampleProposal}>Load fictional example</button>
        <label>
          Slice proposal JSON
          <textarea
            rows={8}
            value={proposal}
            onChange={(e) => {
              setProposal(e.target.value);
              setPreview(null);
              setProposalError("");
            }}
          />
        </label>
        <button
          onClick={() => {
            try {
              if (proposal.length > 100000)
                throw Error("Proposal exceeds 100 KB");
              setPreview(previewSlice(JSON.parse(proposal), ids));
              setProposalError("");
            } catch (e) {
              setPreview(null);
              setProposalError((e as Error).message);
            }
          }}
        >
          Validate mapping
        </button>
        {proposalError && (
          <p role="alert">Proposal rejected: {proposalError}</p>
        )}
        {preview && (
          <div role="status">
            <h3>{preview.title} · preview only</h3>
            <p>{preview.provenance}</p>
            <ul>
              {preview.mapping.map((z) => (
                <li key={z.id}>
                  {z.label} ({z.id}) → {z.mapsTo}:{" "}
                  <strong>
                    {z.resolved ? "mapped" : "unresolved — mapping needed"}
                  </strong>
                </li>
              ))}
            </ul>
            <p>
              {preview.boundaries.length} declared relationships. Nothing was
              applied or saved.
            </p>
          </div>
        )}
      </details>
    </section>
  );
}
