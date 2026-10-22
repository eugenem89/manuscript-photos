(() => {
 'use strict';
 const API='https://www.googleapis.com/drive/v3',UPLOAD='https://www.googleapis.com/upload/drive/v3/files',SCOPE='https://www.googleapis.com/auth/drive.file',APP='manuscript-photos-v1';
 const quote=value=>String(value).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
 const hash=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(b=>b.toString(16).padStart(2,'0')).join('');
 class ManuscriptDrive {
  constructor({photoOnly=false,clientId='',loadState=async()=>({ids:{}}),saveState=async()=>{},progress=()=>{}}={}){this.photoOnly=photoOnly;this.clientId=clientId;this.loadState=loadState;this.saveState=saveState;this.progress=progress;this.accessToken='';this.expiresAt=0;this.account='';this.state={ids:{}};this.tokenClient=null;}
  get connected(){return !!this.accessToken&&Date.now()<this.expiresAt;}
  prepare(){if(!this.clientId)throw Error('Google Drive has not been activated for this app yet. Photos stay on your phone.');if(!globalThis.google?.accounts?.oauth2)throw Error('Cannot open Google right now. Check your connection and try again.');if(!this.tokenClient)this.tokenClient=google.accounts.oauth2.initTokenClient({client_id:this.clientId,scope:SCOPE,callback:()=>{},error_callback:()=>this.connectionReject?.(Error('The connection window closed. Tap Connect Google Drive again.'))});}
  connect({selectAccount=false}={}){
   try{this.prepare();}catch(error){return Promise.reject(error);}
   return new Promise((resolve,reject)=>{
    this.tokenClient.callback=async response=>{try{if(response.error||!response.access_token)throw Error('Google connection was not completed. Photos remain on your phone.');this.accessToken=response.access_token;this.expiresAt=Date.now()+Math.max(0,Number(response.expires_in||3600)-60)*1000;const about=await this.json(API+'/about?fields=user(emailAddress)');if(!about.user?.emailAddress)throw Error('Cannot identify the backup account. Please reconnect.');this.account=about.user.emailAddress;this.state=await this.loadState(this.account)||{ids:{}};this.state.ids||={};resolve(this.account);}catch(error){this.accessToken='';reject(error);}};
    this.connectionReject=reject;this.tokenClient.error_callback=()=>reject(Error('The connection window closed or was blocked. Tap Connect Google Drive again.'));
    this.tokenClient.requestAccessToken({prompt:selectAccount?'select_account':''});
   });
  }
  async request(url,options={}){
   if(!this.connected)throw Error('Reconnect Google Drive. Photos remain on your phone.');
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
   try{const response=await fetch(url,{...options,headers:{...options.headers,Authorization:'Bearer '+this.accessToken},signal:controller.signal});if(response.status===401){this.accessToken='';throw Error('Reconnect Google Drive. Photos remain on your phone.');}return response;}catch(error){if(!this.connected)throw error;throw Error('Drive backup was not completed. Check your connection and try again; photos remain on your phone.');}finally{clearTimeout(timeout);}
  }
  async json(url,options={}){const response=await this.request(url,options);if(!response.ok)throw Error(response.status===403?'Google did not allow the backup. Check permissions and available account storage.':'Drive backup was not completed. Please try again.');return response.json();}
  async lookup(key,parent){const q="trashed = false and "+(parent?"'"+quote(parent)+"' in parents and ":'')+"appProperties has { key='app' and value='"+APP+"' } and appProperties has { key='key' and value='"+quote(key)+"' }";const result=await this.json(API+'/files?q='+encodeURIComponent(q)+'&fields=files(id,name,mimeType,size,sha256Checksum,parents,appProperties)&pageSize=100');return result.files?.[0]||null;}
  async folder(name,key,parent='root'){const existing=await this.lookup(key,parent);if(existing){if(existing.name!==name)await this.json(API+'/files/'+encodeURIComponent(existing.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});return existing.id;}const result=await this.json(API+'/files?fields=id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[parent],appProperties:{app:APP,key}})});return result.id;}
  async fileId(key){if(this.state.ids[key])return this.state.ids[key];const result=await this.json(API+'/files/generateIds?count=1&space=drive');if(!result.ids?.[0])throw Error('Cannot prepare a backup file. Please try again.');this.state.ids[key]=result.ids[0];await this.saveState(this.account,this.state);return result.ids[0];}
  async saveBlob(name,blob,parent,key){
   const digest=await hash(await blob.arrayBuffer()),existing=await this.lookup(key,parent)||await this.lookup(key);
   if(existing?.name===name&&existing.sha256Checksum===digest&&Number(existing.size)===blob.size&&existing.parents?.includes(parent))return existing.id;
   const id=existing?.id||await this.fileId(key),metadata={name,mimeType:blob.type||'application/octet-stream',appProperties:{app:APP,key}};
   let update=!!existing;if(!update){metadata.id=id;metadata.parents=[parent];}
   const initialize=()=>this.request(UPLOAD+(update?'/'+encodeURIComponent(id):'')+'?uploadType=resumable&fields=id,name'+(existing&&!existing.parents?.includes(parent)?'&addParents='+encodeURIComponent(parent)+'&removeParents='+encodeURIComponent((existing.parents||[]).join(',')):''),{method:update?'PATCH':'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':blob.type||'application/octet-stream','X-Upload-Content-Length':String(blob.size)},body:JSON.stringify(metadata)});
   let response=await initialize();
   if(response.status===409&&!update){update=true;delete metadata.id;delete metadata.parents;response=await initialize();}
   if(!response.ok)throw Error('Cannot start the backup. Please try again.');
   const session=response.headers.get('Location');if(!session||!session.startsWith('https://www.googleapis.com/'))throw Error('The upload was not authorized.');
   const size=1024*1024;let offset=0;
   while(offset<blob.size){const end=Math.min(offset+size,blob.size);response=await this.request(session,{method:'PUT',headers:{'Content-Type':blob.type||'application/octet-stream','Content-Range':'bytes '+offset+'-'+(end-1)+'/'+blob.size},body:blob.slice(offset,end)});if(response.status===308){const range=response.headers.get('Range');const last=range?.match(/bytes=0-(\d+)/);const accepted=last?Number(last[1])+1:0;if(accepted<=offset||accepted>end)throw Error('The upload stopped. Photos remain on your phone; please try again.');offset=accepted;}else if(response.ok){const result=await response.json();return result.id||id;}else throw Error('The upload was not completed. Photos remain on your phone; please try again.');}
   throw Error('Backup completion was not confirmed. Please try again.');
  }
  async jpeg(photo){
   if(!this.photoOnly||photo.mime==='image/jpeg')return photo;
   const bitmap=await createImageBitmap(photo.blob);try{const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.95));if(!blob)throw Error('Cannot prepare a JPG image. The original remains on this phone.');return {...photo,mime:'image/jpeg',blob};}finally{bitmap.close();}
  }
  async root(){return this.folder('כתבי יד','root');}
  async backup(manuscript,photos){
   if(!this.connected)throw Error('Tap Connect Google Drive to back up your photos.');
   const files=globalThis.ManuscriptFiles,root=await this.root(),folders=new Map(),ordered=files.number(photos);let lastFolder=root;
   for(let index=0;index<ordered.length;index++){
    const photo=await this.jpeg(ordered[index]),folderName=files.folder(photo),folderKey='library-date-'+(await hash(new TextEncoder().encode(folderName))).slice(0,32);
    if(!folders.has(folderKey))folders.set(folderKey,await this.folder(folderName,folderKey,root));
    const folder=folders.get(folderKey),name=files.filename(photo),stem=name.replace(/\.[^.]+$/,'');lastFolder=folder;this.progress(index+1,ordered.length);
    await this.saveBlob(name,photo.blob,folder,'image-'+photo.id);
    if(!this.photoOnly||String(photo.notes||'').trim())await this.saveBlob(stem+'.txt',new Blob([this.photoOnly?photo.notes:files.description(photo)],{type:'text/plain;charset=utf-8'}),folder,'description-'+photo.id);
    if(!this.photoOnly)await this.saveBlob(stem+'.json',new Blob([JSON.stringify(files.metadata(photo),null,2)],{type:'application/json'}),folder,'metadata-'+photo.id);
   }
   return {rootId:root,folderId:lastFolder,url:'https://drive.google.com/drive/folders/'+lastFolder,account:this.account,photos:ordered.length};
  }
 }
 globalThis.ManuscriptDrive=ManuscriptDrive;
})();
