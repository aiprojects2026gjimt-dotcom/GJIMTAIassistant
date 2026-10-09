IMPORTANT — THE FIX REQUIRES BACKEND + FRONTEND:
1. Replace ALL of Code.gs in the SAME Google Apps Script project and deploy a NEW VERSION. The event API now includes event timestamps and returns recent donor announcements.
2. Confirm app.js and dashboard.js point to the same currently deployed /exec URL. Update both if it changed.
3. Upload dashboard.js and dashboard.html (and other frontend files) to the hosting site, then hard-refresh (Ctrl+Shift+R) both reception and basement browsers.
4. On basement screen click 'Hear NOOR' once after opening dashboard. Browser audio autoplay can be blocked until interaction. Install/enable Microsoft Neerja/Heera or another female voice on BASEMENT device; the reception's voice inventory is separate.
5. Keep basement dashboard open. Registration creates a row in NOOR_ANNOUNCEMENTS; dashboard polls it every 2 seconds, displays the donor name and announces PGI desk instruction. Recent registrations within 2 minutes are picked up on a fresh dashboard opening.
6. Test: first open basement dashboard, then register one test donor at reception. Check both main sheet and NOOR_ANNOUNCEMENTS sheet.
7. If connection warning appears, verify latest Code.gs deployment URL, access settings and browser network.
