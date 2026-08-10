const githubDispatchUrl =
  "https://api.github.com/repos/piotrsarol/easyclub-lp/actions/workflows/blog-publish.yml/dispatches";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const dispatchToken = process.env.GITHUB_ACTIONS_DISPATCH_TOKEN;

  if (!cronSecret || !dispatchToken) {
    return Response.json({ error: "Cron publishing is not configured." }, { status: 500 });
  }

  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = await fetch(githubDispatchUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${dispatchToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: "main" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return Response.json({ error: "GitHub workflow dispatch failed." }, { status: 502 });
  }

  return Response.json({ dispatched: true });
}
