// Run explicitly: node --experimental-strip-types scripts/mqtt-smoke.mjs
// Requires mosquitto, mosquitto_pub and mosquitto_sub executables.
// Disposable unprivileged loopback broker; never connects to a plant or external broker.
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import assert from "node:assert/strict";
import { replay, initialRun, project } from "../src/lib/event-lab.ts";
const exec=promisify(execFile), sleep=ms=>new Promise(r=>setTimeout(r,ms));
const free=net.createServer();await new Promise((resolve,reject)=>{free.once("error",reject);free.listen(0,"127.0.0.1",resolve);});
const port=String(free.address().port);await new Promise(r=>free.close(r));
const dir=await mkdtemp(join(tmpdir(),"factory-lab-mqtt-"));
const config=join(dir,"mosquitto.conf");
await writeFile(config,"listener "+port+" 127.0.0.1\nallow_anonymous true\npersistence false\n");
let broker,sub,error="",buffer="",messages=[];
const args=["-h","127.0.0.1","-p",port];
const wait=async(predicate,label)=>{for(let i=0;i<100;i++){if(error)throw Error(error);if(predicate())return;await sleep(50);}throw Error("Timeout: "+label);};
const pub=(topic,message)=>exec("mosquitto_pub",[...args,"-q","1","-t",topic,"-m",message],{timeout:3000});
try{
 broker=spawn("mosquitto",["-c",config],{stdio:["ignore","ignore","pipe"]});
 broker.on("error",e=>error=String(e));broker.on("exit",code=>{if(code!==null&&code!==0)error="Broker exited "+code;});broker.stderr.resume();
 let ready=false;
 for(let i=0;i<50&&!ready;i++){if(error)throw Error(error);ready=await new Promise(resolve=>{const s=net.createConnection({host:"127.0.0.1",port:Number(port)});s.once("connect",()=>{s.destroy();resolve(true)});s.once("error",()=>resolve(false));s.setTimeout(300,()=>{s.destroy();resolve(false)});});if(!ready)await sleep(100);}
 assert(ready,"Broker startup");
 sub=spawn("mosquitto_sub",[...args,"-q","1","-v","-t","factory/demo/#"],{stdio:["ignore","pipe","pipe"]});
 sub.on("error",e=>error=String(e));sub.on("exit",code=>{if(code!==null&&code!==0)error="Subscriber exited "+code;});sub.stderr.resume();
 sub.stdout.setEncoding("utf8").on("data",chunk=>{buffer+=chunk;let end;while((end=buffer.indexOf("\n"))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+1);const split=line.indexOf(" ");if(split>0)messages.push({topic:line.slice(0,split),payload:line.slice(split+1)});}});
 // Handshake establishes subscriber readiness; no fixed startup sleep as proof.
 for(let i=0;i<30&&!messages.some(m=>m.topic==="factory/demo/probe");i++){await pub("factory/demo/probe","ready");await sleep(100);}
 assert(messages.some(m=>m.topic==="factory/demo/probe"),"Independent MQTT subscriber ready");
 const expected=replay(), data=()=>messages.filter(m=>m.topic!=="factory/demo/probe");
 for(const event of expected.events){await pub(event.topic,JSON.stringify(event));await wait(()=>data().length>=event.sequence,"event "+event.sequence);}
 await pub(expected.events[0].topic,JSON.stringify(expected.events[0]));await wait(()=>data().length>=expected.events.length+1,"duplicate");
 const received=data().map(m=>{const e=JSON.parse(m.payload);assert.equal(m.topic,e.topic);return e;});
 assert.deepEqual(received,[...expected.events,expected.events[0]]);assert.deepEqual(received.reduce(project,initialRun()),expected);
 assert.equal(expected.original,"held");assert.equal(expected.alternative,"complete");
 console.log("PASS: MQTT independent subscriber observed all "+expected.events.length+" messages and duplicate; projection identical. Local synthetic transport only.");
}finally{if(sub&&!sub.killed)sub.kill();if(broker&&!broker.killed)broker.kill();await rm(dir,{recursive:true,force:true});}
