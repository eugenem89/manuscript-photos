# Manuscript Photos

A bilingual, installable web app for photographing manuscripts. Open iphone.html for the personal edition, or index.html for the photo-only edition. Both work on iPhone and Android and offer Hebrew and English.

Photos are retained in browser-local storage while pending and uploaded directly to the connected user’s Google Drive with drive.file authorization. This repository contains app code and a demonstration drawing only; it contains no captured photographs, passwords, OAuth client secrets or access tokens. The client_id in drive-config.json is a public OAuth client identifier.

Publish the main branch root through GitHub Pages. Add the exact Pages origin to the Google OAuth web client’s Authorized JavaScript origins before using Drive. Each user must grant access themselves; an OAuth app in Testing also needs their account listed as a test user.

Before moving from another site address, finish all queued uploads there. Browser-local data does not transfer automatically between origins.
