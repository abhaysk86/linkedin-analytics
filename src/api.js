export const ENDPOINT='https://script.google.com/macros/s/AKfycbzSsA6jKkz9p3eFCdPYcH1aU852fxTHN3DrlX5VPJwY1XBuuSezJXmFOFdhWLsVlUvf/exec';
export function accessKey(){return sessionStorage.getItem('perspective-key')||localStorage.getItem('perspective-key')||'';}
export async function request(action,payload={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);try{const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({apiVersion:2,accessKey:accessKey(),action,...payload}),signal:controller.signal});const data=await r.json();if(!data.ok){const e=new Error(data.error||'Server did not confirm this request.');e.code=data.code;throw e;}return data;}finally{clearTimeout(timer);}}
export const queue=()=>JSON.parse(localStorage.getItem('perspective-queue')||'[]');
export function enqueue(op){const q=queue();if(!q.some(x=>x.requestId===op.requestId))q.push(op);localStorage.setItem('perspective-queue',JSON.stringify(q));}
export async function flush(){for(const op of queue()){await request(op.action,op);localStorage.setItem('perspective-queue',JSON.stringify(queue().filter(x=>x.requestId!==op.requestId)));}}
