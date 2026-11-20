import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const source=await fs.readFile(new URL('../integrations/google-apps-script/Code.gs',import.meta.url),'utf8');
const headers=['Registration ID','','','','','','','','','','','','Request ID','First name','Last name','Gender','Title','Consider for 10-min talk','Recording consent','Consent recorded at (UAE)','Consent wording version'];
const rows=[headers];
let writes=0, serverNow=Date.parse('2026-11-18T10:00:00+04:00');
let decodeCalls=0, failDecode=false, wrongDecodedLength=false, failBeforeRowOnce=false, failAfterRowOnce=false, locks=0, releases=0;
class ServerDate extends Date {constructor(...args){super(...(args.length?args:[serverNow]));}static now(){return serverNow;}}
class File {constructor(name,contents){this.name=name;this.contents=contents;}getUrl(){return `https://drive.google.com/file/d/${this.name}`;}setContent(value){writes++;this.contents=value;return this;}}
class Folder {constructor(){this.files=new Map();this.folders=new Map();}getUrl(){return 'https://drive.google.com/drive/folders/test';}getFoldersByName(name){return iterator(this.folders.has(name)?[this.folders.get(name)]:[]);}createFolder(name){writes++;const folder=new Folder();this.folders.set(name,folder);return folder;}getFilesByName(name){return iterator(this.files.has(name)?[this.files.get(name)]:[]);}createFile(name,value){writes++;if(typeof name==='object'){value=name.bytes;name=name.name;}const file=new File(name,value);this.files.set(name,file);return file;}}
function iterator(items){return{hasNext:()=>items.length>0,next:()=>items.shift()};}
const folder=new Folder();
const sheet={getLastRow:()=>rows.length,setRowHeight(){},getRange(a,b){let r=a,c=b;if(typeof a==='string'){r=1;c=a.charCodeAt(0)-64;}const range={getValue:()=>rows[r-1]?.[c-1],setValues(values){if(failBeforeRowOnce){failBeforeRowOnce=false;throw new Error('Simulated failure before row write');}writes++;for(let i=0;i<values.length;i++)rows[r-1+i]=values[i];if(failAfterRowOnce){failAfterRowOnce=false;throw new Error('Simulated lost confirmation after row write');}return range;},setNumberFormat:()=>range,setFontFamily:()=>range,setFontSize:()=>range,setVerticalAlignment:()=>range,setWrap:()=>range,createTextFinder(id){return{matchEntireCell(){return this;},findNext(){const index=rows.findIndex((row,i)=>i>0&&row[12]===id);return index<0?null:{getRow:()=>index+1};}};}};return range;}};
const context={Date:ServerDate,console:{error(){}},DriveApp:{getFolderById:id=>{assert.equal(id,'__SUBMISSION_FOLDER_ID__');return folder;}},SpreadsheetApp:{openById:id=>{assert.equal(id,'__SPREADSHEET_ID__');return{getSheetByName:name=>{assert.equal(name,'Registrations');return sheet;}};},flush(){}},LockService:{getScriptLock:()=>({tryLock(){locks++;return true;},releaseLock(){releases++;}})},MimeType:{PLAIN_TEXT:'text/plain'},Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,bytes)=>Array.from(crypto.createHash('sha256').update(Buffer.from(bytes)).digest()),base64Decode(encoded){decodeCalls++;if(failDecode)throw new Error('Simulated decoder rejection');const bytes=Buffer.from(encoded,'base64');return Array.from(wrongDecodedLength?bytes.subarray(1):bytes,value=>value>127?value-256:value);},newBlob(bytes,type,name){const result=blob(name,bytes);result.type=type;return result;}}};
vm.createContext(context);vm.runInContext(source,context);
const form=(participation='audience')=>({formVersion:'5',firstName:'Ada',lastName:'Lovelace',gender:'Prefer not to say',title:'',email:'shifra-test@example.invalid',affiliation:'Integration test',participation,requestId:crypto.randomUUID(),recordingConsent:'yes',...(participation==='abstract'?{abstractTitle:'Test abstract',abstractMethod:'text',abstractText:'Artificial integration test abstract.',considerForTalk:'no'}:{})});
const blob=(name='abstract.pdf',bytes=Array.from(Buffer.from('%PDF-1.4 test fixture')))=>({name,bytes,getBytes(){return this.bytes;},getName(){return this.name;},setName(value){this.name=value;return this;}});
const encodedUpload=(name='abstract.pdf',bytes=Buffer.from('%PDF-1.4 test fixture'))=>({...form('abstract'),abstractMethod:'upload',attachmentData:{name,base64:Buffer.from(bytes).toString('base64')}});
const findRow=id=>rows.find(row=>row[12]===id);
const latestFolder=()=>[...folder.folders.values()].at(-1);
const latestMetadata=()=>JSON.parse(latestFolder().files.get('registration.json').contents);
function rejectNoWrites(input,pattern){const before=writes,count=rows.length,folders=folder.folders.size;assert.throws(()=>context.submitRegistration(input),pattern);assert.equal(writes,before,'Invalid submission must not write any file or cell');assert.equal(rows.length,count);assert.equal(folder.folders.size,folders);}

// Existing records can retrieve their receipt without migrating or fabricating consent.
for(const version of ['', '4']){
 const requestId=crypto.randomUUID();const saved=Array(21).fill('');saved[0]='SHIFRA-'+requestId.toUpperCase();saved[2]='Legacy person';saved[5]='Abstract submission';saved[12]=requestId;saved[18]=version?'No':'Not provided';saved[20]=version?'recording-v1':'';rows.push(saved);
 const snapshot=JSON.stringify(saved),before=writes;
 const receipt=context.submitRegistration({requestId,formVersion:version});assert.equal(receipt.registrationId,saved[0]);assert.equal(receipt.participation,'abstract');assert.equal(receipt.duplicate,true);assert.equal(JSON.stringify(saved),snapshot);assert.equal(writes,before);
 rejectNoWrites({...form(),formVersion:version},/form has been updated/);
}
rejectNoWrites({...form(),formVersion:'6'},/form has been updated/);
for(const gender of ['', 'unexpected'])rejectNoWrites({...form(),gender},/choose a gender/);
for(const recordingConsent of [undefined,'','no','true'])rejectNoWrites({...form(),recordingConsent},/Recording consent is required/);
rejectNoWrites({...form(),firstName:' '},/first name and last name/);
rejectNoWrites({...form(),lastName:''},/first name and last name/);
rejectNoWrites({...form(),email:'invalid'},/valid email/);
rejectNoWrites({...form(),affiliation:' '},/affiliation/);
rejectNoWrites({...form(),title:'x'.repeat(81)},/too long/);
rejectNoWrites({...form(),requestId:'not-a-uuid'},/reload/);
rejectNoWrites({...form(),website:'bot'},/reload/);
rejectNoWrites({...form('abstract'),abstractTitle:' '},/abstract title/);
for(const abstractMethod of ['', 'both','invalid'])rejectNoWrites({...form('abstract'),abstractMethod},/choose Text or Upload/);
rejectNoWrites({...form('abstract'),abstractText:' ',attachment:blob()},/abstract text/);
rejectNoWrites({...form('abstract'),abstractMethod:'upload',attachment:undefined},/upload your abstract document/);
rejectNoWrites({...form('abstract'),abstractMethod:'upload',attachment:blob('empty.txt',[])},/upload your abstract document/);
rejectNoWrites({...form('abstract'),abstractMethod:'upload',attachment:blob('program.exe',[1])},/PDF, Word/);
rejectNoWrites({...form('abstract'),abstractMethod:'upload',attachment:blob('large.pdf',new Uint8Array(10*1024*1024+1))},/10 MB/);
rejectNoWrites({...form('abstract'),abstractText:'x'.repeat(30001)},/too long/);
for(const considerForTalk of ['', 'maybe'])rejectNoWrites({...form('abstract'),considerForTalk},/choose Yes or No/);

const audience=form();const audienceReceipt=context.submitRegistration(audience);const audienceRow=findRow(audience.requestId);
assert.equal(audienceReceipt.ok,true);assert.equal(audienceRow.length,21);assert.equal(audienceRow[2],'Ada Lovelace');assert.equal(audienceRow[5],'Audience');assert.equal(audienceRow[10],'Registered');assert.deepEqual(Array.from(audienceRow.slice(13,17)),['Ada','Lovelace','Prefer not to say','']);assert.equal(audienceRow[17],'Not applicable');assert.equal(audienceRow[18],'Yes');assert.equal(audienceRow[19].getTime(),serverNow);assert.equal(audienceRow[20],'recording-v1');
let metadata=latestMetadata();assert.equal(metadata.abstractMethod,'');assert.equal(metadata.formVersion,'5');assert.equal(metadata.consentRequired,true);assert.equal(metadata.consentDefaultChecked,true);
const consentWording='I understand that the SHIFRA Symposium may be audio- and video-recorded. I consent to the recording of my participation and to the use of these recordings by the SHIFRA organisers for symposium documentation and educational purposes.';
assert.equal(metadata.consentWording,consentWording);assert.equal(metadata.consentRecordedAt,new Date(serverNow).toISOString());

const textForm={...form('abstract'),considerForTalk:'yes',attachment:blob()};context.submitRegistration(textForm);
assert.equal(findRow(textForm.requestId)[7],textForm.abstractText);assert.equal(findRow(textForm.requestId)[8],'');assert.equal(findRow(textForm.requestId)[17],'Yes');assert.equal(latestMetadata().abstractMethod,'text');assert.equal(latestFolder().files.size,2);assert.equal(latestFolder().files.get('abstract.txt').contents,textForm.abstractTitle+'\n\n'+textForm.abstractText);
const uploadForm={...form('abstract'),abstractMethod:'upload',abstractText:'Inactive stale text',attachment:blob()};context.submitRegistration(uploadForm);
assert.equal(findRow(uploadForm.requestId)[7],'');assert(findRow(uploadForm.requestId)[8].includes('abstract.pdf'));assert.equal(findRow(uploadForm.requestId)[17],'No');assert.equal(latestMetadata().abstractMethod,'upload');assert.equal(latestMetadata().abstractText,'');assert(!latestFolder().files.has('abstract.txt'));
const uploadSaved=JSON.stringify(findRow(uploadForm.requestId)),jsonSaved=latestFolder().files.get('registration.json').contents,beforeRetry=writes;
context.submitRegistration({...uploadForm,abstractText:'Changed',considerForTalk:'yes',recordingConsent:''});assert.equal(writes,beforeRetry);assert.equal(JSON.stringify(findRow(uploadForm.requestId)),uploadSaved);assert.equal(latestFolder().files.get('registration.json').contents,jsonSaved);

// Plain-object uploads preserve raw bytes and use server-derived MIME types.
const binary=Buffer.from([0,1,2,127,128,255,13,10]);
for(const [name,type] of [['Résumé.PDF','application/pdf'],['abstract.doc','application/msword'],['abstract.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],['abstract.txt','text/plain']]){
 const input=encodedUpload(name,binary);input.attachmentData.mimeType='text/html';input.abstractText='Inactive stale text';
 const decoded=context.registrationUpload_(input);assert.equal(decoded.type,type);assert.equal(decoded.getName(),name);assert.deepEqual(Buffer.from(decoded.getBytes()),binary);
 const receipt=context.submitRegistration(input);assert.equal(receipt.ok,true);assert.equal(findRow(input.requestId)[7],'');assert.equal(latestMetadata().originalFileName,name);assert.deepEqual(Buffer.from(latestFolder().files.get(latestMetadata().savedFileName).contents),binary);
 const before=writes,calls=decodeCalls;const retry=context.submitRegistration({requestId:input.requestId,attachmentData:{name:'invalid.exe',base64:'not base64'}});assert.equal(retry.duplicate,true);assert.equal(writes,before);assert.equal(decodeCalls,calls,'Saved receipts must not require decoding an attachment again');
}
for(const participation of ['audience','abstract']){
 const input={...form(participation),attachmentData:{name:'invalid.exe',base64:'not base64'}};const calls=decodeCalls;context.submitRegistration(input);assert.equal(decodeCalls,calls,'Inactive upload data must be ignored');
}
const unreadable=/attachment could not be read/;
for(const attachmentData of [null,[],true,'file',{}, {name:'',base64:'Zg=='},{name:'x'.repeat(501)+'.pdf',base64:'Zg=='},{name:'file.pdf',base64:[]},{name:7,base64:'Zg=='}])rejectNoWrites({...encodedUpload(),attachmentData},unreadable);
for(const base64 of ['Zg','Zg=','Z===','====','Z=g=','Zg==\n','Zg==\n\n\n\n',' Zg==','Zg== ','data:application/pdf;base64,Zg==','-w==','_w==','Zh==','Zm9=','💾==']){
 const calls=decodeCalls;rejectNoWrites({...encodedUpload(),attachmentData:{name:'file.pdf',base64}},unreadable);assert.equal(decodeCalls,calls,'Malformed input must be rejected before decoding');
}
rejectNoWrites({...encodedUpload(),attachmentData:{name:'file.pdf',base64:''}},/upload your abstract document/);
for(const name of ['file.exe','file.__proto__','file.constructor'])rejectNoWrites(encodedUpload(name),/PDF, Word/);
const maxBytes=10*1024*1024;
const callsBeforeLarge=decodeCalls;
rejectNoWrites(encodedUpload('too-large.pdf',Buffer.alloc(maxBytes+1)),/10 MB/); // Same encoded length as exactly 10 MiB; decoded length check matters.
rejectNoWrites(encodedUpload('too-large.pdf',Buffer.alloc(maxBytes+3)),/10 MB/);
assert.equal(decodeCalls,callsBeforeLarge,'Oversized input must be rejected before allocating decoded bytes');
const maximum=encodedUpload('maximum.pdf',Buffer.alloc(maxBytes,255));context.submitRegistration(maximum);assert.equal(latestFolder().files.get(latestMetadata().savedFileName).contents.length,maxBytes);
failDecode=true;rejectNoWrites(encodedUpload(),unreadable);failDecode=false;
wrongDecodedLength=true;rejectNoWrites(encodedUpload(),unreadable);wrongDecodedLength=false;

// A failure before the row write must reuse the existing file and folder on retry.
const partial=encodedUpload('partial.pdf',binary),rowsBeforePartial=rows.length,foldersBeforePartial=folder.folders.size;
failBeforeRowOnce=true;assert.throws(()=>context.submitRegistration(partial),/could not confirm/);assert.equal(rows.length,rowsBeforePartial);assert.equal(folder.folders.size,foldersBeforePartial+1);
const partialFolder=latestFolder(),partialFiles=[...partialFolder.files.values()];context.submitRegistration(partial);assert.equal(rows.length,rowsBeforePartial+1);assert.equal(folder.folders.size,foldersBeforePartial+1);assert.equal(partialFolder.files.size,2);assert.deepEqual([...partialFolder.files.values()],partialFiles);
// The row can commit before confirmation fails. Retry with its ID must return the immutable receipt without more writes.
const uncertain=encodedUpload('uncertain.pdf',binary);failAfterRowOnce=true;assert.throws(()=>context.submitRegistration(uncertain),/could not confirm/);assert(findRow(uncertain.requestId));
const writesAfterCommit=writes,decodesAfterCommit=decodeCalls,rowsAfterCommit=rows.length;const recovered=context.submitRegistration({requestId:uncertain.requestId});assert.equal(recovered.duplicate,true);assert.equal(recovered.registrationId,'SHIFRA-'+uncertain.requestId.toUpperCase());assert.equal(writes,writesAfterCommit);assert.equal(rows.length,rowsAfterCommit);assert.equal(decodeCalls,decodesAfterCommit);
const safeForm={...form(),firstName:'=1+1',title:'@unsafe'};context.submitRegistration(safeForm);assert.equal(findRow(safeForm.requestId)[13],"'=1+1");assert.equal(findRow(safeForm.requestId)[16],"'@unsafe");
const samePrefix1={...form(),requestId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},samePrefix2={...form(),requestId:'aaaaaaaa-aaaa-4aaa-8aaa-bbbbbbbbbbbb'};
assert.notEqual(context.submitRegistration(samePrefix1).registrationId,context.submitRegistration(samePrefix2).registrationId);
serverNow=Date.parse('2026-11-24T23:59:59.999+04:00');const lastMinute=form('abstract');const lastReceipt=context.submitRegistration(lastMinute);
serverNow=Date.parse('2026-11-25T00:00:00+04:00');rejectNoWrites(form('abstract'),/Abstract submissions closed/);assert.equal(context.submitRegistration({requestId:lastMinute.requestId,formVersion:'4'}).registrationId,lastReceipt.registrationId);assert.equal(context.submitRegistration(form()).ok,true);

const html=await fs.readFile(new URL('../integrations/google-apps-script/Registration.html',import.meta.url),'utf8');new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert(html.includes(consentWording));assert.match(html,/<input type="hidden" name="formVersion" value="5">/);
const consent=html.match(/<input[^>]+name="recordingConsent"[^>]*>/)[0];assert.match(consent,/checked/);assert.match(consent,/required/);
assert.match(html.match(/<select[^>]+name="gender"[^>]*>/)[0],/required/);assert.match(html.match(/<input[^>]+name="abstractTitle"[^>]*>/)[0],/required/);
for(const input of html.matchAll(/<input[^>]+name="(?:considerForTalk|abstractMethod)"[^>]*>/g)){assert.match(input[0],/required/);assert.doesNotMatch(input[0],/checked/);}
assert.equal(locks,releases,'Every acquired registration lock must be released, including validation and partial-write failures');
console.log('Passed: v5 required fields and consent, legacy Blob and canonical base64 uploads, binary/MIME preservation, exact 10 MiB boundary, inactive input isolation, no writes on invalid input, 21-column preservation, immutable receipts, partial-write/unknown-outcome retries, lock release, deadlines, formula escaping, and browser script syntax.');
