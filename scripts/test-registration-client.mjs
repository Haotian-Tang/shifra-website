import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=await fs.readFile(new URL('../integrations/google-apps-script/Registration.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const requestId='12345678-1234-4123-8123-123456789abc';
const reference='SHIFRA-'+requestId.toUpperCase();
function fixture({type='abstract',method='upload',readError=false,syncError=false}={}){
  const controls=[],byId={},elements={},listeners={},rpcs=[],timers=new Map(),windowListeners={};let nextTimer=0,reads=0;
  function element(id,name,value='',extra={}){const el={id,name,value,disabled:false,hidden:false,checked:false,required:false,textContent:'',className:'',validity:'',files:[],addEventListener(event,fn){this.handlers??={};this.handlers[event]=fn;},setCustomValidity(value){this.validity=value;},focus(){this.focused=true;},...extra};if(id)byId[id]=el;if(name)elements[name]=el;controls.push(el);return el;}
  const form={elements,hidden:false,querySelectorAll(selector){if(selector==='[name=participation]')return [elements.participation];if(selector==='[name=abstractMethod]')return [elements.abstractMethod];return controls;},addEventListener(event,fn){listeners[event]=fn;},reportValidity(){return controls.every(el=>el.disabled||!el.validity);}};
  byId['registration-form']=form;
  element('request-id','requestId');element(null,'formVersion','5');element(null,'website');
  element('first-name','firstName','Ada');element('last-name','lastName','Lovelace');element('gender','gender','Prefer not to say');element('title','title');element('email','email','test@example.invalid');element('affiliation','affiliation','Test institute');element(null,'participation',type);element(null,'abstractMethod',method);element('abstract-title','abstractTitle','Test abstract');element('abstract-text','abstractText','Test abstract content');
  element('attachment','attachment','',{files:[{name:'摘要.pdf',size:4,bytes:Buffer.from([0,1,254,255])}]});element(null,'considerForTalk','yes');element('recording-consent','recordingConsent','yes',{checked:true});
  element('abstract-fields',null,'',{disabled:true});element('abstract-text-field');element('abstract-upload-field');element('submit-button');element('form-status');element('registration-success',null,'',{hidden:true});element('registration-reference');element('success-detail');
  class Reader{readAsDataURL(file){reads++;if(readError){queueMicrotask(()=>this.onerror());return;}queueMicrotask(()=>{this.result='data:application/pdf;base64,'+file.bytes.toString('base64');this.onload();});}}
  const runner={withSuccessHandler(success){return{withFailureHandler(fail){return{submitRegistration(payload){if(syncError)throw Error('Failed to fetch');rpcs.push({payload,success,fail});}};}};}};
  const window={google:{script:{run:runner}},top:{postMessage(){}},addEventListener(event,fn){windowListeners[event]=fn;}};
  const context={document:{getElementById:id=>byId[id],body:{getBoundingClientRect:()=>({height:500})}},window,google:window.google,crypto:{randomUUID:()=>requestId},ResizeObserver:class{observe(){}},FileReader:Reader,setTimeout(fn){const id=++nextTimer;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id)};
  vm.createContext(context);vm.runInContext(script,context);
  return {controls,byId,elements,rpcs,timers,windowListeners,get reads(){return reads;},async submit(){await listeners.submit({preventDefault(){}});},timeout(){const [id,fn]=[...timers].at(-1);timers.delete(id);fn();},setChoice(t,m){elements.participation.value=t;elements.abstractMethod.value=m;elements.participation.handlers.change();},form};
}
// Upload uses only a plain scalar/object payload, round-trips binary bytes, and snapshots before lock.
{
 const f=fixture();f.elements.title.disabled=true;await f.submit();assert.equal(f.rpcs.length,1);const p=f.rpcs[0].payload;
 assert.notEqual(p,f.form);assert.equal(p.formVersion,'5');assert.equal(p.firstName,'Ada');assert.equal(p.recordingConsent,'yes');assert.equal(p.considerForTalk,'yes');assert.equal(p.attachmentData.name,'摘要.pdf');assert.deepEqual(Buffer.from(p.attachmentData.base64,'base64'),Buffer.from([0,1,254,255]));assert.equal(p.abstractText,undefined);assert.equal(p.attachment,undefined);assert(Object.isFrozen(p));assert(Object.isFrozen(p.attachmentData));assert(f.controls.every(e=>e.disabled));
 await f.submit();assert.equal(f.rpcs.length,1,'Double submit while pending must not send');
 f.rpcs[0].fail(Error('Failed to fetch'));assert.match(f.byId['form-status'].textContent,/could not confirm receipt/);assert(!f.byId['form-status'].textContent.includes('Failed to fetch'));assert(f.byId['form-status'].textContent.includes(reference));assert.equal(f.byId['submit-button'].disabled,false);assert.equal(f.elements.firstName.disabled,true);
 // Even programmatic value changes must not alter an unknown-outcome retry.
 f.elements.firstName.value='Changed';await f.submit();assert.equal(f.rpcs.length,2);assert.equal(f.rpcs[1].payload,p);assert.equal(f.reads,1);assert.equal(f.rpcs[1].payload.firstName,'Ada');
 f.rpcs[0].success({ok:true,registrationId:reference,participation:'abstract'});assert.equal(f.form.hidden,false,'Ignore stale callback after retry');
 f.rpcs[1].success({ok:true,registrationId:reference,participation:'abstract'});assert.equal(f.form.hidden,true);assert.equal(f.byId['registration-success'].hidden,false);assert.equal(f.byId['registration-reference'].textContent,reference);
 let protectedUnload=false;f.windowListeners.beforeunload({preventDefault(){protectedUnload=true;}});assert.equal(protectedUnload,false,'Confirmed page can be closed');
}
// Timeout preserves exact retry payload and can still accept its delayed success.
{
 const f=fixture();await f.submit();f.timeout();assert.equal(f.elements.firstName.disabled,true);assert.equal(f.byId['submit-button'].disabled,false);let guarded=false;f.windowListeners.beforeunload({preventDefault(){guarded=true;}});assert(guarded);f.rpcs[0].success({ok:true,registrationId:reference,participation:'abstract'});assert(f.form.hidden);
}
// Pre-write validation rejections unlock original states and allow corrected data.
{
 const f=fixture();f.elements.title.disabled=true;const before=f.controls.map(e=>e.disabled);await f.submit();f.rpcs[0].fail(Error('Error: The attachment could not be read. Please select the file again and retry.'));assert.deepEqual(f.controls.map(e=>e.disabled),before);assert.match(f.byId['form-status'].textContent,/select the file again/);f.elements.firstName.value='Corrected';await f.submit();assert.equal(f.rpcs[1].payload.firstName,'Corrected');assert.equal(f.rpcs[1].payload.requestId,requestId);
}
// FileReader failures never invoke RPC, and permit reselection with values retained.
{
 const f=fixture({readError:true});const before=f.controls.map(e=>e.disabled);await f.submit();assert.equal(f.rpcs.length,0);assert.deepEqual(f.controls.map(e=>e.disabled),before);assert.match(f.byId['form-status'].textContent,/Nothing has been submitted/);assert.equal(f.elements.firstName.value,'Ada');
}
// A synchronous SDK exception resolves the UI immediately without a lingering timer.
{
 const f=fixture({syncError:true});await f.submit();assert.equal(f.timers.size,0);assert.equal(f.byId['submit-button'].disabled,false);assert.match(f.byId['form-status'].textContent,/could not confirm receipt/);assert.equal(f.elements.firstName.disabled,true);
}
// Audience/text never read an inactive attachment or send stale abstract inputs.
for(const [type,method] of [['audience','upload'],['abstract','text']]){
 const f=fixture({type,method});await f.submit();assert.equal(f.reads,0);const p=f.rpcs[0].payload;assert.equal(p.attachmentData,undefined);if(type==='audience'){assert.equal(p.abstractText,undefined);assert.equal(p.abstractTitle,undefined);assert.equal(p.considerForTalk,undefined);}else assert.equal(p.abstractText,'Test abstract content');
}
// Client file-size/content validation prevents an oversized request before file reading/RPC.
{
 const f=fixture();f.elements.attachment.files[0].size=10*1024*1024+1;await f.submit();assert.equal(f.reads,0);assert.equal(f.rpcs.length,0);assert.match(f.elements.attachment.validity,/10 MB/);
}
console.log('Passed: binary plain-object upload, frozen retry payload, double-submit prevention, stale callbacks, timeout/lost-reply recovery, validation unlock, local file errors, synchronous RPC failures, active-input isolation, oversized-file rejection.');
