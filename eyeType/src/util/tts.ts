let cachedVoices: SpeechSynthesisVoice[] = [];

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      cachedVoices = voices;
      resolve(voices);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        cachedVoices = speechSynthesis.getVoices();
        resolve(cachedVoices);
      };
    }
  });
}

export function speak(
  text: string,
  options?: {
    voiceName?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    interrupt?: boolean;
  },
) {
  if (!text) return;

  if (options?.interrupt !== false) {
    speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);

  const voice =
    cachedVoices.find((v) => v.name === options?.voiceName) ||
    cachedVoices.find((v) => v.name.includes("Google")) ||
    cachedVoices[0];

  if (voice) utterance.voice = voice;

  utterance.rate = options?.rate ?? 0.1;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  speechSynthesis.speak(utterance);
}
