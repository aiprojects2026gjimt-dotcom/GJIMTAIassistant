GJIMT NOOR — UPDATED PACKAGE
1. Keep all files in one folder; index.html is registration; dashboard.html is the 3D-styled dashboard; welcome.html thanks each donor and directs them to the PGI counter.
2. Existing uploaded ZIP contained gjimt_logo.png; this is reused. No separately uploaded replacement logo was present. Replace gjimt_logo.png with your NEW logo using the same filename when available.
3. IMPORTANT: Update Code.gs in your original Google Apps Script project. Deploy > Manage deployments > Edit > New version > Deploy. Ensure app.js and dashboard.js use the ACTIVE /exec URL (change both if it changes).
4. Dashboard overall registration counts ONLY rows where Present=YES. Existing Present = Present rows excluding New Entry, Outsider and Non Gianjyotian. New registrations = present New Entry / Outsider / Non Gianjyotian.
5. Dashboard auto-refreshes every 10 seconds. It is visual 3D CSS, not a 3D rendering engine.
6. Successful existing attendance, new Gianjyotian and Non Gianjyotian registrations navigate to welcome.html. The voice greeting is attempted automatically, but some browsers block autoplay: click Hear NOOR's Message if needed.
7. Host all website files together (GitHub Pages/Vercel). Test live connection, existing attendance, new student, Non Gianjyotian and mobile before the camp.
SECURITY: The inherited JSONP endpoint writes registration data using GET without authentication; use only on a controlled kiosk/network until the backend is secured. Do not publish sensitive donor records on the dashboard.
