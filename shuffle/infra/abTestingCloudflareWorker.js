// Config
// -----------------------------------------------------------------------------

const polisBaseUrl = "https://pol.is";
const cookieName = "ab-test";

// Options
// -----------------------------------------------------------------------------

const OPTIONS_POLIS = "polis";
const OPTIONS_SHUFFLE = "shuffle";

// Handler
// -----------------------------------------------------------------------------

async function handleRequest(request) {
  const url = new URL(request.url);
  const pollId = url.pathname.split("/")[2];

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

    response.headers.append("Set-Cookie", cookieHeader);
  }

  if (choice === OPTIONS_SHUFFLE) {
    return fetch(request);
  } else {
    const redirectUrl = `${polisBaseUrl}/${pollId}`;
    return Response.redirect(redirectUrl, 307);
  }
}

// Events
// -----------------------------------------------------------------------------

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
