
function noorPronunciation(text){
  return String(text)
    .replace(/Non\s+Gianjyotian/gi,'Non Gyaan Jyoti an')
    .replace(/Gianjyotian/gi,'Gyaan Jyoti an')
    .replace(/Gian\s+Jyoti/gi,'Gyaan Jyoti')
    .replace(/\bGian\b/gi,'Gyaan')
    .replace(/Sat Shri Akal/gi,'Sat Shree Akaal')
    .replace(/Sat Sri Akal/gi,'Sat Shree Akaal');
}

const API_URL='https://script.google.com/macros/s/AKfycbw02znnYysRZhE8FeYz040Gd11qk7d-MWa1ij0XIk2I_ikFCMUcgBkAvq2Tl3EOdb8Mfw/exec';let loading=false;function getStats(){return new Promise((resolve,reject)=>{const cb='dash_'+Date.now()+'_'+Math.floor(Math.random()*1e6),s=document.createElement('script');let done=false;const t=setTimeout(()=>end(new Error('Timed out')),12000);function end(e,v){if(done)return;done=true;clearTimeout(t);delete window[cb];s.remove();e?reject(e):resolve(v)}window[cb]=v=>end(v.error?new Error(v.error):null,v);s.onerror=()=>end(new Error('Network error'));s.src=API_URL+'?action=stats&callback='+cb+'&_='+Date.now();document.head.appendChild(s)})}async function refresh(){if(loading)return;loading=true;try{const s=await getStats();if(!s.ok)throw Error(s.error||'API error');if(s.apiVersion!=='NOOR-3BOX-V4')throw Error('Backend update required: deploy latest Code.gs as a NEW VERSION');document.getElementById('total').textContent=s.total??0;document.getElementById('gianCount').textContent=s.gianjyotianCount??0;document.getElementById('nonGianCount').textContent=s.nonGianjyotianCount??0;document.getElementById('sync').textContent='● Google Sheet connected • Updated '+new Date().toLocaleTimeString('en-IN')}catch(e){document.getElementById('sync').textContent='⚠ '+e.message+' • Will retry'}finally{loading=false}}refresh();setInterval(refresh,10000);
let lastEventId = Number(sessionStorage.getItem('noorDashboardLastId')||0);
let initialized = false, polling = false, speaking = false, voiceReady = false;
const announcementQueue = [];
const alertBox=document.getElementById('donorAlert');
const lineBox=document.getElementById('line');
const halo=document.querySelector('.halo');
const DEFAULT_LINE='Gian Jyoti Blood Donation Camp. Every donor brings hope and helps save lives.';
function femaleVoice(){
 const voices=window.speechSynthesis?.getVoices()||[];
 if(!voices.length)return null;
 const preferred=['Microsoft Neerja','Microsoft Heera','Microsoft Swara','Google हिन्दी','Google Hindi','Veena','Lekha','Samantha','Karen','Moira','Tessa','Microsoft Zira'];
 for(const name of preferred){const v=voices.find(x=>x.name.toLowerCase().includes(name.toLowerCase()));if(v)return v}
 return voices.find(v=>/^(hi|en)[-_ ]?IN/i.test(v.lang)&&/female|woman|neerja|heera|swara|veena|lekha/i.test(v.name))
   ||voices.find(v=>/female|woman|neerja|heera|swara|veena|lekha|samantha|karen|zira/i.test(v.name))
   ||voices.find(v=>/^hi[-_ ]?IN/i.test(v.lang))
   ||voices.find(v=>/^en[-_ ]?IN/i.test(v.lang))
   ||voices.find(v=>v.default)
   ||voices[0]
   ||null;
}

let musicCtx=null,musicTimer=null,musicPlaying=false,audioUnlocked=false;
function playSoftNote(freq,when,duration=2.8,volume=.050){
 if(!musicCtx)return;
 const o=musicCtx.createOscillator(),g=musicCtx.createGain();
 o.type='sine';o.frequency.setValueAtTime(freq,when);
 g.gain.setValueAtTime(.0001,when);
 g.gain.exponentialRampToValueAtTime(volume,when+.18);
 g.gain.exponentialRampToValueAtTime(.0001,when+duration);
 o.connect(g);g.connect(musicCtx.destination);o.start(when);o.stop(when+duration+.05);
}
function startLightMusic(){
 if(!audioUnlocked||musicPlaying)return;
 try{
  musicCtx=musicCtx||new (window.AudioContext||window.webkitAudioContext)();
  if(musicCtx.state==='suspended')musicCtx.resume();
  musicPlaying=true;
  const chords=[[261.63,329.63,392],[293.66,369.99,440],[329.63,392,493.88],[293.66,349.23,440]];
  let i=0;
  const playChord=()=>{if(!musicPlaying||!musicCtx)return;const now=musicCtx.currentTime+.03;chords[i++%chords.length].forEach((f,j)=>playSoftNote(f,now+j*.06,3.4,.030));};
  playChord();musicTimer=setInterval(playChord,3300);
 }catch(e){console.warn('Soft music unavailable',e)}
}
function pauseLightMusic(){
 if(musicTimer){clearInterval(musicTimer);musicTimer=null}
 musicPlaying=false;
}
function sayDashboard(message, onFinish){
 pauseLightMusic();
 if(!('speechSynthesis' in window)){onFinish?.();startLightMusic();return}
 let attempts=0;
 const speakNow=()=>{
  const voices=speechSynthesis.getVoices()||[];
  if(!voices.length&&attempts<16){attempts++;setTimeout(speakNow,250);return}
  const v=femaleVoice();
  speechSynthesis.cancel();speechSynthesis.resume();
  const spoken=noorPronunciation(message),u=new SpeechSynthesisUtterance(spoken);
  if(v){u.voice=v;u.lang=v.lang||'hi-IN'}else{u.lang='hi-IN'}
  u.rate=1.02;u.pitch=1.10;u.volume=1;
  u.onstart=()=>halo.classList.add('talking');
  let finished=false;
  const done=()=>{if(finished)return;finished=true;halo.classList.remove('talking');onFinish?.();setTimeout(startLightMusic,450)};
  u.onend=done;u.onerror=done;
  try{speechSynthesis.speak(u)}catch(e){done()}
 };
 speakNow();
}
let currentDonor='';
let spotlightTimer=null;
function showDonorSpotlight(name){
 const box=document.getElementById('donorSpotlight');
 document.getElementById('spotlightName').textContent='Welcome, '+name+'!';
 document.getElementById('spotlightMessage').textContent='Thank you for registering. Your generous act can help save lives and bring hope to many families.';
 box.classList.add('show'); clearTimeout(spotlightTimer);
 spotlightTimer=setTimeout(()=>box.classList.remove('show'),50000);
}
function announceNext(){
 if(!audioUnlocked||speaking||!announcementQueue.length)return;
 const donor=announcementQueue.shift();speaking=true;currentDonor=donor.name;showDonorSpotlight(donor.name);
 const msg='Thank you '+donor.name+' for registering at the Gian Jyoti Blood Donation Camp. Your generous act can help save lives and bring hope to families. ';
 alertBox.textContent='♥ Thank you, '+donor.name+'! ';
 lineBox.textContent=msg;
 refresh();
 sayDashboard(msg,()=>{speaking=false;setTimeout(announceNext,350)});
}
function getEvents(after){
 return new Promise((resolve,reject)=>{
  const cb='noorEvent_'+Date.now()+'_'+Math.floor(Math.random()*1e6);
  const script=document.createElement('script');let done=false;
  const timer=setTimeout(()=>finish(new Error('Announcement connection timed out')),12000);
  function finish(err,result){if(done)return;done=true;clearTimeout(timer);delete window[cb];script.remove();err?reject(err):resolve(result)}
  window[cb]=r=>finish(r&&r.error?new Error(r.error):null,r);
  script.onerror=()=>finish(new Error('Announcement service unreachable'));
  script.src=API_URL+'?action=events&after='+encodeURIComponent(after)+'&callback='+cb+'&_='+Date.now();
  document.head.appendChild(script);
 });
}
async function pollEvents(){
 if(polling)return;polling=true;
 try{
  const r=await getEvents(lastEventId);
  if(!r.ok||!Array.isArray(r.events))throw Error('Please deploy the latest Code.gs (events API).');
  if(!initialized){
   initialized=true;
   // First opening: do not announce historical registrations; DO announce the last donor if registered in the past 2 minutes.
   if(lastEventId===0){
    const recent=r.events.filter(d=>Date.now()-Number(d.time)<120000);
    if(recent.length)announcementQueue.push(...recent);
    lastEventId=Math.max(lastEventId,Number(r.latest)||0);
   }else{
    for(const d of r.events)if(Number(d.id)>lastEventId)announcementQueue.push(d);
    lastEventId=Math.max(lastEventId,Number(r.latest)||0);
   }
  }else{
   for(const d of r.events)if(Number(d.id)>lastEventId){announcementQueue.push(d);lastEventId=Number(d.id)}
   lastEventId=Math.max(lastEventId,Number(r.latest)||0);
  }
  sessionStorage.setItem('noorDashboardLastId',String(lastEventId));
  if(announcementQueue.length)announceNext();
 }catch(e){console.warn(e);alertBox.textContent='⚠ Dashboard announcement connection: '+e.message}
 finally{polling=false}
}
const speakBtn=document.getElementById('speak');if(speakBtn)speakBtn.onclick=()=>{
 voiceReady=true;
 if(announcementQueue.length)announceNext();
 else sayDashboard(lineBox.textContent||DEFAULT_LINE);
};
if('speechSynthesis' in window){speechSynthesis.getVoices();speechSynthesis.addEventListener?.('voiceschanged',()=>{});}
pollEvents();setInterval(pollEvents,2000);


const startBtn=document.getElementById('startDashboard');
if(startBtn)startBtn.onclick=async()=>{
 try{
  musicCtx=musicCtx||new (window.AudioContext||window.webkitAudioContext)();
  await musicCtx.resume();
  audioUnlocked=true;

  // Android/Chrome: unlock speech directly inside this user tap.
  if('speechSynthesis' in window){
   speechSynthesis.cancel();
   speechSynthesis.resume();
   speechSynthesis.getVoices();
   const unlock=new SpeechSynthesisUtterance('NOOR is ready.');
   const v=femaleVoice();
   if(v){unlock.voice=v;unlock.lang=v.lang||'hi-IN'}else unlock.lang='hi-IN';
   unlock.rate=1.02;unlock.pitch=1.10;unlock.volume=1;
   speechSynthesis.speak(unlock);
  }

  document.getElementById('audioStart').classList.add('hide');
  setTimeout(()=>document.getElementById('audioStart').remove(),450);
  startLightMusic();
  if(announcementQueue.length)setTimeout(announceNext,900);
  pollEvents();
 }catch(e){alert('Please allow sound/media in the browser, increase Media volume, and tap Start Live Dashboard again.')}
};