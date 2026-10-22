# Manuscript Photos · צילום כתבי יד

A free, standalone web app for photographing manuscripts on iPhone and Android. Both editions offer Hebrew and English. Add the website to your phone’s home screen; no app store, dashboard, or Tailscale installation is needed.

## Open the app

- [Personal edition](https://eugenem89.github.io/manuscript-photos/iphone.html) — English initially; includes the optional watermark marker and descriptive metadata for later manual import.
- [Photo-only edition](https://eugenem89.github.io/manuscript-photos/index.html) — Hebrew initially; JPG photographs, plus a text file only when notes are entered.

The edition is a choice of features, not a restriction to a particular phone: both work on iPhone and Android. On iPhone, open in Safari and choose Share → Add to Home Screen. On Android, open in Chrome and choose Add to Home screen or Install app.

## Capture and save

1. Enter your email and connect your own Google Drive. Google asks you to approve access; your Google password is entered only on Google’s pages.
2. Type the library name for matching suggestions, or enter a private collection. Enter the shelfmark.
3. Choose the photograph’s subject and identify its folio and side. Book view records both pages; turn it off for a single page. Numbered front/back flyleaves, a flyleaf facing folio 1a, front cover, spine, and back cover are supported.
4. Take the photo, optionally add notes, and choose another photo of the same page, the other side, a new folio, or finish the manuscript.

Photos upload directly from the phone to the connected person’s Google Drive, under **כתבי יד / Library_ddmmyyyy**. Filenames include library, shelfmark, folio and side, with repeated photographs numbered _001, _002, and so on. An opening is named, for example, Parma_1234_12b--13a_001.jpg. Hebrew folio labels are supported.

The menu contains previous photos, profile/account settings, Google Drive access, and sign-out. Signing out does not delete photographs already stored locally or in Drive.

## Connection and offline use

Internet is required for first setup, Google authorization, and Drive uploads. Once loaded and cached, the capture interface can reopen offline; queued photographs remain on the device until the app can reconnect and upload. Google may require reconnecting when authorization expires. Confirm that uploads succeeded and keep independent backups before clearing browser data or removing the old app.

## Privacy and support

- Each person uses their own Drive; no dashboard automation or shared photo database is connected.
- Google authorization requests the limited drive.file scope. Temporary access tokens remain in memory.
- GitHub Pages hosts public app code, icons, and a demonstration drawing, not users’ captured photos or Google passwords. drive-config.json contains a public OAuth client ID, not a secret.
- [Privacy policy](https://eugenem89.github.io/manuscript-photos/privacy.html)
- [Terms of use](https://eugenem89.github.io/manuscript-photos/terms.html)
- Support: **manuscriptphotos.support@gmail.com**

## Maintenance

The existing GitHub repository hosts the main branch root through GitHub Pages. The Google Cloud project and public support/developer contacts are managed by the dedicated support account. Google setup was completed by the maintainer; this repository does not itself verify the current publishing or verification status in Google’s console. Public website availability and Google OAuth approval are separate. Each user still needs individual consent, and Google Workspace administrators may apply their own restrictions.

No paid backend or central photograph storage is required by this design. GitHub and Google service limits apply; users supply their own internet and Drive storage. No billing plan is enabled by these instructions.

A real iPhone/Android capture-to-Drive test remains a release check; interface and upload behavior have been tested with simulated Google responses. This is not an independent security audit.

When changing site addresses, finish queued uploads on the old address first. Browser-local photographs and profiles do not transfer automatically between addresses.

## בעברית

אפליקציית צילום כתבי יד פועלת באייפון ובאנדרואיד, בעברית ובאנגלית. פותחים את הקישור ומוסיפים למסך הבית. מתחברים לחשבון Google Drive האישי, ממלאים ספרייה וסימן מדף, בוחרים דף וצד ומצלמים. אפשר לצלם גם דפי מגן, פתיחת ספר, כריכה קדמית, שדרה וכריכה אחורית.

התמונות נשמרות בתיקיית **כתבי יד** בחשבון האישי. בגרסה המצומצמת נשמרים קובצי JPG בלבד, וקובץ טקסט נוסף רק אם נכתבו הערות. יש לבדוק שהגיבוי הושלם לפני מחיקת נתוני האתר. לפניות: manuscriptphotos.support@gmail.com.
