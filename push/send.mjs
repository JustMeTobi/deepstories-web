// Sends today's DeepStories notification. Run by .github/workflows/daily-push.yml.
// Needs secrets PUSH_SUBSCRIPTION and VAPID_PRIVATE_KEY; optional variables PUSH_HOUR and PUSH_TIMEZONE.
import fs from 'node:fs';
import webpush from 'web-push';

const SITE = 'https://justmetobi.github.io/deepstories-web/';
const VAPID_PUBLIC_KEY = 'BOkKiTQFGgsAMYRJzRXP8i49xZDZ6eG0vmS7f1v7WMf1k79sTKyRo0Z0KmSsot0BsxjITqb7Mt1sy-_pkO61nf4';
const { PUSH_SUBSCRIPTION, VAPID_PRIVATE_KEY, FORCE } = process.env;
const hourWanted = Number(process.env.PUSH_HOUR || 19);
const timeZone = process.env.PUSH_TIMEZONE || 'Europe/Copenhagen';

if (!PUSH_SUBSCRIPTION || !VAPID_PRIVATE_KEY) {
  console.log('PUSH_SUBSCRIPTION or VAPID_PRIVATE_KEY secret is missing; nothing to do.');
  process.exit(0);
}

// The workflow runs every hour; only send during the chosen local hour (or when run by hand).
const now = new Date();
const localHour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(now));
if (FORCE !== 'true' && localHour !== hourWanted) {
  console.log(`Local hour in ${timeZone} is ${localHour}, sending at ${hourWanted}. Skipping.`);
  process.exit(0);
}

// Idea of the day: the same for everyone on a given date, cycling through the whole library.
const ideas = JSON.parse(fs.readFileSync(new URL('../ideas.json', import.meta.url)));
const dayNumber = Math.floor(Date.parse(new Intl.DateTimeFormat('en-CA', { timeZone }).format(now)) / 86400000);
const idea = ideas[(dayNumber * 7919) % ideas.length];

webpush.setVapidDetails(SITE, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const payload = JSON.stringify({
  title: `💡 ${idea.title}`,
  body: `${idea.text} Tap to read it, and keep your streak going 🔥`,
  url: `${SITE}read?ctx=ids:${encodeURIComponent(idea.id)}`,
  tag: 'daily',
});

try {
  const res = await webpush.sendNotification(JSON.parse(PUSH_SUBSCRIPTION), payload, { TTL: 6 * 3600 });
  console.log(`Sent "${idea.title}" (status ${res.statusCode}).`);
} catch (err) {
  console.error(`Push failed (status ${err.statusCode ?? '?'}): ${err.body ?? err.message}`);
  if (err.statusCode === 404 || err.statusCode === 410) {
    console.error('The subscription has expired. Turn notifications off and on again in the app, then update the secret.');
  }
  process.exit(1);
}
