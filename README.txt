GJIMT NOOR - BLOOD DONATION REGISTRATION (15 OCT 2026)

FLOW
1. On page load NOOR only greets the visitor.
2. Registration starts ONLY after clicking Start Registration.
3. Already registered: YES -> Name -> Course -> Semester -> exact 3-field match -> Present=YES + Attendance Time -> "Next student please".
4. Not registered: NO -> on-screen form for Name, Course, Semester, Mobile. The system automatically writes Already Registered=NO, Present=YES, Registration Type=New Entry, Attendance Time=current time.

GOOGLE SHEET ALREADY CONFIGURED IN Code.gs
Spreadsheet ID: 1n6bJbSSh3r9zOdA64_FmD2txcgkd8wdheqFKXO4rNM4
Sheet gid: 0
Expected headings: Name | Course | Semester | Mobile | Already Registered | Present | Registration Type
Attendance Time is added automatically if missing.

ONE-TIME GOOGLE APPS SCRIPT SETUP
1. Open the Google Sheet -> Extensions -> Apps Script.
2. Replace Code.gs with the Code.gs supplied here. Save.
3. Run setupSheet once and approve Google permissions.
4. Deploy -> New deployment -> Web app.
5. Execute as: Me. Access: Anyone (or the broadest option allowed by your Workspace). Deploy.
6. Copy the Web App URL ending in /exec.
7. Open app.js and replace PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE with that /exec URL. Save.
8. Host the website on HTTPS (GitHub Pages/Vercel) for microphone support. Do not test mic by double-clicking index.html.

TEST
Pre-registered example from your sheet:
Simranjeet Singh | BCA | 5
After matching, Present becomes YES and Attendance Time is filled.
