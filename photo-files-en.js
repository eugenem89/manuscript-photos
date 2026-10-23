(() => {
 'use strict';
 const clean=(value,max=80)=>[...String(value||'').normalize('NFC').replace(/"/g,'״').replace(/[<>:/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/g,'')].slice(0,max).join('')||'Unnamed';
 const extension=p=>({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[p.mime]||'bin');
 const side=value=>({'א':'a','ב':'b',r:'a',v:'b',a:'a',b:'b'}[value]||'');
 const leaf=(daf,amud)=>{const d=String(daf).trim(),s=side(amud);return /[\u05d0-\u05ea]/.test(d)&&s?d+' ע״'+(s==='a'?'א':'ב'):d+s;};
 function compact(p){
  if(p.subject_kind&&p.subject_kind!=='folio')return ManuscriptSubjects.compact(p);
  if(p.daf&&side(p.amud)){const first=leaf(p.daf,p.amud);return p.page_layout==='spread'&&p.next_daf?first+'--'+leaf(p.next_daf,p.next_amud||'א'):first;}
  return String(p.folio||'').split(/\s*(?:--|—)\s*/).map(value=>{const match=value.trim().match(/^(.+?)(?:\s*(?:עמוד\s*|ע[״"]?\s*)?([אב])|([rvab]))$/i);return match?leaf(match[1],match[2]||match[3].toLowerCase()):value.trim();}).join('--');
 }
 const base=p=>clean(p.manuscript.repository||p.manuscript.label,60)+'_'+clean(p.manuscript.shelfmark||'No shelfmark',60)+'_'+clean(compact(p),80);
 const filename=p=>base(p)+'_'+String(Number.isInteger(p.file_sequence)&&p.file_sequence>0?p.file_sequence:1).padStart(3,'0')+'.'+extension(p);
 function number(photos){
  const rows=photos.map(p=>({...p})).sort((a,b)=>String(a.device_recorded_at||'').localeCompare(String(b.device_recorded_at||''))||a.id.localeCompare(b.id)),used=new Map();
  const group=p=>{const key=base(p).toLocaleLowerCase();if(!used.has(key))used.set(key,new Set());return used.get(key);};
  for(const p of rows){const taken=group(p);if(p.file_base===base(p)&&Number.isInteger(p.file_sequence)&&p.file_sequence>0&&!taken.has(p.file_sequence))taken.add(p.file_sequence);else delete p.file_sequence;}
  for(const p of rows){const taken=group(p);if(!p.file_sequence){p.file_sequence=1;while(taken.has(p.file_sequence))p.file_sequence++;taken.add(p.file_sequence);}p.file_base=base(p);p.saved_filename=filename(p);}
  return rows;
 }
 const prepare=(p,photos)=>number([...photos.filter(other=>other.id!==p.id),p]).find(other=>other.id===p.id);
 function date(p){if(/^\d{4}-\d{2}-\d{2}$/.test(p.local_date||''))return p.local_date;const d=new Date(p.device_recorded_at);if(Number.isNaN(d.getTime()))throw Error('Missing photograph date');return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 const folder=p=>{const [year,month,day]=date(p).split('-');return clean(p.manuscript.repository||p.manuscript.label,80)+'_'+day+month+year;};
 const metadata=p=>{const {blob,drive_account,drive_synced,...record}=p;return {...record,record_format:'manuscript-photo-v1',saved_filename:filename(p)};};
 const description=p=>['Library / collection: '+(p.manuscript.repository||''),'Shelfmark: '+(p.manuscript.shelfmark||''),'Folio / side: '+compact(p),'Notes: '+(p.notes||''),'Recorded on device: '+p.device_recorded_at,'Saved filename: '+filename(p),'Original filename: '+p.filename].join('\n');
 globalThis.ManuscriptFiles={clean,extension,filename,metadata,description,prepare,number,folder,date,compact,base};
})();
