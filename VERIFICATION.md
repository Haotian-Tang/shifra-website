# SHIFRA layout and poster registration verification

Verified on 15 November 2026 using the built static output, the local Node receiver, and actual Chrome. This revision retains the academic reference style while making the organizer-requested layout and registration changes.

## Pages and presentation

- The venue is **Lecture Hall 1&2** in event content, page metadata, footers, registration, and the social-sharing graphic.
- The provisional graphical favicon is removed. The text-only SHIFRA and Arabic masthead is larger, with 64 px Latin and 44 px Arabic type on desktop. Navigation is 17 px, and Registration sits between Agenda and Organizing Committee. Both registration routes highlight that tab.
- There is no standalone banner panel. A future supplied banner can appear as a faint hero background using `event.banner.image` and `event.banner.opacity` (0.12). No replacement artwork is invented.
- About this event places the introduction on the left and the official symposium poster placeholder on the right. These stack on mobile. Acknowledgement follows Location/Venue and thanks Eduardo Beltrame, the speakers, and the BLS administrative team.
- Visited and refreshed all six routes at 1440, 768, 390, and 320 px. No horizontal overflow, clipped Arabic, broken image, failed resource request, or browser runtime error remained. The narrow-screen acknowledgement heading scales to fit.
- Inspected desktop and mobile screenshots. Verified the larger masthead, smaller navigation, home content order, four labeled required fields, mobile menu navigation, Escape closing, and focus return. Bundled font resources load successfully.
- The 17 agenda entries, UAE time zone, organizer order, existing print control, and other conference content remain intact.

## Poster registration

- Registration opens a working Register for poster entry and a separate form for full name, affiliation, email address, and one PDF up to 20 MB.
- Browser checks cover missing fields, invalid email, non-PDF selection, oversized selection, server rejection of a renamed non-PDF, and retry after a simulated network failure. Errors retain the entered details and selected file; success appears only after a real save response and includes a submission reference.
- Submitted a sample PDF through the actual browser UI and compared the saved file byte for byte. All text fields were checked against the saved registration record. Also verified native HTML submission and its stylesheet with JavaScript disabled.
- All 10 receiver tests pass: exact field/file persistence, required fields, file signature/size/count checks, empty uploads, early oversized-request rejection, origin checks, static-file and symlink boundaries, HTML confirmation, and a storage failure that returns an error without a false receipt. Test details are synthetic, and unit-test storage is temporary.
- The receiver writes `poster.pdf` and `registration.json` in a private reference directory outside the served build. Files use owner-only permissions. Public requests for stored posters and records return 404. Collection files are outside the source checkout or ignored by Git.
- The existing temporary HTTPS share link serves all six pages successfully. A real submission through that public link returned HTTP 201; Unicode text fields and exact PDF bytes were verified in local storage. Only that synthetic public test record was then removed.
- The shared receiver uses `outputs/shifra-poster-submissions/` outside the checkout. The receiver and tunnel must remain running and this computer online for the temporary link and collection to work. Confirmation is on screen; it does not send email or confirm poster acceptance.

## Builds and delivery

- Astro check: **0 errors, 0 warnings, 0 hints** across 25 files.
- Production project-path build, working local-preview build, and root-domain build all pass. Each contains six HTML routes and passes validation of 101 local asset/link references, canonical metadata, and all 17 UAE-time agenda entries.
- The root-domain build's six routes also load directly. A normal production build without an upload receiver keeps collection closed, disables the form controls, and explicitly says submissions are not being collected.
- GitHub Pages remains static. Its workflow now tests the local receiver and accepts a future `POSTER_SUBMISSION_ENDPOINT` repository variable for a separately hosted receiver. The local receiver is not included in the Pages deployment.
- Source remains on `codex/shifra-preview` for review. No merge into main, repository visibility change, custom-domain activation, DNS update, or GitHub Pages settings change is included.

## Pending organizer assets

The final logo, background banner, official symposium poster, portraits, speaker roster, biographies, general-attendance registration URL, and public contact details have not been supplied. They remain absent or use labeled placeholders. Uploaded research posters are private submissions and do not automatically replace the official symposium poster.
