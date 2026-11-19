// Deploy as the owner, with access set to Anyone. These IDs are configured only in Apps Script.
const REGISTRATION_STORE = {
  spreadsheetId: '__SPREADSHEET_ID__',
  folderId: '__SUBMISSION_FOLDER_ID__',
};
// The full 11:59 PM minute on 24 November is included (UAE / GST, UTC+4).
const ABSTRACT_CUTOFF = Date.parse('2026-11-25T00:00:00+04:00');
const RECORDING_CONSENT_VERSION = 'recording-v1';
const RECORDING_CONSENT_TEXT = 'I understand that the SHIFRA Symposium may be audio- and video-recorded. I consent to the recording of my participation and to the use of these recordings by the SHIFRA organisers for symposium documentation and educational purposes.';

function doGet(e) {
  if (e && e.parameter && e.parameter.view === 'unique-counter') return uniqueCounterResponse_(e.parameter.nonce, e.parameter.visitor);
  if (e && e.parameter && e.parameter.view === 'site-counter') return siteCounterResponse_(e.parameter.nonce);
  return HtmlService.createHtmlOutputFromFile('Registration')
    .setTitle('Register for SHIFRA')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uniqueCounterResponse_(nonce, visitor) {
  const payload = {type: 'shifra:unique-visitors', nonce: '', ok: false};
  if (typeof nonce === 'string' && nonce.length === 32 && /^[a-f0-9]{32}$/.test(nonce)) {
    payload.nonce = nonce;
    const readOnly = visitor === undefined || visitor === null || visitor === '';
    if (readOnly || (typeof visitor === 'string' && visitor.length === 32 && /^[a-f0-9]{32}$/.test(visitor))) {
      try {
        payload.count = uniqueVisitorTotal_(readOnly ? null : visitor);
        payload.ok = true;
      } catch (error) {
        // Preserve existing totals on failure; never manufacture a replacement identity.
      }
    }
  }
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.top.postMessage(' + JSON.stringify(payload) + ',"https://shifra.ae");</script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setTitle('SHIFRA unique visitors')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uniqueVisitorTotal_(visitor) {
  const hash = visitor === null ? null : Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, visitor)
    .map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('').slice(0, 32);
  const prefix = 'SHIFRA_UNIQUE_VISITORS_V1_';
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(100)) throw new Error('Visitor counter is busy.');
  try {
    const properties = PropertiesService.getScriptProperties();
    const stored = properties.getProperties();
    const shards = Object.create(null);
    let count = 0;
    let storageBytes = 0;
    for (const name of Object.keys(stored)) {
      if (!name.startsWith(prefix)) continue;
      const shard = name.slice(prefix.length);
      if (shard.length !== 2 || !/^[a-f0-9]{2}$/.test(shard)) throw new Error('Invalid visitor shard.');
      const raw = stored[name];
      if (typeof raw !== 'string' || raw.length > 8000) throw new Error('Invalid visitor shard.');
      const hashes = JSON.parse(raw);
      if (!Array.isArray(hashes)) throw new Error('Invalid visitor shard.');
      const seen = new Set();
      for (const value of hashes) {
        if (typeof value !== 'string' || value.length !== 32 || !/^[a-f0-9]{32}$/.test(value) || !value.startsWith(shard) || seen.has(value)) throw new Error('Invalid visitor shard.');
        seen.add(value);
      }
      // Validated hexadecimal JSON and fixed property names contain only ASCII.
      storageBytes += name.length + raw.length;
      if (storageBytes > 400000) throw new Error('Visitor counter storage is full.');
      shards[shard] = hashes;
      count += hashes.length;
    }
    if (hash === null) return count;
    const shard = hash.slice(0, 2);
    const hashes = shards[shard] || [];
    if (hashes.includes(hash)) return count;
    const name = prefix + shard;
    const next = JSON.stringify(hashes.concat(hash));
    const priorBytes = Object.prototype.hasOwnProperty.call(stored, name) ? name.length + stored[name].length : 0;
    if (next.length > 8000 || storageBytes - priorBytes + name.length + next.length > 400000) throw new Error('Visitor counter storage is full.');
    // The count is derived from these sets, so a single shard write is atomic.
    properties.setProperty(name, next);
    return count + 1;
  } finally {
    lock.releaseLock();
  }
}

function siteCounterResponse_(nonce) {
  const payload = {type: 'shifra:page-views', nonce: '', ok: false};
  // Only a fixed-length random hexadecimal value is echoed into this response.
  if (typeof nonce === 'string' && /^[a-f0-9]{32}$/.test(nonce)) {
    payload.nonce = nonce;
    try {
      payload.count = incrementSitePageViews_();
      payload.ok = true;
    } catch (error) {
      // An optional counter failure must not affect registration or invent a total.
    }
  }
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.top.postMessage(' + JSON.stringify(payload) + ',"https://shifra.ae");</script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setTitle('SHIFRA page views')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function incrementSitePageViews_() {
  const lock = LockService.getScriptLock();
  // Registration uses this same lock; never queue counter requests behind it.
  if (!lock.tryLock(100)) throw new Error('Page counter is busy.');
  try {
    const properties = PropertiesService.getScriptProperties();
    const raw = properties.getProperty('SHIFRA_PAGE_VIEWS_V1');
    if (raw !== null && (typeof raw !== 'string' || !/^(0|[1-9][0-9]*)$/.test(raw))) throw new Error('Invalid page count.');
    const count = raw === null ? 0 : Number(raw);
    if (!Number.isSafeInteger(count) || count < 0 || count >= Number.MAX_SAFE_INTEGER) throw new Error('Invalid page count.');
    const next = count + 1;
    properties.setProperty('SHIFRA_PAGE_VIEWS_V1', String(next));
    return next;
  } finally {
    lock.releaseLock();
  }
}

function submitRegistration(form) {
  const receivedAt = new Date();
  const requestId = String(form && form.requestId || '');
  if (!form || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId) || form.website) throw new Error('Please reload the form and try again.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Registration is busy. Please try again in a moment.');
  try {
    const book = SpreadsheetApp.openById(REGISTRATION_STORE.spreadsheetId);
    const sheet = book.getSheetByName('Registrations');
    if (!sheet || sheet.getRange('A1').getValue() !== 'Registration ID' || sheet.getRange('M1').getValue() !== 'Request ID' || sheet.getRange('N1').getValue() !== 'First name' || sheet.getRange('O1').getValue() !== 'Last name' || sheet.getRange('P1').getValue() !== 'Gender' || sheet.getRange('Q1').getValue() !== 'Title' || sheet.getRange('R1').getValue() !== 'Consider for 10-min talk' || sheet.getRange('S1').getValue() !== 'Recording consent' || sheet.getRange('T1').getValue() !== 'Consent recorded at (UAE)' || sheet.getRange('U1').getValue() !== 'Consent wording version') throw new Error('Registration storage is not configured.');
    const count = sheet.getLastRow();
    if (count > 1) {
      const match = sheet.getRange(2, 13, count - 1, 1).createTextFinder(requestId).matchEntireCell(true).findNext();
      if (match) return {ok: true, registrationId: sheet.getRange(match.getRow(), 1).getValue(), participation: sheet.getRange(match.getRow(), 6).getValue() === 'Abstract submission' ? 'abstract' : 'audience', duplicate: true};
    }
    // Existing receipts remain retrievable, but only the current form can create a record.
    const formVersion = String(form.formVersion || '');
    if (formVersion !== '5') inputError_('This registration form has been updated. Please reload the page and complete the current form.');
    const firstName = text_(form.firstName, 100);
    const lastName = text_(form.lastName, 100);
    const name = [firstName, lastName].join(' ');
    if (!firstName || !lastName) inputError_('Please enter your first name and last name.');
    const gender = text_(form.gender, 50);
    if (!['Female', 'Male', 'Non-binary', 'Prefer not to say'].includes(gender)) inputError_('Please choose a gender option. You may select Prefer not to say.');
    const title = text_(form.title, 80);
    const email = text_(form.email, 254).toLowerCase();
    const affiliation = text_(form.affiliation, 300);
    if (!affiliation || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) inputError_('Please enter a valid email address and affiliation.');
    const type = String(form.participation || '');
    if (!['audience', 'abstract'].includes(type)) inputError_('Please choose how you would like to take part.');
    if (String(form.recordingConsent || '') !== 'yes') inputError_('Recording consent is required to register. Please review and select the recording consent checkbox.');
    const recordingConsent = 'Yes';
    const consentRecordedAt = receivedAt;
    const consentWordingVersion = RECORDING_CONSENT_VERSION;
    const talkChoice = String(form.considerForTalk || '');
    if (type === 'abstract' && !['yes', 'no'].includes(talkChoice)) inputError_('Please choose Yes or No for consideration as a Selected Speaker.');
    const considerForTalk = type === 'abstract' ? (talkChoice === 'yes' ? 'Yes' : 'No') : 'Not applicable';
    const abstractTitle = type === 'abstract' ? text_(form.abstractTitle, 500) : '';
    if (type === 'abstract' && !abstractTitle) inputError_('Please enter your abstract title.');
    const abstractMethod = type === 'abstract' ? String(form.abstractMethod || '') : '';
    if (type === 'abstract' && !['text', 'upload'].includes(abstractMethod)) inputError_('Please choose Text or Upload your abstract.');
    // Only the selected method is read and persisted; inactive inputs cannot satisfy it.
    const abstractText = abstractMethod === 'text' ? text_(form.abstractText, 30000) : '';
    const upload = abstractMethod === 'upload' && form.attachment && typeof form.attachment.getBytes === 'function' ? form.attachment : null;
    const bytes = upload ? upload.getBytes() : [];
    const originalName = bytes.length ? upload.getName() : '';
    const extension = originalName.split('.').pop().toLowerCase();
    if (abstractMethod === 'text' && !abstractText) inputError_('Please enter your abstract text.');
    if (abstractMethod === 'upload' && !bytes.length) inputError_('Please upload your abstract document.');
    if (bytes.length > 10 * 1024 * 1024) inputError_('The attachment must be 10 MB or smaller.');
    if (bytes.length && !['pdf', 'doc', 'docx', 'txt'].includes(extension)) inputError_('Please upload a PDF, Word document, or text file.');
    if (type === 'abstract' && receivedAt.getTime() >= ABSTRACT_CUTOFF) {
      const deadlineError = new Error('Abstract submissions closed on Tuesday, 24 November 2026 at 11:59 PM UAE time (GST, UTC+4). You can still register as an audience member.');
      deadlineError.code = 'ABSTRACT_DEADLINE';
      throw deadlineError;
    }
    const id = 'SHIFRA-' + requestId.toUpperCase();
    const root = DriveApp.getFolderById(REGISTRATION_STORE.folderId);
    const folderName = id + ' ' + safeName_(name);
    const existing = root.getFoldersByName(folderName);
    const folder = existing.hasNext() ? existing.next() : root.createFolder(folderName);
    let attachmentUrl = '';
    let savedFileName = '';
    if (bytes.length) {
      const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes).map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('').slice(0, 12);
      savedFileName = digest + '-' + safeName_(originalName);
      const matches = folder.getFilesByName(savedFileName);
      const file = matches.hasNext() ? matches.next() : folder.createFile(upload.setName(savedFileName));
      attachmentUrl = file.getUrl();
    }
    const now = receivedAt;
    const metadata = {registrationId: id, requestId, submittedAt: now.toISOString(), name, firstName, lastName, gender, title, email, affiliation, participation: type, abstractTitle, abstractText, originalFileName: originalName, savedFileName, attachmentUrl, formVersion, abstractMethod, considerForTalk, recordingConsent, consentRecordedAt: consentRecordedAt.toISOString(), consentWordingVersion, consentWording: RECORDING_CONSENT_TEXT, consentRequired: true, consentDefaultChecked: true};
    saveText_(folder, 'registration.json', JSON.stringify(metadata, null, 2));
    if (abstractText) saveText_(folder, 'abstract.txt', (abstractTitle ? abstractTitle + '\n\n' : '') + abstractText);
    const row = [id, now, name, email, affiliation, type === 'abstract' ? 'Abstract submission' : 'Audience', abstractTitle, abstractText, attachmentUrl, folder.getUrl(), type === 'abstract' ? 'Pending review' : 'Registered', '', requestId, firstName, lastName, gender, title, considerForTalk, recordingConsent, consentRecordedAt || '', consentWordingVersion];
    const rowNumber = sheet.getLastRow() + 1;
    sheet.getRange(rowNumber, 1, 1, row.length).setValues([row.map(v => typeof v === 'string' ? safeCell_(v) : v)]);
    sheet.getRange(rowNumber, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(rowNumber, 20).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(rowNumber, 1, 1, row.length).setFontFamily('Arial').setFontSize(11).setVerticalAlignment('top').setWrap(true);
    sheet.setRowHeight(rowNumber, 42);
    SpreadsheetApp.flush();
    return {ok: true, registrationId: id, participation: type};
  } catch (error) {
    if (error && ['ABSTRACT_DEADLINE', 'REGISTRATION_INPUT'].includes(error.code)) throw error;
    console.error('Registration save failed: ' + String(error && error.message || error));
    throw new Error('We could not confirm your registration. Your entries are still here; please try again. If the problem continues, contact hala.alsaleh@mbzuai.ac.ae.');
  } finally {
    lock.releaseLock();
  }
}

function text_(value, limit) {
  const text = String(value || '').trim();
  if (text.length > limit) inputError_('One of your entries is too long. Please shorten it and try again.');
  return text;
}
function inputError_(message) {
  const error = new Error(message);
  error.code = 'REGISTRATION_INPUT';
  throw error;
}
function safeName_(value) { return String(value).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').slice(0, 150); }
function safeCell_(value) { return /^[=+\-@]/.test(value) ? "'" + value : value; }
function saveText_(folder, name, contents) {
  const files = folder.getFilesByName(name);
  if (files.hasNext()) files.next().setContent(contents);
  else folder.createFile(name, contents, MimeType.PLAIN_TEXT);
}
