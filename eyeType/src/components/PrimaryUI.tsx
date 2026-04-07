import { useLayoutEffect, useRef, useState, useEffect } from "react";
import KeyGrid from "./KeyGrid";
import TopBarButton from "./TopBarButton";
import PredictedSentence from "./PredictedSentence";
import ContextBar from "./ContextBar";
import HighlightKey, { resetKeystrokeCount } from "./HighlightKey";
import { fetchTop3Expansions } from "../util/ai";
import { speak } from "../util/tts";
import { toSpokenText, toAIText } from "./KeyGrid";
import SpellComponent from "./SpellComponent";

const stripPunctuationSpaces = (text: string) => {
  const sentence = text.split(" ");
  const result: string[] = [];
  for (const word of sentence) {
    if (!word) continue;
    const isAWord = /[a-zA-Z0-9]/.test(word);
    if (isAWord || result.length === 0) {
      result.push(word);
    } else {
      result[result.length - 1] += word;
    }
  }
  return result.join(" ");
};

type Props = {
  activeKey: { row: number; col: number } | null;
  gazeData: { x: number; y: number } | null;
  onHighlight: (row: number, col: number) => void;
  studyMode: "basic" | "pro" | null;
  isEyeTrackingActive?: boolean;
};

export default function PrimaryUI({ activeKey, gazeData, onHighlight, studyMode, isEyeTrackingActive = true }: Props) {
  const [typedString, setTypedString] = useState("");
  const [contextValue, setContextValue] = useState("");
  const [predictions, setPredictions] = useState<string[]>([]);
  const [keyboardNum, setKeyboardNum] = useState(0); //0 for keyboard, 1 for numboard, 2 for emojiboard, 3 for name selector
  const [zoomedSection, setZoomedSection] = useState<number | null>(null);
  const [spellMode, setSpellMode] = useState(false);
  const [spellSentence, setSpellSentence] = useState("");
  const [originalSentence, setOriginalSentence] = useState("");
  const [typedSpellText, setSpellTypedText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isWordChanged, setIsWordChanged] = useState(false);
  const [isSpellFocused, setIsSpellFocused] = useState(false);
  const [currentPredictionNum, setCurrentPredictionNum] = useState(-1);

  const [localActiveKey, setLocalActiveKey] = useState<{
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    setLocalActiveKey(activeKey);
  }, [activeKey]);

  useEffect(() => {
    setLocalActiveKey(null);
  }, [keyboardNum, zoomedSection]);

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
      const aiInput = toAIText(typedString);
      //console.log("PrimaryUI: Timer Fired! Fetching expansions for:", aiInput);
      setIsLoading(true);
      try {
        const results = await fetchTop3Expansions(contextValue, aiInput, controller.signal);
        if (!controller.signal.aborted) {
          //console.log("PrimaryUI: Setting predictions:", results);
          setPredictions(results);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          //console.log("PrimaryUI: Fetch aborted.");
        } else {
          //console.error("PrimaryUI: Error fetching expansions:", err);
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
  

  useEffect(() => {
    if (spellMode && spellSentence && isWordChanged) {
      const words = spellSentence.split(" ");
      if (words[focusedIndex] !== undefined) {
        words[focusedIndex] = typedSpellText;
        const newSentence = words.join(" ");
        if (newSentence !== typedString) {
          //setTypedString(newSentence);
          setSpellSentence(newSentence);
          setPredictions(predictions.map((p, i) => i === currentPredictionNum ? newSentence : p));
        
        }
      }
    }
  }, [typedSpellText, focusedIndex, spellMode, spellSentence, typedString, isWordChanged]);

  const handleSelectPrediction = (text: string, predictionNum: number) => {
    //setTypedString(text);
    setSpellMode(true);
    setSpellSentence(text);
    setOriginalSentence(text);
    setFocusedIndex(0);
    setIsWordChanged(false); 
    const firstWord = text.split(" ")[0];

    setSpellTypedText(firstWord.substring(0, 1));
    setIsSpellFocused(false);
    setCurrentPredictionNum(predictionNum);
    setTimeout(() => {
      setIsSpellFocused(true);
    }, 500);
  };

  const handleSpeak = () => {
    const spoken = toSpokenText(typedString.toLowerCase());
    speak(spoken, {
      voiceName: "Google UK English Female",
      rate: 0.85,
      interrupt: true,
    });
    resetKeystrokeCount(spoken);
  };

  const setSpellTypedTextWrapped = (updater: any) => {
    setSpellTypedText(updater);
    setIsWordChanged(true);
  }

  return (
    <>
      {isEyeTrackingActive && (
        <HighlightKey
          key={`${keyboardNum}-${zoomedSection}`}
          gazeData={gazeData}
          onHighlight={onHighlight}
        />
      )}
      {zoomedSection === null && (
        <>
          {spellMode ? (
            <div className="box-container" style={{ justifyContent: "center" }}>
              <SpellComponent 
                prediction={spellSentence}
                originalSentence={originalSentence}
                typedText={typedSpellText} 
                isFocused={isSpellFocused} 
                setTypedText={setSpellTypedText}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
                setIsWordChanged={setIsWordChanged}
              />
            </div>
          ) : (
            <>
              <ContextBar value={contextValue} onChange={setContextValue} />
              <div className="box-container">
                {studyMode === "pro" || studyMode === null ? (
                  <>
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
                          sentenceText={stripPunctuationSpaces(pred)}
                          onSelect={() => handleSelectPrediction(stripPunctuationSpaces(pred), i)}
                        />
                      ))
                    ) : !isLoading ? (
                      <>
                        <PredictedSentence
                          sentenceText={stripPunctuationSpaces("Welcome! Start typing to see predictions")}
         
                        /> 
                        <PredictedSentence
                          sentenceText={stripPunctuationSpaces("Abbreviations will be expanded here.")}
                  
                        />
                        <PredictedSentence
                          sentenceText={stripPunctuationSpaces("Click on a predicted sentence to edit/spell words")}
                
                        />
                      </>
                    ) : null}
                  </>
                ) : (
                    <div className="row-container" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                      <div className="top-bar-input" style={{ gridColumn: "span 2", backgroundColor: "#f4f4f5" }}>
                        <input
                          readOnly
                          ref={inputRef}
                          type="text"
                          className="top-bar-input-text"
                          style={{ color: "#18181b", fontSize: "6.5vh" }}
                          value={typedString}
                          onChange={() => {}}
                        />
                      </div>
                      <TopBarButton
                        color="#6EC0FF"
                        highlightColor="#0088dd"
                        textColor="#19191b"
                        label="speak 💬"
                        onClick={handleSpeak}
                      />
                    </div>
                )}
              </div>
            </>
          )}

          <div className={`top-bar-container ${studyMode === "basic" ? "basic-mode" : ""}`}>
            {studyMode !== "basic" && (
              spellMode ? (
                <TopBarButton
                  color="#f0f0f0"
                  textColor="#19191b"
                  label="← Back"
                  subtext="(Save edits)"
                  onClick={() => [setSpellMode(false),setSpellSentence(""),setSpellTypedText("")]}
                />
              ) : (
                <div className="top-bar-input">
                  <input
                    readOnly
                    ref={inputRef}
                    type="text"
                    className="top-bar-input-text"
                    value={typedString}
                    onChange={() => {}}
                  />
                </div>
              )
            )}
            <div className="top-bar-divider">
              {keyboardNum == 0 || keyboardNum == 1 ? (
                <>
                  <TopBarButton
                    color="#6EC0FF"
                    highlightColor="#0088dd"
                    textColor="#19191b"
                    label="clear"
                    onClick={() => spellMode ? setSpellTypedTextWrapped("") : setTypedString("")}
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
        </>
      )}
      <KeyGrid
        activeKey={localActiveKey}
        typedString={spellMode ? typedSpellText : typedString}
        keyboardNum={keyboardNum}
        setTypedString={spellMode ? setSpellTypedTextWrapped : setTypedString}
        setKeyboardNum={setKeyboardNum}
        zoomedSection={zoomedSection}
        setZoomedSection={setZoomedSection}
        studyMode={studyMode}
      ></KeyGrid>
    </>
  );
}
