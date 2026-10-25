(() => {
 'use strict';
 // Capture metadata only: no image alteration or automatic identification.
 const page=photo=>Object.fromEntries(['subject_kind','daf','amud','flyleaf_position','next_daf','next_amud','next_subject_kind','next_flyleaf_position'].filter(key=>photo[key]!==undefined).map(key=>[key,photo[key]]).concat([['layout',photo.page_layout||'single']]));
 const samePage=(a,b)=>a.daf!==undefined&&b.daf!==undefined?JSON.stringify(page(a))===JSON.stringify(page(b)):a.folio===b.folio;
 function mark(photo,enabled,source){
  photo.is_watermark=!!enabled;
  photo.mark_role=photo.capture_kind=enabled?'watermark':'manuscript';
  if(!enabled){delete photo.illumination;delete photo.watermark_pair_id;delete photo.watermark_source_id;return;}
  if(source&&source.manuscript.id===photo.manuscript.id&&samePage(source,photo)){
   photo.illumination='reflected';photo.watermark_pair_id=source.watermark_pair_id||source.id;photo.watermark_source_id=source.id;
  }else if(!photo.watermark_pair_id){photo.illumination='transmitted';photo.watermark_pair_id=photo.id;}
 }
 globalThis.ManuscriptWatermarks={mark,page};
})();
