import {parseScreenshotText,extractPostText,mergeScreenshotResults} from './core.js?v=20261103-2';
let worker;
export async function readScreenshots(files,onProgress,signal){
  if(files.length>6)throw Error('Choose at most six screenshots for one post.');
  const lib=await import('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js');
  const createWorker=lib.createWorker||lib.default.createWorker;
  const pages=[],results=[];
  try{
    worker=await createWorker('eng',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',langPath:'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int',logger:m=>onProgress(m.status+' '+Math.round((m.progress||0)*100)+'%')});
    for(const [index,file]of [...files].entries()){
      if(signal.aborted)throw Error('Reading cancelled.');
      if(file.size>10*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Use PNG, JPEG or WebP screenshots under 10MB.');
      onProgress(`Reading screenshot ${index+1} of ${files.length}`);
      const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');
      // Phone screenshots include status/navigation bars; retain the content region.
      const phone=bitmap.height/bitmap.width>1.8,top=phone?Math.round(bitmap.height*.12):0,bottom=phone?Math.round(bitmap.height*.10):0;
      canvas.width=bitmap.width;canvas.height=bitmap.height-top-bottom;
      canvas.getContext('2d').drawImage(bitmap,0,top,bitmap.width,canvas.height,0,0,canvas.width,canvas.height);bitmap.close();
      const result=await worker.recognize(canvas);canvas.width=canvas.height=0;
      const text=result.data.text;
      if(/(?:past (?:7|28|90|365) days|combined post analytics)/i.test(text))throw Error('Choose the analytics for one post, rather than account analytics.');
      const parsed=parseScreenshotText(text),postText=extractPostText(text);
      pages.push({file:file.name,text,postText});
      results.push({...parsed,postText});
    }
    const merged=mergeScreenshotResults(results),{patch,evidence}=merged;
    if(patch.articles_read!=null||patch.email_sends!=null)patch.format='Article';
    if(!Object.keys(patch).length)throw Error('No readable post text or labelled metrics found. Try a clearer screenshot or enter the fields below.');
    return {...merged,text:pages.map(p=>p.text).join('\n'),pages,approximate:Object.values(evidence).some(s=>/\d[\d.,]*[ \t]*[kKmM]\b/.test(s))};
  }finally{if(worker){await worker.terminate();worker=null;}}
}
export function cancelOCR(){if(worker){worker.terminate();worker=null;}}
