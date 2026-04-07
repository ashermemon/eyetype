const API_URL = "https://eyetype-server.fly.dev/api/generate";

export async function fetchExpansion(
  context: string,
  abbreviation: string,
  temperature: number = 0.7,
  externalSignal?: AbortSignal,
): Promise<string> {
  const safeContext = context.trim() || "None";
  const prompt = `Context: ${safeContext}\nAbbreviation: ${abbreviation}\nFull phrase:`;

  //console.log(`ai.ts [START]: Abbr="${abbreviation}", Temp=${temperature}`);

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 60000); // 60s timeout

  // Combine external signal (for typing cancellation) with our timeout signal
  const combinedSignal = externalSignal
    ? AbortSignal.any([externalSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: combinedSignal,
      body: JSON.stringify({
        model: "eyetype-server-new2",
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: 50,
          stop: ["1user", "1assistant", "1system", "2"],
        },
      }),
    });

    clearTimeout(timeoutId);
    //console.log(
    //  `ai.ts [LATENCY]: Received status ${response.status} for temp=${temperature}`,
    //);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ai.ts [ERROR]: Status ${response.status}:`, errorText);
      return "";
    }

    const data = await response.json();
    //console.log(`ai.ts [SUCCESS]: result="${data.response?.trim()}"`);
    return data.response?.trim() || "";
  } catch (error: any) {
    if (error.name === "AbortError") {
      if (externalSignal?.aborted) {
        // console.log(
        //   `ai.ts [CANCELLED]: Request aborted by user (temp=${temperature})`,
        // );
      } else {
        // console.error(
        //   `ai.ts [TIMEOUT]: Request exceeded 60s (temp=${temperature}). If this persists, check server logs with 'fly logs -a eyetype-server'`,
        // );
      }
    } else {
      // console.error(`ai.ts [EXCEPTION]:`, error);
    }
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

const normalizePrediction = (text: string) =>
  text
    .trim()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export async function fetchTop3Expansions(
  context: string,
  abbreviation: string,
  onNewUniquePrediction?: (prediction: string) => void,
  signal?: AbortSignal,
): Promise<string[]> {
  const temperatures = [0.7, 0.8, 0.9];
  const uniqueResults = new Map<string, string>();

  const addResult = (result: string) => {
    const trimmed = result.trim();
    if (!trimmed) {
      return;
    }

    const normalized = normalizePrediction(trimmed);
    if (!normalized || uniqueResults.has(normalized)) {
      return;
    }

    uniqueResults.set(normalized, trimmed);
    onNewUniquePrediction?.(trimmed);
  };

  const initialPromises = temperatures.map((temp) =>
    fetchExpansion(context, abbreviation, temp, signal).then((response) => {
      if (!signal?.aborted) {
        addResult(response);
      }
      return response;
    }),
  );

  await Promise.all(initialPromises);

  const maxAdditionalAttempts = 10;
  let attempt = 0;

  while (
    uniqueResults.size < 3 &&
    attempt < maxAdditionalAttempts &&
    !signal?.aborted
  ) {
    const temp = temperatures[attempt % temperatures.length];
    const response = await fetchExpansion(context, abbreviation, temp, signal);
    if (signal?.aborted) {
      break;
    }
    addResult(response);
    attempt += 1;
  }

  return Array.from(uniqueResults.values()).slice(0, 3);
}
