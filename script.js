'use strict';
const API_URL = '/api/generate';
const VOICES = [
  {id:'6843639bb79c4b0ba2c15307280465ca',name:'صوت بنية',detail:'صوت أنثوي طبيعي',emoji:'👧'},
  {id:'baeba69bf83d47f9adb0e66e8f8f1658',name:'صوت والد',detail:'صوت رجولي دافئ',emoji:'👨'},
  {id:'8ea1c102258b4496b2234e6e7d20b5c2',name:'صوت بنية خدرانة',detail:'نبرة هادئة وناعمة',emoji:'😴'},
  {id:'060bb46361764a668119db1f06f00982',name:'صوت حلو',detail:'نبرة مميزة',emoji:'✨'}
];
const $ = id => document.getElementById(id);
let selected = 0;
let generating = false;
const urls = [];
const voiceList = $('voices');
function renderVoices(){voiceList.innerHTML='';VOICES.forEach((voice,i)=>{const b=document.createElement('button');b.type='button';b.className='voice'+(selected===i?' active':'');b.setAttribute('aria-pressed',String(selected===i));b.innerHTML=`<span class="emoji">${voice.emoji}</span><strong>${voice.name}</strong><small>${voice.detail}</small><span class="tick">${selected===i?'✓':'○'}</span>`;b.addEventListener('click',()=>{selected=i;renderVoices()});voiceList.appendChild(b)})}
renderVoices();
$('text').addEventListener('input',()=>{$('counter').textContent=`${$('text').value.length} / 500`});
function message(t,type=''){$('message').textContent=t;$('message').className='hint '+type}
async function synthesize(voice,text){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),90000);
  try{const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,reference_id:voice.id,format:'mp3'}),signal:controller.signal});
    if(!response.ok){const detail=(await response.text()).slice(0,180);throw new Error(`HTTP ${response.status}: ${detail}`)}
    const blob=await response.blob();if(!blob.size)throw new Error('الاستجابة الصوتية فارغة');return blob;
  }finally{clearTimeout(timer)}
}
function addResult(voice,blob){const url=URL.createObjectURL(blob);urls.push(url);$('results').hidden=false;const card=document.createElement('div');card.className='result-card';const meta=document.createElement('div');meta.className='meta';const name=document.createElement('strong');name.textContent=voice.emoji+' '+voice.name;const sub=document.createElement('small');sub.textContent='MP3 • جاهز للاستماع';meta.append(name,sub);const audio=document.createElement('audio');audio.controls=true;audio.src=url;const link=document.createElement('a');link.className='download';link.href=url;link.download=`fish-${voice.id.slice(0,8)}-${Date.now()}.mp3`;link.textContent='↓ تحميل MP3';card.append(meta,audio,link);$('resultItems').prepend(card);const copy=card.cloneNode(true);$('historyItems').querySelector('.empty')?.remove();$('historyItems').prepend(copy)}
async function generate(all=false){if(generating)return;const text=$('text').value.trim();if(!text){message('اكتب النص أولاً حتى نولّد الصوت.','error');$('text').focus();return}if(text.length>500){message('الحد الأقصى 500 حرف.','error');return}generating=true;$('generate').disabled=true;$('generateAll').disabled=true;const targets=all?VOICES:[VOICES[selected]];let ok=0;try{for(let i=0;i<targets.length;i++){const voice=targets[i];message(`جاري توليد ${voice.name} (${i+1}/${targets.length})...`);try{const blob=await synthesize(voice,text);addResult(voice,blob);ok++}catch(e){const reason=e.name==='AbortError'?'انتهت مهلة الطلب':e instanceof TypeError?'تعذر الاتصال بالخدمة؛ قد يكون المتصفح يمنع الاتصال المباشر (CORS) أو توجد مشكلة شبكة':e.message;message(`فشل ${voice.name}: ${reason}`,'error');if(!all)break}}if(ok===targets.length)message(`تم توليد ${ok} تسجيل بنجاح ✓`,'ok');else if(ok)message(`نجح ${ok} من أصل ${targets.length} تسجيلات. راجع النتائج.`,'error')}finally{generating=false;$('generate').disabled=false;$('generateAll').disabled=false}}
$('generate').addEventListener('click',()=>generate(false));$('generateAll').addEventListener('click',()=>generate(true));$('clearHistory').addEventListener('click',()=>{$('historyItems').innerHTML='<p class="empty">ماكو تسجيلات بعد.</p>'});window.addEventListener('pagehide',()=>urls.forEach(u=>URL.revokeObjectURL(u)));window.addEventListener('load',()=>setTimeout(()=>$('splash').classList.add('hide'),900));
