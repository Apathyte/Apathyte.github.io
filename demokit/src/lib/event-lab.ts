/** Independently authored fictional teaching model. No plant connection. */
export type Zone = "storage" | "dosing" | "lineA" | "control" | "planning" | "quality" | "packing";
export type Kind = "allocated" | "shortage" | "notified" | "shortcut_rejected" | "resequence_proposed" | "authorized" | "started" | "completed" | "held";
export type LabEvent = { id: string; sequence: number; at: string; topic: string; kind: Kind; from: Zone; to: Zone; order: "A" | "B"; actor: string };
export type Phase = "idle" | "reference" | "blocked" | "rejected" | "proposed" | "authorized" | "running" | "complete";
export type Command = "allocate" | "shortage" | "shortcut" | "propose" | "authorize" | "start" | "complete";
export type Run = { phase: Phase; original: "waiting" | "allocated" | "held"; alternative: "none" | "proposed" | "authorized" | "running" | "complete"; events: LabEvent[] };
export const initialRun = (): Run => ({phase:"idle", original:"waiting", alternative:"none", events:[]});
const rules: Record<Command, Phase[]> = {
 allocate:["idle"], shortage:["reference"], shortcut:["blocked"], propose:["blocked","rejected"], authorize:["proposed"], start:["authorized"], complete:["running"]
};
export function allowed(run: Run, command: Command) { return rules[command].includes(run.phase); }
type Spec = [Kind,Zone,Zone,"A"|"B",string];
const plans: Record<Command,Spec[]> = {
 allocate:[["allocated","storage","dosing","A","Warehouse"]],
 shortage:[["shortage","dosing","control","A","Preparation"],["notified","control","planning","A","Operations coordination"]],
 shortcut:[["shortcut_rejected","quality","dosing","A","Quality"]],
 propose:[["resequence_proposed","planning","control","B","Planner"]],
 authorize:[["authorized","control","lineA","B","Operations · readiness confirmed"]],
 start:[["started","dosing","lineA","B","Operator"]],
 complete:[["completed","lineA","quality","B","Operator"],["held","quality","packing","B","Quality · release pending"]]
};
export function generate(run: Run, command: Command): LabEvent[] {
 if (!allowed(run,command)) throw Error("Command not permitted in "+run.phase);
 return plans[command].map(([kind,from,to,order,actor],i)=>{
  const sequence=run.events.length+i+1;
  return {id:"fictional-"+sequence,sequence,at:new Date(Date.UTC(2026,0,1)+sequence*1000).toISOString(),topic:"factory/demo/"+from+"/"+kind,kind,from,to,order,actor};
 });
}
export function project(run: Run, event: LabEvent): Run {
 const prior=run.events.find(e=>e.id===event.id);
 if(prior) {
  if(JSON.stringify(prior)!==JSON.stringify(event)) throw Error("Conflicting event identity");
  return run; // exact duplicates do not advance state
 }
 if(event.sequence!==run.events.length+1) throw Error("Out-of-order event");
 const equal=(spec:Spec)=>spec[0]===event.kind&&spec[1]===event.from&&spec[2]===event.to&&spec[3]===event.order&&spec[4]===event.actor;
 if(!Object.values(plans).flat().some(equal)||event.topic!=="factory/demo/"+event.from+"/"+event.kind||event.id!=="fictional-"+event.sequence||event.at!==new Date(Date.UTC(2026,0,1)+event.sequence*1000).toISOString()) throw Error("Invalid synthetic event");
 const next={...run,events:[...run.events,event]};
 switch(event.kind){
 case "allocated": if(run.phase==="idle") return {...next,phase:"reference",original:"allocated"}; break;
 case "shortage": if(run.phase==="reference") return {...next,phase:"blocked",original:"held"}; break;
 case "notified": if(run.phase==="blocked"&&run.events.at(-1)?.kind==="shortage") return next; break;
 case "shortcut_rejected": if(run.phase==="blocked"&&run.events.at(-1)?.kind==="notified") return {...next,phase:"rejected"}; break;
 case "resequence_proposed": if(run.phase==="rejected"||(run.phase==="blocked"&&run.events.at(-1)?.kind==="notified")) return {...next,phase:"proposed",alternative:"proposed"}; break;
 case "authorized": if(run.phase==="proposed") return {...next,phase:"authorized",alternative:"authorized"}; break;
 case "started": if(run.phase==="authorized") return {...next,phase:"running",alternative:"running"}; break;
 case "completed": if(run.phase==="running") return {...next,phase:"complete",alternative:"complete"}; break;
 case "held": if(run.phase==="complete"&&run.events.at(-1)?.kind==="completed") return next; break;
 }
 throw Error("Invalid transition: "+event.kind+" from "+run.phase);
}
export interface Transport {
 publish(event: LabEvent): void;
 subscribe(handler: (event: LabEvent)=>void): ()=>void;
}
/** MQTT-shaped pub/sub, not an MQTT protocol implementation. Synchronous and local. */
export function memoryTransport(): Transport {
 const handlers=new Set<(event: LabEvent)=>void>();
 return {publish(event){for(const handler of handlers) handler(structuredClone(event));},subscribe(handler){handlers.add(handler);return ()=>{handlers.delete(handler);};}};
}
export function dispatch(run: Run, command: Command, bus:Transport=memoryTransport()): Run {
 let next=run;
 const unsubscribe=bus.subscribe(event=>{next=project(next,event);});
 try {for(const event of generate(run,command)) bus.publish(event);return next;} finally {unsubscribe();}
}
export const journey: Command[]=["allocate","shortage","shortcut","propose","authorize","start","complete"];
export function replay(commands: Command[]=journey): Run {return commands.reduce((run,command)=>dispatch(run,command),initialRun());}
export function scenarioChecks() {
 const tests:[string,()=>boolean][]=[
 ["Reference allocates order A",()=>dispatch(initialRun(),"allocate").original==="allocated"],
 ["Shortage holds A and notifies planning",()=>{const r=replay(["allocate","shortage"]);return r.original==="held"&&r.events.at(-1)?.to==="planning";}],
 ["Reject unauthorized shortcut",()=>replay(["allocate","shortage","shortcut"]).phase==="rejected"],
 ["Proposal cannot start work",()=>!allowed(replay(["allocate","shortage","propose"]),"start")],
 ["Authorize and execute B without releasing A",()=>{const r=replay();return r.original==="held"&&r.alternative==="complete"&&r.events.at(-1)?.kind==="held";}],
 ["Duplicate identity does not advance state",()=>{const r=replay();return project(r,r.events[0])===r;}],
 ["Out-of-order event rejected",()=>{try{project(initialRun(),replay().events[2]);return false;}catch{return true;}}],
 ["Independent subscriber receives the same ordered trace",()=>{const bus=memoryTransport(), seen:LabEvent[]=[];bus.subscribe(e=>seen.push(e));const run=journey.reduce((state,c)=>dispatch(state,c,bus),initialRun());return JSON.stringify(seen)===JSON.stringify(run.events);}]
 ];
 return tests.map(([name,check])=>{try{return {name,pass:check()};}catch{return {name,pass:false};}});
}
