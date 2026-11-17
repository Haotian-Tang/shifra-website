# SHIFRA registration intake

The public website stays on GitHub Pages. This owner-deployed Apps Script web app receives registrations without requiring visitors to sign into Google. It does not expose a participant list or return private Drive links to visitors.

Install `Code.gs`, `Registration.html`, and `appsscript.json` in a standalone Apps Script project. Replace the two placeholders in `REGISTRATION_STORE` with the private registration spreadsheet and submission-folder IDs. Keep these configured IDs in Apps Script rather than this public repository. The spreadsheet must have a `Registrations` tab with the 13 headers used by the intake. Its time zone is Asia/Dubai.

The parent submission folder must have limited access enabled and General access set to Restricted. Place the spreadsheet inside it. Do not inherit public link permissions from the publicity folder. Add specific organisers only when the owner authorises their access.

Deploy as the owner with access set to **Anyone**. Google requires the owner to authorise Drive and Sheets access. These Google scopes allow account-wide file and spreadsheet access; the implementation limits its operations to the two configured destinations. It does not delete files, list unrelated files, send email, or publish submissions.

Set the returned production `/exec` URL in `src/data/registration.ts`. The build verifier prevents publishing a missing URL or the disconnected local form preview. Re-deploy a new Apps Script version whenever its source changes; updating repository code alone does not update the live receiver.

Audience registrations require name, email, and affiliation. Abstract registrations additionally require text or a PDF/Word/text attachment, or both. Attachments are limited to 10 MB; abstract text is limited to 30,000 characters. Each registration creates a private folder with `registration.json`, optional `abstract.txt`, and an optional attachment. The sheet stores the matching links and a review status. It does not claim abstract acceptance or send confirmation email.

The client retains one request ID across retries. A script lock and stored request IDs prevent duplicate rows. Success appears only after Drive files are saved and the row is flushed to Sheets. All administrative helpers are private to the script; the public RPC accepts registration input and returns only a reference and participation type. User-entered text is escaped before being written to Sheets.
