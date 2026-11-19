import { useMemo, useState } from "react";
import FactoryScene from "./factory-scene";
import type { LabData } from "../lib/schema";
import { allowed, initialRun, replay, scenarioChecks } from "../lib/event-lab";
import type { Command, Run } from "../lib/event-lab";
const buttons: [Command,string][]=[["allocate","Allocate order A"],["shortage","Inject material shortage"],["shortcut","Attempt unauthorized shortcut"],["propose","Propose eligible order B"],["authorize","Authorize B readiness"],["start","Start order B"],["complete","Complete processing B"]];
const views=["Reference","Operational","Proposed"] as const;
type View=typeof views[number];
export default function EventLab({data,run,onCommand,onReset,mode}:{data:LabData;run:Run;onCommand:(command:Command)=>void;onReset:()=>void;mode:"scenario"|"events"}){
 const [view,setView]=useState<View>("Operational"),[layer,setLayer]=useState("Events"),[zone,setZone]=useState("lineA"),[reset,setReset]=useState(0);
 const snapshot=useMemo(()=>view==="Reference"?replay(["allocate"]):view==="Proposed"?replay(["allocate","shortage","propose"]):run,[view,run]);
 const last=snapshot.events.at(-1);
 const states=useMemo<Record<string,string>>(()=>({
  storage:snapshot.original==="held"?"A HELD":snapshot.original==="allocated"?"A ALLOCATED":"IDLE",
  dosing:snapshot.original==="held"?"A BLOCKED":"READY",
  planning:snapshot.alternative==="none"?snapshot.original==="held"?"REPLAN":"SCHEDULED":snapshot.alternative==="proposed"?"B PROPOSED":"B AUTHORIZED",
  lineA:snapshot.alternative==="running"?"B RUNNING":snapshot.alternative==="complete"?"B COMPLETE":snapshot.alternative==="authorized"?"B READY":snapshot.alternative==="proposed"?"B PROPOSED":snapshot.original==="held"?"A BLOCKED":"READY",
  quality:snapshot.alternative==="complete"?"B HOLD":"AWAIT EVIDENCE",
  packing:snapshot.alternative==="complete"?"B BLOCKED":"WAITING"
 }),[snapshot]);
 const links=useMemo<string[][]>(()=>{
  if(layer==="Events")return last?[[last.from,last.to]]:[];
  if(layer==="Material")return [...(snapshot.original==="allocated"||snapshot.original==="held"?[["storage","dosing"]]:[]),...(snapshot.alternative==="running"?[["dosing","lineA"]]:[]),...(snapshot.alternative==="complete"?[["lineA","quality"],["quality","packing"]]:[])];
  return [];
 },[last,layer,snapshot]);
 const known=new Set(data.zones.map(z=>z.id));
 const missing=["storage","dosing","lineA","control","planning","quality","packing"].filter(id=>!known.has(id));
 const label=(id:string)=>data.zones.find(z=>z.id===id)?.short??id;
 if(missing.length)return <p role="status">Event journey unavailable: this edited workspace lacks {missing.join(", ")}. No model data has been replaced.</p>;
 return <section className="event-lab" aria-label={mode==="scenario"?"Event-driven shortage scenario":"Event explorer"}>
  <header className="event-lab-head"><div><span className="eyebrow">SYNTHETIC · IN-MEMORY PUB/SUB</span><h2>{mode==="scenario"?"Material shortage — execute the journey":"Operational event trace"}</h2><p>Browser-local deterministic events; not live MQTT and not physical proof.</p></div><button onClick={()=>{onReset();setView("Operational");setReset(x=>x+1);}}>Reset event run</button></header>
  {mode==="scenario"&&<>
   <div className="event-actions" role="group" aria-label="Scenario commands">{buttons.map(([command,title])=><button key={command} disabled={!allowed(run,command)} onClick={()=>{onCommand(command);setView("Operational");setLayer(command==="allocate"||command==="start"||command==="complete"?"Material":"Events");}}>{title}</button>)}</div>
   <div className="comparison-bar" role="group" aria-label="Compare event states">{views.map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v}</button>)}<span>{view==="Reference"?"Assumed normal allocation":view==="Proposed"?"Hypothetical alternative; no authorization implied":"Actual browser run"}</span></div>
   <div className="event-state" aria-live="polite"><div><small>Original order A</small><strong data-testid="original-state">{snapshot.original}</strong></div><div><small>Alternative order B</small><strong data-testid="alternative-state">{snapshot.alternative}</strong></div><div><small>Phase</small><strong data-testid="run-phase">{snapshot.phase}</strong></div></div>
   <div className="event-scene"><FactoryScene zones={data.zones} selected={zone} onSelect={setZone} layer={layer} links={links} focus="Site" reset={reset} blockedZone={snapshot.alternative==="complete"?"packing":snapshot.original==="held"?"dosing":""} zoneStates={states}/></div>
   <div className="event-actions" role="group" aria-label="Event scenario overlay">{["Events","Material","None"].map(l=><button key={l} aria-pressed={layer===l} onClick={()=>setLayer(l)}>{l}</button>)}</div>
   <p role="status" data-testid="active-route">{last?label(last.from)+" → "+label(last.to)+" · "+last.kind.replaceAll("_"," "):"No event yet; execute an available command."}</p>
   <div className="event-zone-register">{Object.entries(states).map(([id,state])=><div key={id}><small>{label(id)}</small><strong>{state}</strong></div>)}</div>
  </>}
  <h3>{mode==="scenario"?"Messages for the selected comparison":"Actual messages in the current browser run"} · {mode==="scenario"?snapshot.events.length:run.events.length}</h3>
  <div className="event-table" data-testid="event-trace">{(mode==="scenario"?snapshot.events:run.events).map(e=><details key={e.id} className="evidence-item"><summary><strong>{String(e.sequence).padStart(2,"0")} · {e.kind.replaceAll("_"," ")}</strong><code>{e.topic}</code><span>{label(e.from)} → {label(e.to)}</span></summary><pre>{JSON.stringify(e,null,2)}</pre></details>)}</div>
  {(mode==="scenario"?snapshot.events:run.events).length===0&&<p>No messages. Use Scenario lab to execute the first command.</p>}
 </section>;
}
export function EventChecks(){
 const [results,setResults]=useState<ReturnType<typeof scenarioChecks>|null>(null);
 return <section className="event-lab" aria-label="Executable scenario checks"><header className="event-lab-head"><div><span className="eyebrow">DETERMINISTIC · PUBLIC BROWSER MODE</span><h2>Scenario test runner</h2><p>Executes an isolated synthetic run. Does not change your active scenario or prove MQTT transport.</p></div><button onClick={()=>setResults(scenarioChecks())}>Run scenario tests</button></header>
 {results?<div aria-live="polite" className="model-checks" data-testid="scenario-results">{results.map(c=><p key={c.name}><strong>{c.pass?"PASS":"FAIL"}</strong> {c.name}</p>)}</div>:<p>Not run.</p>}
 </section>;
}
