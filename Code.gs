const SPREADSHEET_ID='1n6bJbSSh3r9zOdA64_FmD2txcgkd8wdheqFKXO4rNM4';
const SHEET_GID=0;
function norm_(v){return String(v==null?'':v).trim().toLowerCase().replace(/[^a-z0-9]/g,'')}
function getSheet_(){const ss=SpreadsheetApp.openById(SPREADSHEET_ID);const s=ss.getSheets().find(sh=>sh.getSheetId()===SHEET_GID)||ss.getSheets()[0];ensureHeaders_(s);return s}
function ensureHeaders_(s){const wanted=['Name','Course','Semester','Mobile','Already Registered','Present','Registration Type','Attendance Time','Organization'];if(s.getLastRow()===0){s.getRange(1,1,1,wanted.length).setValues([wanted]);return}let h=s.getRange(1,1,1,Math.max(s.getLastColumn(),1)).getDisplayValues()[0];wanted.forEach(name=>{const aliases=name==='Already Registered'?['alreadyregistered','ireadyregistere','alreadyregistere']:name==='Registration Type'?['registrationtype']:name==='Attendance Time'?['attendancetime']:[norm_(name)];if(!h.some(x=>aliases.includes(norm_(x)))){s.getRange(1,s.getLastColumn()+1).setValue(name);h.push(name)}})}
function col_(h,name){const t=norm_(name),a=t==='alreadyregistered'?['alreadyregistered','ireadyregistere','alreadyregistere']:[t];return h.findIndex(x=>a.includes(norm_(x)))}
function eventSheet_(){const ss=SpreadsheetApp.openById(SPREADSHEET_ID);let sh=ss.getSheetByName('NOOR_ANNOUNCEMENTS');if(!sh){sh=ss.insertSheet('NOOR_ANNOUNCEMENTS');sh.appendRow(['Event ID','Timestamp','Donor Name','Registration Type']);}return sh}
function recordEvent_(name,type){const sh=eventSheet_();const lock=LockService.getScriptLock();lock.waitLock(10000);try{const id=sh.getLastRow();sh.appendRow([id,new Date(),String(name||'Donor'),type]);return id}finally{lock.releaseLock()}}
function getEvents_(after){const sh=eventSheet_(),last=sh.getLastRow();const from=Number(after)>0?Math.max(2,Math.floor(Number(after))+2):Math.max(2,last-29);if(from>last)return {ok:true,latest:last-1,events:[]};const rows=sh.getRange(from,1,Math.min(last-from+1,30),4).getValues();return {ok:true,latest:last-1,events:rows.map(r=>({id:Number(r[0]),time:new Date(r[1]).getTime(),name:String(r[2]),kind:String(r[3])}))}}
function process_(q){if(q.action==='events')return getEvents_(q.after);const s=getSheet_(),values=s.getDataRange().getValues(),h=values[0],c=n=>col_(h,n);if(q.action==='stats'){
 const rows=values.slice(1).filter(r=>String(r[c('Name')]||'').trim());
 const presentRows=rows.filter(r=>norm_(r[c('Present')])==='yes');

 // EXACT dashboard classification requested:
 // Box 3: Registration Type = "Non Gianjyotian" only.
 // Box 2: every other PRESENT=YES donor.
 const nonGianRows=presentRows.filter(r=>norm_(r[c('Registration Type')])==='nongianjyotian');
 const gianRows=presentRows.filter(r=>norm_(r[c('Registration Type')])!=='nongianjyotian');

 return {
   ok:true,
   apiVersion:'NOOR-3BOX-V4',
   total:presentRows.length,
   present:presentRows.length,
   gianjyotianCount:gianRows.length,
   nonGianjyotianCount:nonGianRows.length,
   registeredRecords:rows.length
 };
}
if(q.action==='markPresent'){const name=norm_(q.name),course=norm_(q.course),sem=norm_(q.semester);for(let i=1;i<values.length;i++){if(norm_(values[i][c('Name')])===name&&norm_(values[i][c('Course')])===course&&norm_(values[i][c('Semester')])===sem){s.getRange(i+1,c('Present')+1).setValue('YES');s.getRange(i+1,c('Attendance Time')+1).setValue(new Date());const eventId=recordEvent_(values[i][c('Name')],'existing');return {ok:true,found:true,name:values[i][c('Name')],eventId}}}return {ok:true,found:false}}
if(q.action==='newRegistration'){const row=new Array(s.getLastColumn()).fill('');row[c('Name')]=q.name||'';row[c('Course')]=q.course||'';row[c('Semester')]=q.semester||'';row[c('Mobile')]=q.mobile||'';row[c('Already Registered')]='NO';row[c('Present')]='YES';row[c('Registration Type')]='New Entry';row[c('Attendance Time')]=new Date();s.appendRow(row);const eventId=recordEvent_(q.name,'new');return {ok:true,eventId}}
if(q.action==='outsiderRegistration'){const row=new Array(s.getLastColumn()).fill('');row[c('Name')]=q.name||'';row[c('Course')]='OUTSIDER';row[c('Semester')]='N/A';row[c('Mobile')]=q.mobile||'';row[c('Already Registered')]='NO';row[c('Present')]='YES';row[c('Registration Type')]='Non Gianjyotian';row[c('Attendance Time')]=new Date();if(c('Organization')>=0)row[c('Organization')]=q.organization||'';s.appendRow(row);const eventId=recordEvent_(q.name,'non-gianjyotian');return {ok:true,eventId}}
return {error:'Unknown action'}}
function doGet(e){try{const q=(e&&e.parameter)||{};const result=q.action?process_(q):{ok:true,message:'NOOR Blood Donation API is running'};return output_(result,q.callback)}catch(err){return output_({error:String(err&&err.message?err.message:err)},e&&e.parameter&&e.parameter.callback)}}
function doPost(e){try{const q=JSON.parse((e.postData&&e.postData.contents)||'{}');return output_(process_(q))}catch(err){return output_({error:String(err&&err.message?err.message:err)})}}
function output_(x,callback){const body=callback?callback+'('+JSON.stringify(x)+');':JSON.stringify(x);return ContentService.createTextOutput(body).setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON)}
function setupSheet(){const s=getSheet_();s.setFrozenRows(1);s.getRange(1,1,1,s.getLastColumn()).setFontWeight('bold');s.autoResizeColumns(1,s.getLastColumn());return 'Sheet ready'}
