const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function load(){const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'watermark-protocol.js'),'utf8'),context);return context.ManuscriptWatermarks;}
test('paired reference preserves exact manuscript/page and records lighting without claiming enhancement',()=>{
 const wm=load(),source={id:'first',manuscript:{id:'ms1',shelfmark:'42'},folio:'12a',daf:'12',amud:'א',page_layout:'single'};
 wm.mark(source,true);assert.equal(source.illumination,'transmitted');assert.equal(source.watermark_pair_id,'first');
 const next={id:'second',manuscript:{id:'ms1'},folio:'12a'};wm.mark(next,true,source);
 assert.equal(next.illumination,'reflected');assert.equal(next.watermark_pair_id,'first');assert.equal(next.watermark_source_id,'first');
 const other={id:'third',manuscript:{id:'other'},folio:'12a'};wm.mark(other,true,source);assert.equal(other.illumination,'transmitted');assert.equal(other.watermark_pair_id,'third');
 const page={id:'fourth',manuscript:{id:'ms1'},folio:'13a'};wm.mark(page,true,source);assert.equal(page.illumination,'transmitted');
 wm.mark(next,false);assert.equal(next.is_watermark,false);assert.equal(next.watermark_pair_id,undefined);
});
test('backup routes watermark pairs below shelfmark, keeps ordinary photo routing and records pair metadata',async()=>{
 const context=vm.createContext({TextEncoder,Blob,crypto:require('node:crypto').webcrypto});
 for(const file of ['capture-subjects.js','photo-files.js','drive-backup.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
 const folders=[],saved=[],d=new context.ManuscriptDrive({photoOnly:true});d.accessToken='test';d.expiresAt=Date.now()+10000;d.account='test';d.root=async()=> 'root';d.folder=async(name,key,parent)=>{folders.push({name,key,parent});return key;};d.saveBlob=async(name,blob,parent,key)=>{saved.push({name,blob,parent,key});};
 const ms={id:'ms',repository:'Library',shelfmark:'42'},photo={id:'one',manuscript:ms,daf:'12',amud:'א',folio:'12a',mime:'image/jpeg',blob:new Blob(['photo']),local_date:'2026-10-25',device_recorded_at:'2026-10-25T12:00:00Z',is_watermark:true,watermark_pair_id:'one',illumination:'transmitted'};
 await d.backup(ms,[photo]);assert(folders.some(f=>f.name==='42'));assert(folders.some(f=>f.name==='Watermarks'&&f.parent.includes('shelfmark')));assert(saved.some(f=>f.name.endsWith('.json')));const metadata=JSON.parse(await saved.find(f=>f.name.endsWith('.json')).blob.text());assert.equal(metadata.watermark_pair_id,'one');assert.equal(metadata.illumination,'transmitted');
 folders.length=0;saved.length=0;await d.backup(ms,[{...photo,id:'normal',is_watermark:false}]);assert.equal(folders.length,1);assert.equal(saved.length,1);
});
