
function noorPronunciation(text){
  return String(text)
    .replace(/Non\s+Gianjyotian/gi,'Non Gyaan Jyoti an')
    .replace(/Gianjyotian/gi,'Gyaan Jyoti an')
    .replace(/Gian\s+Jyoti/gi,'Gyaan Jyoti')
    .replace(/\bGian\b/gi,'Gyaan')
    .replace(/Sat Shri Akal/gi,'Sat Shree Akaal')
    .replace(/Sat Sri Akal/gi,'Sat Shree Akaal');
}

const CONFIG={API_URL:"https://script.google.com/macros/s/AKfycbw02znnYysRZhE8FeYz040Gd11qk7d-MWa1ij0XIk2I_ikFCMUcgBkAvq2Tl3EOdb8Mfw/exec"};
let step='idle', data={}, voices=[];
const $=s=>document.querySelector(s),chat=$('#chat'),input=$('#input'),avatar=$('#avatar'),actions=$('#actions'),inputBox=$('#inputBox'),startBox=$('#startBox'),newForm=$('#newForm'),outsiderForm=$('#outsiderForm'),donorTypeChoice=$('#donorTypeChoice');
function add(t,c='bot'){const d=document.createElement('div');d.className='msg '+c;d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight}
function loadVoices(){voices=speechSynthesis.getVoices()||[]}
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}
function femaleVoice(){loadVoices();const preferred=['Microsoft Neerja','Microsoft Heera','Google हिन्दी','Google Hindi','Microsoft Swara','Veena','Lekha','Google UK English Female','Samantha','Karen','Moira','Tessa','Microsoft Zira'];for(const n of preferred){const v=voices.find(x=>x.name.toLowerCase().includes(n.toLowerCase()));if(v)return v}return voices.find(v=>/^(hi|en)[-_ ]?IN/i.test(v.lang)&&/female|woman|neerja|heera|swara|veena|lekha/i.test(v.name))||voices.find(v=>/female|woman|neerja|heera|swara|veena|lekha|samantha|karen|zira/i.test(v.name))||null}
let speechToken=0;
function stopNoorSpeech(){speechToken++;if('speechSynthesis' in window)speechSynthesis.cancel();avatar.classList.remove('speaking');$('#voiceState').textContent='Ready'}
function speakOnly(t,done){
 stopNoorSpeech();const token=speechToken;
 if(!('speechSynthesis' in window)){done&&done();return}
 const spoken=noorPronunciation(t);const u=new SpeechSynthesisUtterance(spoken);
 const v=femaleVoice();if(v)u.voice=v;u.lang=(v&&v.lang)||'en-IN';u.rate=1.02;u.pitch=1.10;u.volume=1;
 u.onstart=()=>{if(token!==speechToken)return;avatar.classList.add('speaking');$('#voiceState').textContent='NOOR is speaking...'};
 const finish=()=>{if(token!==speechToken)return;avatar.classList.remove('speaking');$('#voiceState').textContent='Ready';if(done)done()};
 u.onend=finish;u.onerror=finish;speechSynthesis.speak(u);
}
function say(t,done){add(t,'bot');speakOnly(t,done)}
// JSONP works even when index.html is opened directly as file://. It also avoids Apps Script CORS/redirect issues.
function api(action,payload={}){return new Promise((resolve,reject)=>{if(!CONFIG.API_URL.includes('/exec'))return reject(new Error('Apps Script /exec URL missing'));const cb='noorCB_'+Date.now()+'_'+Math.floor(Math.random()*100000);const script=document.createElement('script');const timer=setTimeout(()=>cleanup(new Error('Google Sheet connection timed out')),12000);function cleanup(err,val){clearTimeout(timer);delete window[cb];script.remove();err?reject(err):resolve(val)}window[cb]=x=>{if(x&&x.error)cleanup(new Error(x.error));else cleanup(null,x||{})};const p=new URLSearchParams({action,callback:cb});Object.entries(payload).forEach(([k,v])=>p.set(k,v==null?'':String(v)));script.onerror=()=>cleanup(new Error('Could not reach Google Apps Script'));script.src=CONFIG.API_URL+'?'+p.toString();document.head.appendChild(script)})}
function showChoice(){actions.classList.remove('hidden');inputBox.classList.remove('hidden');input.placeholder='Say/type Yes or No...'}
function hideChoice(){actions.classList.add('hidden')}
function begin(){stopNoorSpeech();startBox.classList.add('hidden');newForm.classList.add('hidden');outsiderForm.classList.add('hidden');donorTypeChoice.classList.add('hidden');step='registeredChoice';showChoice();const welcome='Sat Shri Akal! I am NOOR. Welcome to the Gian Jyoti Blood Donation Camp. Have you already registered? Please click Yes or No.';chat.innerHTML='';say(welcome)}
async function stats(){try{const s=await api('stats');$('#total').textContent=s.total||0;$('#present').textContent=s.present||0;$('#newCount').textContent=s.newCount||0;$('#status').textContent='Google Sheet Connected'}catch(e){console.error(e);$('#status').textContent='Sheet setup required'}}
function welcomeDonor(name,kind){stopNoorSpeech();const event={name,kind,time:Date.now(),id:Date.now()+'_'+Math.random().toString(36).slice(2)};sessionStorage.setItem('noorDonor',JSON.stringify(event));localStorage.setItem('noorLatestDonor',JSON.stringify(event));location.href='welcome.html'}
function nextStudent(){step='idle';data={};hideChoice();inputBox.classList.add('hidden');newForm.classList.add('hidden');outsiderForm.classList.add('hidden');donorTypeChoice.classList.add('hidden');startBox.classList.remove('hidden');say('Next student please. Click Start Registration when you are ready.')}
async function answer(v){v=String(v||'').trim();if(!v)return;stopNoorSpeech();add(v,'user');input.value='';if(step==='registeredChoice'){const no=/\b(no|not|nahi|nahin|new)\b/i.test(v),yes=/\b(yes|yeah|yep|haan|han|registered|already)\b/i.test(v);if(no&&!yes){hideChoice();inputBox.classList.add('hidden');newForm.classList.add('hidden');outsiderForm.classList.add('hidden');donorTypeChoice.classList.remove('hidden');step='donorType';say('Please select whether you are a Gianjyotian or a Non Gianjyotian. Click the appropriate button.');return}if(yes){hideChoice();step='name';input.placeholder='Enter full name';say('Please tell me your full name.');return}say('Please click Yes if you are already registered, or No if you are not registered yet.');return}if(step==='name'){data.name=v;step='course';input.placeholder='Enter course, for example BCA';say('Please tell me your course.');return}if(step==='course'){data.course=v;step='semester';input.placeholder='Enter semester';say('Please tell me your semester.');return}if(step==='semester'){data.semester=v;inputBox.classList.add('hidden');$('#status').textContent='Checking registration...';try{const r=await api('markPresent',data);if(r.found){$('#status').textContent='Present marked';welcomeDonor(r.name||data.name,'existing');await stats()}else{$('#status').textContent='Record not found';say('I could not match your name, course and semester in the pre-registered list. Please check the details with the registration desk.',()=>setTimeout(nextStudent,600))}}catch(e){console.error(e);$('#status').textContent='Connection error';say('I could not connect to the registration sheet. Please check that the latest Code dot G S is deployed as a web app.');setTimeout(()=>{inputBox.classList.remove('hidden');step='semester'},900)}return}}
$('#startRegistration').onclick=begin;$('#gjBtn').onclick=()=>{stopNoorSpeech();donorTypeChoice.classList.add('hidden');outsiderForm.classList.add('hidden');newForm.classList.remove('hidden');step='newForm';say('Please fill the Gian Jyotian donor registration form. ');};$('#outsiderBtn').onclick=()=>{stopNoorSpeech();donorTypeChoice.classList.add('hidden');newForm.classList.add('hidden');outsiderForm.classList.remove('hidden');step='outsiderForm';say('Welcome. Please fill the Non Gianjyotian donor registration form.');};document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer));$('#send').onclick=()=>answer(input.value);input.onkeydown=e=>{if(e.key==='Enter')answer(input.value)};
newForm.onsubmit=async e=>{e.preventDefault();const fd=new FormData(newForm),p=Object.fromEntries(fd.entries());if(!/^\d{10}$/.test(p.mobile)){alert('Please enter a valid 10 digit mobile number.');return}$('#status').textContent='Saving registration...';try{await api('newRegistration',p);newForm.reset();newForm.classList.add('hidden');$('#status').textContent='Registration saved';welcomeDonor(p.name,'new');await stats()}catch(err){console.error(err);$('#status').textContent='Connection error';alert(err.message)}};
outsiderForm.onsubmit=async e=>{e.preventDefault();const fd=new FormData(outsiderForm),p=Object.fromEntries(fd.entries());if(!/^\d{10}$/.test(p.mobile)){alert('Please enter a valid 10 digit mobile number.');return}$('#status').textContent='Saving outsider registration...';try{await api('outsiderRegistration',p);outsiderForm.reset();outsiderForm.classList.add('hidden');$('#status').textContent='Outsider registered';welcomeDonor(p.name,'new');await stats()}catch(err){console.error(err);$('#status').textContent='Connection error';alert(err.message)}};
$('#stop').onclick=stopNoorSpeech;
// No autoplay speech: browsers block it. First Start Registration click is the user gesture that reliably starts the female voice.
window.addEventListener('load',()=>{add('Sat Shri Akal! I am NOOR. Welcome to the Gian Jyoti Blood Donation Camp. Click Start Registration to begin.');stats()});
