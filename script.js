"use strict";
// GitHub Pages only. No server, Netlify, Cloudflare, database, or API calls.
// PDFs are AES-256-GCM encrypted BEFORE uploading. Parent codes are NEVER stored here.
const el = (id) => document.getElementById(id);
const i18n = {
  ar: {school:'مدرسة الطليعة | Al Talea School',switch:'English',title:'تحميل استبانة ولي الأمر',intro:'يرجى إدخال رقم هوية الطالبة ورمز الوصول الذي تم إرساله من المدرسة لتحميل الاستبانة الخاصة بها.',eid:'رقم الهوية الإماراتية للطالبة (15 رقمًا)',secret:'رمز الوصول الخاص',submit:'تنزيل ملف PDF',loading:'جارٍ البحث عن الملف وفك تشفيره...',note:'لحماية خصوصية الطالبات، يستخدم الموقع رقم الهوية ورمز وصول خاص. لا تشاركي الرمز مع الآخرين.',footer:'مدرسة الطليعة · PIRLS 2026',badInput:'يرجى إدخال رقم هوية صحيح (15 رقمًا) ورمز الوصول الخاص كما ورد من المدرسة.',noMatch:'رقم الهوية أو رمز الوصول غير صحيح. يرجى التحقق منهما والتواصل مع المدرسة عند الحاجة.',error:'تعذر تحميل الملف. تحققي من الاتصال بالإنترنت وأعيدي المحاولة.',success:'تم بدء تحميل الاستبانة.'},
  en: {school:'Al Talea School | مدرسة الطليعة',switch:'العربية',title:'Parent Survey Download',intro:'Enter your child’s Emirates ID and the private code issued by the school to download the corresponding PIRLS survey.',eid:'Student Emirates ID (15 digits)',secret:'Private access code',submit:'Download PDF',loading:'Finding and decrypting document...',note:'To protect students, this site requires an Emirates ID and a separate access code. Never share the code with others.',footer:'Al Talea School · PIRLS 2026',badInput:'Enter a valid 15-digit Emirates ID and the exact access code issued by the school.',noMatch:'The Emirates ID or access code is incorrect. Please check both or contact the school.',error:'Unable to download the PDF. Please check your internet connection and try again.',success:'The survey download has started.'}
};
let lang = 'ar';
function setText() {
  const t = i18n[lang];
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  for(const [id,key] of Object.entries({school:'school',pageTitle:'title',intro:'intro',eidLabel:'eid',secretLabel:'secret',downloadButton:'submit',note:'note',footer:'footer'})) el(id).textContent=t[key];
  el('langButton').textContent=t.switch;
  el('status').hidden=true;
}
el('langButton').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';setText();});
function status(text,kind){let x=el('status');x.textContent=text;x.className='status '+kind;x.hidden=false;}
function hex(arrayBuffer){return Array.from(new Uint8Array(arrayBuffer),x=>x.toString(16).padStart(2,'0')).join('');}
const encode=new TextEncoder();
async function hashBytes(text){return crypto.subtle.digest('SHA-256',encode.encode(text));}
async function downloadDocument(eid,code){
  const filename=hex(await hashBytes(`PIRLS2026-FILE-V1|${eid}|${code}`));
  const keyMaterial=await hashBytes(`PIRLS2026-KEY-V1|${eid}|${code}`);
  const key=await crypto.subtle.importKey('raw',keyMaterial,'AES-GCM',false,['decrypt']);
  const response=await fetch(`./encrypted/${filename}.bin`,{cache:'no-store',credentials:'omit'});
  if(!response.ok)throw new Error('NotFound');
  const data=new Uint8Array(await response.arrayBuffer());
  if(data.length<30)throw new Error('InvalidDocument');
  const aad=encode.encode(`PIRLS2026-IDENTITY-V1|${eid}`);
  const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:data.slice(0,12),additionalData:aad,tagLength:128},key,data.slice(12));
  const bytes=new Uint8Array(clear);
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')throw new Error('InvalidPDF');
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const link=document.createElement('a');link.href=url;link.download='PIRLS_2026_Parent_Survey.pdf';document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
el('downloadForm').addEventListener('submit',async (event)=>{
  event.preventDefault();
  const eid=el('eid').value.trim();
  const code=el('secret').value.toUpperCase().replace(/[\s-]/g,'');
  const t=i18n[lang];
  if(!/^\d{15}$/.test(eid)||! /^[A-F0-9]{32}$/.test(code)){status(t.badInput,'bad');return;}
  const button=el('downloadButton');button.disabled=true;button.textContent=t.loading;el('status').hidden=true;
  try{await downloadDocument(eid,code);status(t.success,'ok');el('secret').value='';}
  catch(err){status(err?.message==='NotFound'?t.noMatch:t.error,'bad');}
  finally{button.disabled=false;button.textContent=i18n[lang].submit;}
});
