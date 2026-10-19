# PIRLS 2026 — GitHub Pages only (no Netlify, no Cloudflare)

This folder is the **PUBLIC website**. It contains an HTML page, CSS, JavaScript, and 25 AES-256-GCM encrypted `.bin` files. It contains **no plaintext student names, Emirates IDs, access codes, or readable PDFs**.

## GitHub Pages setup (simple)
1. Create a **public** GitHub repository named `pirls-parent-portal`.
2. Click **Add file → Upload files**. Upload the **CONTENTS** of this folder, not the folder itself, so `index.html` is in the **repository root**. Upload all 25 files in `encrypted/` as well. On GitHub's browser upload interface, you can drag and drop the `encrypted/` folder (or files keeping the same relative path). Commit changes.
3. Open repository **Settings → Pages**. Under *Build and deployment*, select **Deploy from a branch**, then **main** and **/(root)**; click Save.
4. Open `https://YOUR-GITHUB-USERNAME.github.io/pirls-parent-portal/` (after GitHub publishes it).
5. Test with ONE actual student Emirates ID and the matching individual code from the **separate private CSV**. Check that the correct PDF downloads. Also test an invalid access code (no PDF).

## Very important: keep codes and original PDFs private
- **NEVER upload** `PARENT_ACCESS_CODES_KEEP_PRIVATE.csv` or any original `.pdf` to GitHub. Never paste them into HTML, JS, README, Issues, or GitHub Actions logs.
- Public visitors can download encrypted `.bin` files, but they cannot read the PDFs without the matching **128-bit random private access code** AND the student's ID.
- Each parent must receive only their own code via a school-approved confidential channel. Verify the recipient. If the code leaks, rebuild/re-encrypt the collection with newly generated codes.
- This is a static client-side decryption solution. It cannot revoke individual access after a code has been shared without rebuilding the assets. It does not provide server-side access logs or institutional login.
- Confirm school authorization, consent/policy and hosting conditions BEFORE publishing files containing student data, even when encrypted.

## How it works
The page calculates an unguessable encrypted filename using SHA-256(Emirates ID + code), fetches just that encrypted `.bin` file from GitHub Pages, derives a separate AES-256 key from the ID and code, and decrypts in the parent's browser. No ID, code or unencrypted PDF is sent to GitHub by the website form. GitHub Pages serves encrypted files only.

## Editing
To change appearance edit `styles.css`; to change wording edit `index.html` or the bilingual strings in `script.js`. Never paste IDs/codes in public JavaScript.
