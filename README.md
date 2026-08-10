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
    payload.source,
    payload.athleteCount,
    payload.utmSource,
    payload.utmMedium,
    payload.utmCampaign,
    payload.utmContent,
    payload.utmTerm,
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

## Blog draft and publishing workflow

The repository includes two free-tier Gemini workflows:

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Add it to GitHub as an Actions secret named `GEMINI_API_KEY`.
3. For a manual draft, open **Actions → Generate blog draft → Run workflow** and provide the topic, category and optional keywords.
4. Download the `blog-draft` artifact, review the Polish copy and SEO fields, then manually add the approved article to `src/lib/blog.ts`.

For local generation:

```bash
GEMINI_API_KEY=... npm run blog:draft -- "Jak uporządkować grafik treningów?"
```

The free Gemini API tier has rate limits and Google may use free-tier prompts and responses to improve its products. The workflow currently uses `gemini-3.6-flash`; override `GEMINI_MODEL` if Google AI Studio assigns a different free model to your project. Do not send private club, parent or athlete data in prompts.

### Automatic publication

Vercel Cron triggers `GET /api/blog-publish` once a week on Tuesday at 11:00 Polish time (`09:00 UTC`). The protected endpoint dispatches `Generate and publish blog article` through GitHub's API; the workflow can still be started manually. Configure these server-only variables in Vercel:

- `CRON_SECRET` — random secret used to authenticate Vercel Cron requests;
- `GITHUB_ACTIONS_DISPATCH_TOKEN` — fine-grained GitHub token for this repository with **Actions: Read and write** permission.

The endpoint only starts the workflow; article generation, validation, commit and deployment remain inside GitHub Actions. The workflow selects the highest-priority unpublished topic from `content/seo-topics.json`, generates the article, validates the SEO limits and article structure, runs the full quality checks, commits the article to `main`, and lets Vercel deploy it.

The workflow is intentionally limited to one article per run. Topics are selected from the committed backlog until Google Search Console data is supplied. After adding a Search Console export, update the backlog briefs rather than sending private club or member data to Gemini. Automatic publication does not include a human editorial review, so keep only evergreen, non-legal topics in the automatic backlog.
