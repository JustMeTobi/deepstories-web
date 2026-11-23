# DeepStories (web app)

This repo only holds the **built** web version of DeepStories, served by GitHub Pages at
https://justmetobi.github.io/deepstories-web/

Don't edit files here by hand. They're generated from the private app repo with `npm run publish:web`.

**Install on iPhone:** open the link in Safari, tap Share, then **Add to Home Screen**.

## Daily notification

`.github/workflows/daily-push.yml` runs every hour and sends one notification a day (at 19:00 Copenhagen time by default) to the phone saved in the `PUSH_SUBSCRIPTION` secret. Secrets needed: `PUSH_SUBSCRIPTION` and `VAPID_PRIVATE_KEY`. Optional repository variables: `PUSH_HOUR` (0–23) and `PUSH_TIMEZONE` (e.g. `Europe/Copenhagen`). To test, go to Actions → Daily notification → Run workflow.
