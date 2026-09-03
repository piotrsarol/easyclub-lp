export async function requestGemini(endpoint, request) {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(endpoint, request);
    if (response.ok) return response.json();

    const responseBody = await response.text();
    const canRetry = [429, 500, 502, 503, 504].includes(response.status);
    if (!canRetry || attempt === maxAttempts) {
      throw new Error(`Gemini API zwróciło ${response.status}: ${responseBody}`);
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    const backoffSeconds = Math.min(30, 2 ** attempt * 2);
    const delaySeconds =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(30, retryAfter)
        : backoffSeconds;
    console.warn(
      `Gemini API zwróciło ${response.status}. Próba ${attempt + 1}/${maxAttempts} za ${delaySeconds}s.`,
    );
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }

  throw new Error("Nie udało się uzyskać odpowiedzi z Gemini API.");
}
