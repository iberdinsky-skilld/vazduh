import type { Config } from "@netlify/functions";

/**
 * Hourly tick for Drupal's cron.
 *
 * Pantheon runs Drupal cron about once an hour, but not on a container that
 * went to sleep from inactivity, and this site is quiet: the only clients are
 * this app (after the webhook) and visitors. Cron waits for a visit, the
 * visit waits for fresh data, fresh data waits for cron. So the tick lives
 * here: five past every hour, hit Drupal's cron URL. Drupal does the rest
 * (fetch sources, store, call /api/revalidate), orchestration stays in the CMS.
 *
 * Without DRUPAL_CRON_KEY it only wakes the container (a plain GET), and
 * Pantheon's own cron slot at half past can run.
 */
const pokeDrupalCron = async (req: Request) => {
  const { next_run } = (await req.json().catch(() => ({}))) as {
    next_run?: string;
  };
  const base =
    process.env.DRUPAL_BASE_URL ?? "https://dev-vazduh.pantheonsite.io";
  const key = process.env.DRUPAL_CRON_KEY;
  const url = key ? `${base}/cron/${key}` : `${base}/`;

  const started = Date.now();
  const res = await fetch(url, {
    headers: { "user-agent": "vazduh-cron-tick" },
  });
  console.log(
    `[poke-drupal-cron] ${key ? "cron" : "wake"} ${res.status} in ${Date.now() - started}ms, next run ${next_run ?? "?"}`,
  );
};

export default pokeDrupalCron;

export const config: Config = {
  // UTC. Drupal's guard runs the refresh at most once per clock hour anyway.
  schedule: "5 * * * *",
};
