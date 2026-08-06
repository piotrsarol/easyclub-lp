# EasyClub landing page

Marketing landing page for the EasyClub pilot program. Built with Next.js, React, TypeScript and a small custom CSS design system so the page stays fast and does not add an animation dependency.

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Pilot applications

`POST /api/leads` validates the payload on the server with Zod and forwards it to a Google Apps Script web app when these server-only variables are configured:

- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_SECRET`

Copy `.env.example` to `.env.local` and never expose the webhook URL or secret to the browser. The honeypot field in the form silently accepts basic automated submissions.

### Google Sheets webhook

1. Open the target Google Sheet and choose **Extensions → Apps Script**.
2. Replace the editor contents with the following script and set `WEBHOOK_SECRET` in **Project Settings → Script Properties**:

```js
function doPost(event) {
  const expectedSecret = PropertiesService
    .getScriptProperties()
    .getProperty("WEBHOOK_SECRET");
  const payload = JSON.parse(event.postData.contents);

  if (!expectedSecret || payload.secret !== expectedSecret) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow([
    payload.submittedAt,
    payload.clubName,
    payload.contactName,
    payload.email,
    payload.phone,
    payload.organizationType,
    payload.clubSize,
    payload.message,
    payload.consent,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy it as a **Web app**, execute as yourself, and allow access to anyone with the link.
4. Add the deployment URL and the same secret to Vercel under **Settings → Environment Variables**.

The lead route sends data server-side, so the webhook URL and secret are not included in browser code.

## Vercel Web Analytics

The landing includes `@vercel/analytics`. After a production deployment, enable Web Analytics in the Vercel project dashboard to see privacy-focused visitor, page-view, and bounce-rate metrics. It does not add Google Analytics, Meta Pixel, or advertising trackers.
