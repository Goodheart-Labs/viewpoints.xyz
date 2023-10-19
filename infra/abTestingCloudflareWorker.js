// Config
// -----------------------------------------------------------------------------

const polisBaseUrl = "https://pol.is";
const viewpointsBaseUrl = "https://viewpoints.xyz/polls";
const cookieName = "ab-test";

// Options
// -----------------------------------------------------------------------------

const OPTIONS_POLIS = "polis";
const OPTIONS_SHUFFLE = "viewpoints";

// Redirect Body
// -----------------------------------------------------------------------------

const REDIRECT_BODY = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Redirecting...</title>
        <meta http-equiv="refresh" content="0; URL='{{redirectUrl}}'" />
    </head>
    <body>
        <script>
            window.location.href = "{{redirectUrl}}"
        </script>
    </body>
</html>
`;

// Handler
// -----------------------------------------------------------------------------

async function handleRequest(request) {
  const url = new URL(request.url);
  const pollId = url.pathname.split("/")[3];
  const override = url.searchParams.get("override");

  const headers = {
    "Content-Type": "text/html",
  };

  if (override === OPTIONS_SHUFFLE) {
    const redirectUrl = `${viewpointsBaseUrl}/${pollId}`;
    const body = REDIRECT_BODY.replaceAll("{{redirectUrl}}", redirectUrl);

    return new Response(body, { headers });
  } else if (override === OPTIONS_POLIS) {
    const redirectUrl = `${polisBaseUrl}/${pollId}`;
    const body = REDIRECT_BODY.replaceAll("{{redirectUrl}}", redirectUrl);

    return new Response(body, { headers });
  }

  const cookies = request.headers.get("Cookie") || "";
  const abTestCookie = cookies.match(new RegExp(`${cookieName}=([^;]+)`));

  let choice;

  if (abTestCookie) {
    // If the user has already been assigned, use their existing choice

    choice = abTestCookie[1];
  } else {
    // Otherwise, randomly assign the user to one of the two options

    choice = Math.random() < 0.5 ? OPTIONS_POLIS : OPTIONS_SHUFFLE;

    // Persist the choice by setting the cookie

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const cookieHeader = `${cookieName}=${choice}; Expires=${expiryDate.toUTCString()}; Path=/`;

    headers["Set-Cookie"] = cookieHeader;
  }

  // We'll need to handle the redirect 'manually' so that the cookie is set

  let redirectUrl = "";
  let body = "";

  if (choice === OPTIONS_SHUFFLE) {
    redirectUrl = `${viewpointsBaseUrl}/${pollId}`;
    body = REDIRECT_BODY.replaceAll("{{redirectUrl}}", redirectUrl);
  } else {
    redirectUrl = `${polisBaseUrl}/${pollId}`;
    body = REDIRECT_BODY.replaceAll("{{redirectUrl}}", redirectUrl);
  }

  return new Response(body, { headers });
}

// Events
// -----------------------------------------------------------------------------

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
