# SHIFRA single-page verification

Verified on 16 November 2026 using the built static output, actual Chrome, the local poster receiver, and the existing temporary HTTPS preview.

## Page structure and identity

- All event content is in one scrolling document: About, Agenda, Poster registration, Organizing Committee, Speakers, Location, Acknowledgement, and Countdown. The page has one h1 and no tab strip or hamburger menu.
- Hero actions jump to the agenda and registration sections without leaving the document. Poster registration remains between the agenda and committee. All section and form IDs are unique.
- The five former page URLs redirect to their matching main-page sections, staying on the current origin. This works on the temporary share URL and with JavaScript disabled. Redirect documents contain no duplicate agenda or form content and use the main-page canonical URL.
- The current MBZUAI navy logo matches the new supplied JPEG byte for byte, with native dimensions 1651 × 554. It is displayed at its original aspect ratio with no filter or transform. The outdated light/dark-blue asset and its matte filter are removed. The existing SHIFRA logo remains unchanged.
- The Home title retains Bodoni Moda at weight 700. Other English text uses Nunito Sans. The compact, link-free footer retains the spaced hall numbers, full university name, city, and plain-text contact address.
- Organizer names remain Hala Alsaleh, Haotian Tang, and Eduardo Beltrame, in the supplied order. Compact cards omit empty portrait frames. The unconfirmed speaker roster uses a concise announcement, with no invented names or implied count.

## Browser and interaction checks

- Checked the full document at 1440, 768, 390, and 320 px. No horizontal overflow, duplicate IDs, broken logo, or browser runtime error was found. Desktop and mobile screenshots were inspected.
- Verified same-document hero links, all five legacy redirects, the single inline form, the 17 programme entries, section order, new logo dimensions and styling, and the link-free footer.
- The print control retains the agenda only, including its event name and date. Hero, registration, other sections, and footer are hidden in print media.
- Existing campus map, acknowledgement, and fixed UAE-time countdown remain on the main document. Programme links now target its agenda section.

## Poster submission

- Checked required fields and invalid email on the new inline form. Successful JavaScript submission stays on the main document and displays its saved receipt reference.
- Submitted synthetic details and a sample PDF locally and through the public HTTPS preview. Both returned HTTP 201; saved fields and exact PDF bytes were checked in local storage.
- With JavaScript disabled, the old poster URL redirects to the inline form, native submission returns a real HTML receipt, and its back link returns to the main form section.
- Stored files remain outside the served build. A public request for the test PDF returns 404. Only the known synthetic test records were removed afterward.
- All 10 existing receiver tests pass, covering exact persistence, validation, oversized and malformed uploads, origin checks, private-file boundaries, native confirmation, and storage failure without a false success response.
- The shared receiver still saves into the private `outputs/shifra-poster-submissions/` directory outside the checkout. The computer, receiver, and tunnel must remain online for the temporary link and uploads to work. This does not send confirmation emails or confirm poster acceptance.

## Builds and delivery

- Astro check: 0 errors, 0 warnings, 0 hints across 30 files.
- Working preview, production project-path build, and root-domain build pass validation of one content page, five legacy redirects, all 17 UAE-time entries, canonical metadata, and 26 local asset/link references.
- A production build without an upload endpoint keeps the inline form closed. GitHub Pages continues to serve static files; a permanent upload receiver is still required for production collection.
- Source remains on `codex/shifra-preview`. Main, Pages settings, repository visibility, custom-domain activation, and DNS are unchanged.

## Pending organizer assets

The final symposium banner, official symposium poster, portraits, confirmed speaker roster and biographies, and general-attendance registration URL remain unprovided. Existing placeholders and typed empty fields are retained where appropriate. Private research-poster uploads do not replace the public symposium poster automatically.
