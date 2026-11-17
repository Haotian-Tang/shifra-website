// Deploy as the owner, with access set to Anyone. These IDs are configured only in Apps Script.
const REGISTRATION_STORE = {
  spreadsheetId: '__SPREADSHEET_ID__',
  folderId: '__SUBMISSION_FOLDER_ID__',
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Registration')
    .setTitle('Register for SHIFRA')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitRegistration(form) {
  const name = text_(form.fullName, 200);
  const email = text_(form.email, 254).toLowerCase();
  const affiliation = text_(form.affiliation, 300);
  const type = String(form.participation || '');
  const requestId = String(form.requestId || '');
  if (!name || !affiliation || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter your name, a valid email address, and affiliation.');
  if (!['audience', 'abstract'].includes(type) || !/^[a-f0-9-]{36}$/i.test(requestId) || form.website) throw new Error('Please reload the form and try again.');
  const abstractTitle = type === 'abstract' ? text_(form.abstractTitle, 500) : '';
  const abstractText = type === 'abstract' ? text_(form.abstractText, 30000) : '';
  const upload = type === 'abstract' && form.attachment && typeof form.attachment.getBytes === 'function' ? form.attachment : null;
  const bytes = upload ? upload.getBytes() : [];
  const originalName = bytes.length ? upload.getName() : '';
  const extension = originalName.split('.').pop().toLowerCase();
  if (bytes.length > 10 * 1024 * 1024) throw new Error('The attachment must be 10 MB or smaller.');
  if (bytes.length && !['pdf', 'doc', 'docx', 'txt'].includes(extension)) throw new Error('Please upload a PDF, Word document, or text file.');
  if (type === 'abstract' && !abstractText && !bytes.length) throw new Error('Please paste your abstract or upload an abstract document.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Registration is busy. Please try again in a moment.');
  try {
    const book = SpreadsheetApp.openById(REGISTRATION_STORE.spreadsheetId);
    const sheet = book.getSheetByName('Registrations');
    if (!sheet || sheet.getRange('A1').getValue() !== 'Registration ID' || sheet.getRange('M1').getValue() !== 'Request ID') throw new Error('Registration storage is not configured.');
    const count = sheet.getLastRow();
    if (count > 1) {
      const match = sheet.getRange(2, 13, count - 1, 1).createTextFinder(requestId).matchEntireCell(true).findNext();
      if (match) return {ok: true, registrationId: sheet.getRange(match.getRow(), 1).getValue(), participation: sheet.getRange(match.getRow(), 6).getValue() === 'Abstract submission' ? 'abstract' : 'audience', duplicate: true};
    }
    const id = 'SHIFRA-' + requestId.replace(/-/g, '').slice(0, 12).toUpperCase();
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
    const now = new Date();
    const metadata = {registrationId: id, requestId, submittedAt: now.toISOString(), name, email, affiliation, participation: type, abstractTitle, abstractText, originalFileName: originalName, savedFileName, attachmentUrl};
    saveText_(folder, 'registration.json', JSON.stringify(metadata, null, 2));
    if (abstractText) saveText_(folder, 'abstract.txt', (abstractTitle ? abstractTitle + '\n\n' : '') + abstractText);
    const row = [id, now, name, email, affiliation, type === 'abstract' ? 'Abstract submission' : 'Audience', abstractTitle, abstractText, attachmentUrl, folder.getUrl(), type === 'abstract' ? 'Pending review' : 'Registered', '', requestId];
    const rowNumber = sheet.getLastRow() + 1;
    sheet.getRange(rowNumber, 1, 1, row.length).setValues([row.map(v => typeof v === 'string' ? safeCell_(v) : v)]);
    sheet.getRange(rowNumber, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(rowNumber, 1, 1, row.length).setFontFamily('Arial').setFontSize(11).setVerticalAlignment('top').setWrap(true);
    sheet.setRowHeight(rowNumber, 42);
    SpreadsheetApp.flush();
    return {ok: true, registrationId: id, participation: type};
  } catch (error) {
    console.error('Registration save failed: ' + String(error && error.message || error));
    throw new Error('We could not confirm your registration. Your entries are still here; please try again. If the problem continues, contact hala.alsaleh@mbzuai.ac.ae.');
  } finally {
    lock.releaseLock();
  }
}

function text_(value, limit) {
  const text = String(value || '').trim();
  if (text.length > limit) throw new Error('One of your entries is too long. Please shorten it and try again.');
  return text;
}
function safeName_(value) { return String(value).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').slice(0, 150); }
function safeCell_(value) { return /^[=+\-@]/.test(value) ? "'" + value : value; }
function saveText_(folder, name, contents) {
  const files = folder.getFilesByName(name);
  if (files.hasNext()) files.next().setContent(contents);
  else folder.createFile(name, contents, MimeType.PLAIN_TEXT);
}
