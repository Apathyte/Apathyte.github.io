import test from "node:test";
import assert from "node:assert/strict";
import { allowed, dispatch, initialRun, journey, memoryTransport, project, replay, scenarioChecks } from "../src/lib/event-lab.ts";
for(const check of scenarioChecks()) test(check.name,()=>assert.equal(check.pass,true));
test("all messages have independent subscriber evidence and canonical projection",()=>{
 const bus=memoryTransport(),seen=[];const stop=bus.subscribe(e=>seen.push(e));
 const run=journey.reduce((r,c)=>dispatch(r,c,bus),initialRun());stop();
 assert.deepEqual(seen,run.events);assert.deepEqual(seen.reduce(project,initialRun()),run);
 assert.equal(run.events.length,9);
 assert.deepEqual(run.events.map(e=>e.sequence),[1,2,3,4,5,6,7,8,9]);
});
test("rejected start, conflicting identity and forged actor do not change state",()=>{
 const proposed=replay(["allocate","shortage","propose"]);
 assert.equal(allowed(proposed,"start"),false);
 assert.throws(()=>dispatch(proposed,"start"),/not permitted/);
 assert.throws(()=>project(proposed,{...proposed.events[0],actor:"Other"}),/Conflicting/);
 const event=replay().events[0];assert.throws(()=>project(initialRun(),{...event,actor:"Other"}),/Invalid synthetic/);
 assert.equal(proposed.original,"held");assert.equal(proposed.alternative,"proposed");
});
