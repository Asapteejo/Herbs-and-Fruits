# Herbs and Fruits Nigeria

Modernized public site for Herbs and Fruits Nigeria.

## Deployment approach

Primary production path:

- Firebase Hosting for the frontend
- Firebase Functions for the `/send-email` contact endpoint

Local Express in [server.js](/c:/Users/HP/Desktop/Herbs-and-Fruits-clean/server.js) is kept as a development fallback so the site and contact flow can still be tested outside Firebase.

## Scripts

- `npm run build`
  Builds the frontend bundle into `public/js`.
- `npm run serve:local`
  Runs the local Express fallback server.
- `npm run deploy`
  Builds the frontend and deploys Hosting + Functions.
- `npm run deploy:hosting`
  Builds the frontend and deploys Hosting only.
- `npm run deploy:functions`
  Deploys Firebase Functions only.

## Local development

1. Install root dependencies:
   `npm install`
2. Install Firebase Functions dependencies:
   `cd functions && npm install`
3. Create a local `.env` file if you want the contact form to send email through the local Express fallback.

Recommended environment variables:

- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_TO_EMAIL` optional

4. Build the frontend:
   `npm run build`
5. Start the local server:
   `npm run serve:local`

## Firebase configuration

The default Firebase project is defined in `.firebaserc`.

For Firebase Functions email delivery, configure the same values in your deployed runtime before pushing the contact form live.

Example values to set:

- mail.user
- mail.pass
- mail.recipient optional

## Notes

- The main catalog UI is mounted from [src/client/index.js](/c:/Users/HP/Desktop/Herbs-and-Fruits-clean/src/client/index.js).
- The contact form posts to `/send-email`, which is handled by Firebase in production and by Express locally.
