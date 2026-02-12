import { useLayoutEffect, useRef, useState, useEffect } from "react";
import KeyGrid from "./KeyGrid";
import TopBarButton from "./TopBarButton";
import PredictedSentence from "./PredictedSentence";
import ContextBar from "./ContextBar";
import { fetchTop3Expansions } from "../utils/ai";

type Props = {
  activeKey: { row: number; col: number } | null;
};

export default function PrimaryUI({ activeKey }: Props) {
  const [typedString, setTypedString] = useState("");
  const [contextValue, setContextValue] = useState("");
  const [predictions, setPredictions] = useState<string[]>([]);
  const [keyboardNum, setKeyboardNum] = useState(0); //0 for keyboard, 1 for numboard, 2 for emojiboard, 3 for name selector

  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.scrollLeft = input.scrollWidth;
  }, [typedString]);

  const [isLoading, setIsLoading] = useState(false);

  // Debounced AI Expansion fetching
  useEffect(() => {
    if (!typedString.trim()) {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      console.log("PrimaryUI: Timer Fired! Fetching expansions for:", typedString);
      setIsLoading(true);
      try {
        const results = await fetchTop3Expansions(contextValue, typedString, controller.signal);
        if (!controller.signal.aborted) {
          console.log("PrimaryUI: Setting predictions:", results);
          setPredictions(results);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("PrimaryUI: Fetch aborted.");
        } else {
          console.error("PrimaryUI: Error fetching expansions:", err);
          setIsLoading(false);
        }
      }
    }, 2000); // 2s debounce as requested

    return () => {
      clearTimeout(timer);
      controller.abort(); // Cancel previous request if user types again
      setIsLoading(false);
    };
  }, [typedString, contextValue]);

  const handleSelectPrediction = (_text: string) => {
    // When a prediction is selected, we clear typing and predictions.
    setTypedString("");
    setPredictions([]);
    setIsLoading(false);
  };

  return (
    <>
      <ContextBar value={contextValue} onChange={setContextValue} />
      <div className="box-container">
        {isLoading && predictions.length === 0 && (
          <PredictedSentence
            sentenceText="Thinking..."
            onSelect={() => {}}
          />
        )}
        {predictions.length > 0 ? (
          predictions.map((pred, i) => (
            <PredictedSentence
              key={i}
              sentenceText={pred}
              onSelect={handleSelectPrediction}
            />
          ))
        ) : !isLoading ? (
          <>
            <PredictedSentence
              sentenceText="Welcome! Start typing to see predictions"
              onSelect={() => {}}
            />
            <PredictedSentence
              sentenceText="Abbreviations will be expanded here."
              onSelect={() => {}}
            />
            <PredictedSentence
              sentenceText="For example, type 'GM' for 'Good Morning!'"
              onSelect={() => {}}
            />
          </>
        ) : null}
      </div>

      <div className="top-bar-container">
        <div className="top-bar-input">
          <input
            readOnly
            ref={inputRef}
            type="text"
            className="top-bar-input-text"
            value={typedString}
            onChange={() => {}}
          ></input>
        </div>
        <div className="top-bar-divider">
          {keyboardNum == 0 || keyboardNum == 1 ? (
            <>
              <TopBarButton
                color="#6EC0FF"
                highlightColor="#0088dd"
                textColor="#19191b"
                label="spell"
                onClick={() => console.log("spell")}
              />
              <TopBarButton
                color="#FFC054"
                textColor="#19191b"
                label="emoji"
                onClick={() => setKeyboardNum(2)}
              />

              <TopBarButton
                color="#D04C4C"
                highlightColor="#a1300b"
                textColor="#f0f0f0"
                label="name"
                onClick={() => setKeyboardNum(3)}
              />
            </>
          ) : (
            <TopBarButton
              color="#f0f0f0"
              textColor="#19191b"
              label="← Back"
              onClick={() => setKeyboardNum(0)}
            />
          )}
        </div>
      </div>
      <KeyGrid
        activeKey={activeKey}
        typedString={typedString}
        keyboardNum={keyboardNum}
        setTypedString={setTypedString}
        setKeyboardNum={setKeyboardNum}
      ></KeyGrid>
    </>
  );
}
