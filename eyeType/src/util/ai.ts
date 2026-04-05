const API_URL = "https://eyetype-server.fly.dev/api/generate";

export async function fetchExpansion(
  context: string, 
  abbreviation: string, 
  temperature: number = 0.7,
  externalSignal?: AbortSignal
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
        model: "eyetype", 
        prompt: prompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: 50,
          stop: ["1user", "1assistant", "1system", "2"]
        }
      }),
    });

    clearTimeout(timeoutId);
    // console.log(`ai.ts [LATENCY]: Received status ${response.status} for temp=${temperature}`);

    if (!response.ok) {
      //const errorText = await response.text();
      // console.error(`ai.ts [ERROR]: Status ${response.status}:`, errorText);
      return "";
    }

    const data = await response.json();
    // console.log(`ai.ts [SUCCESS]: result="${data.response?.trim()}"`);
    return data.response?.trim() || "";
  } catch (error: any) {
    if (error.name === 'AbortError') {
      if (externalSignal?.aborted) {
        // console.log(`ai.ts [CANCELLED]: Request aborted by user (temp=${temperature})`);
      } else {
        // console.error(`ai.ts [TIMEOUT]: Request exceeded 60s (temp=${temperature}). If this persists, check server logs with 'fly logs -a eyetype-server'`);
      }
    } else {
      // console.error(`ai.ts [EXCEPTION]:`, error);
    }
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchTop3Expansions(
  context: string, 
  abbreviation: string,
  signal?: AbortSignal
): Promise<string[]> {
  const temperatures = [0.7, 0.8, 0.9];
  const results = await Promise.all(
    temperatures.map(temp => fetchExpansion(context, abbreviation, temp, signal))
  );
  
  // Filter out empty results and duplicates
  return Array.from(new Set(results.map(r => r.trim()).filter(r => r.length > 0)));
}
