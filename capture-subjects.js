(() => {
 const covers={front_cover:['כריכה קדמית','Front cover','Front-cover'],spine:['שדרה','Spine','Spine'],back_cover:['כריכה אחורית','Back cover','Back-cover']};
 const english=()=>globalThis.document?.documentElement?.lang!=='he';
 const side=s=>({'א':'a','ב':'b',r:'a',v:'b',a:'a',b:'b'}[s]||'');
 const single=(p,next=false)=>({layout:'single',subject_kind:next?(p.next_subject_kind||p.subject_kind||'folio'):(p.subject_kind||'folio'),daf:next?p.next_daf:p.daf,amud:next?(p.next_amud||'א'):p.amud,flyleaf_position:next?(p.next_flyleaf_position||p.flyleaf_position||'front'):(p.flyleaf_position||'front')});
 function one(p,en=english()){const kind=p.subject_kind||'folio';if(covers[kind])return covers[kind][en?1:0];const notation=en?String(p.daf)+(side(p.amud)==='a'?'r':'v'):String(p.daf)+' עמוד '+p.amud;if(kind==='flyleaf')return en?'Flyleaf '+notation+' ('+(p.flyleaf_position==='back'?'back':'front')+')':'דף מגן '+notation+' ('+(p.flyleaf_position==='back'?'אחורי':'קדמי')+')';return notation;}
 const label=p=>(p.layout||p.page_layout)==='spread'?one(single(p))+' — '+one(single(p,true)):one(p);
 function compactOne(p,he){const kind=p.subject_kind||'folio';if(covers[kind])return he?covers[kind][0].replaceAll(' ','-'):covers[kind][2];const d=String(p.daf||''),s=side(p.amud),n=/[א-ת]/.test(d)?d+' ע״'+(s==='a'?'א':'ב'):d+s;if(kind==='flyleaf')return (he?'דף-מגן-'+(p.flyleaf_position==='back'?'אחורי':'קדמי'):'Flyleaf-'+(p.flyleaf_position==='back'?'back':'front'))+'-'+n;return n;}
 const compact=p=>{const he=p.label_language==='he';return (p.layout||p.page_layout)==='spread'?compactOne(single(p),he)+'--'+compactOne(single(p,true),he):compactOne(p,he);};
 function apply(photo,p){for(const key of ['subject_kind','flyleaf_position','next_subject_kind','next_flyleaf_position','next_daf','next_amud'])delete photo[key];for(const key of ['subject_kind','flyleaf_position','next_subject_kind','next_flyleaf_position','next_daf','next_amud','daf','amud'])if(p[key]!==undefined)photo[key]=p[key];photo.page_layout=p.layout||'single';photo.folio=label(p);}
 globalThis.ManuscriptSubjects={single,label,compact,apply,isCover:kind=>!!covers[kind]};
})();