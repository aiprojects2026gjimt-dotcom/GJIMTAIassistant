WHY THE DASHBOARD SHOWED 0
Your sheet clearly contains Non Gianjyotian rows. The previous dashboard could still show 0 when the browser was connected to an older Apps Script deployment that did not return the new gianjyotianCount/nonGianjyotianCount fields. This version adds an API version check, so it will no longer silently display 0 from an old backend.

COUNTING FIX
- Non Gianjyotian is now detected if Course = OUTSIDER OR Registration Type starts with Non Gian / Non Gyan OR equals Outsider.
- Overall = every row with Present = YES.
- Gianjyotian = all present donors not classified as Non Gianjyotian.
- Non Gianjyotian = all present external donors.

VOICE + LIVE ANNOUNCEMENT
- New registration creates a NOOR_ANNOUNCEMENTS event in Google Apps Script.
- Basement polls every 2 seconds.
- NOOR says: Welcome [Name]. Thank you for registering at the Gian Jyoti Blood Donation Camp. Your generous act can help save lives and bring hope to many families.
- Visible spelling remains Gian Jyoti; speech internally converts Gian -> Gyan for pronunciation.
- 50-second donor spotlight remains.

CONTINUOUS SOFT MUSIC
Modern browsers block automatic sound until the user interacts with the page. Therefore the basement dashboard now shows one 'Start Live Dashboard' button after page load. Click it ONCE when setting up the basement screen. Soft music then plays continuously, pauses during NOOR's donor announcement, and automatically resumes afterwards.

CRITICAL DEPLOYMENT
1. Replace Code.gs in the SAME Apps Script project.
2. Deploy > Manage deployments > Edit > Version > NEW VERSION > Deploy.
3. Keep Execute as Me and access appropriate for your kiosk/web app.
4. If Google gives a different /exec URL, put the SAME URL in app.js and dashboard.js.
5. Upload all frontend files.
6. Hard refresh reception and basement: Ctrl+Shift+R.
7. Basement: click Start Live Dashboard once.
8. Register one test donor at reception. Confirm:
   - Sheet row has Present=YES.
   - NOOR_ANNOUNCEMENTS gets a new row.
   - Dashboard count changes within 10 sec.
   - Name spotlight/voice appears within about 2 sec.
   - Music pauses for voice and resumes.
