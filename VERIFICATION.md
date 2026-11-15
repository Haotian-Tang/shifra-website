# SHIFRA layout and poster registration verification

Verified on 15 November 2026 using the built static output, the local Node receiver, and actual Chrome. This revision retains the academic structure and incorporates the two supplied logos, a bold display title and rounded body typography, a compact banner, the expanded Home layout, campus map, contact details, and countdown.

## Pages and presentation

- The venue is **Lecture Hall 1 & 2** in event content, page metadata, footers, registration, and the social-sharing graphic.
- Both supplied logo JPEGs appear above navigation on every page. Their files match the attachments byte for byte; display filters remove the black matte without redrawing the lettering or shapes. Bodoni Moda is retained only for the Home title at weight 700. All other English text uses Nunito Sans, including headings, body, menu, agenda, and form text. Navigation remains 17 px, with Registration between Agenda and Organizing Committee and active on both registration routes.
- The banner panel is restored immediately below navigation, centered at a maximum of 860 px wide. It is 160 px high on desktop and 112 px on mobile. It remains labeled as a placeholder until an official banner is supplied.
- About this event has three expanded paragraphs, rendered at 20 px on desktop and 19 px on mobile. Its text and poster columns have matching bottom edges on desktop; they stack on mobile. Location uses the full university name and Abu Dhabi, UAE; the BLS division line is removed. Acknowledgement still thanks Eduardo Beltrame, the speakers, and the BLS administrative team.
- Visited all six routes at 1440, 390, and 320 px. No horizontal overflow, clipped Arabic, broken image, failed resource request, or browser runtime error remained. The narrow-screen acknowledgement heading scales to fit.
- Inspected desktop and mobile screenshots. Verified both logos, all six pages, compact banner, home content order, four labeled required fields, mobile menu navigation, Escape closing, and focus return. Bundled Bodoni Moda and Nunito Sans load successfully. All six footers contain the spaced hall numbers, university name, city, and the plain-text contact email `hala.alsaleh@mbzuai.ac.ae`. All footer navigation and hyperlinks have been removed, and the footer uses 13 px text with reduced spacing. The public tunnel preview also preserves the contact address as plain text without inserting an email-protection link.
- The location section includes a Google Maps embed and an external campus-location link from MBZUAI’s official site. No separate geographic coordinates for the individual lecture halls are claimed.
- The countdown follows Acknowledgement and targets 27 November 2026 at 08:30 GST (UTC+4), derived from the first agenda entry. Browser clocks set to Los Angeles and Tokyo both show the same remaining interval. Tests cover a one-day interval, the next second across the day boundary, and expiry at exactly the start time; it changes to “SHIFRA has started” without negative values. Its date and programme link remain usable without JavaScript.
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

- Astro check: **0 errors, 0 warnings, 0 hints** across 26 files.
- Production project-path build, working local-preview build, and root-domain build all pass. Each contains six HTML routes and passes validation of 84 local asset/link references, canonical metadata, and all 17 UAE-time agenda entries.
- The root-domain build's six routes also load directly. A normal production build without an upload receiver keeps collection closed, disables the form controls, and explicitly says submissions are not being collected.
- GitHub Pages remains static. Its workflow now tests the local receiver and accepts a future `POSTER_SUBMISSION_ENDPOINT` repository variable for a separately hosted receiver. The local receiver is not included in the Pages deployment.
- Source remains on `codex/shifra-preview` for review. No merge into main, repository visibility change, custom-domain activation, DNS update, or GitHub Pages settings change is included.

## Pending organizer assets

The two logos and Hala's public contact address have been supplied and are included. The final symposium banner, official symposium poster, portraits, speaker roster, biographies, and general-attendance registration URL have not been supplied. These remain absent or use labeled placeholders. Uploaded research posters are private submissions and do not automatically replace the official symposium poster.
