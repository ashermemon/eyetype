import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import KeyGrid from "./KeyGrid";
import TopBarButton from "./TopBarButton";
import PredictedSentence from "./PredictedSentence";

type Props = {
  activeKey: { row: number; col: number } | null;
};

export default function PrimaryUI({ activeKey }: Props) {
  const [typedString, setTypedString] = useState("");
  const [keyboardNum, setKeyboardNum] = useState(0); //0 for keyboard, 1 for numboard, 2 for emojiboard, 3 for name selector

  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.scrollLeft = input.scrollWidth;
  }, [typedString]);

  return (
    <>
      <div className="box-container">
        <PredictedSentence sentenceText="I want to go to the park 🤒. 🩺. 💊."></PredictedSentence>
        {/* the prediction model's output will go in sentenceText along with the 2nd and 3rd most likely outputs */}
        <PredictedSentence sentenceText="I'm waiting to go to the pool 🆘"></PredictedSentence>
        <PredictedSentence sentenceText="I was trying to go to the point 👍"></PredictedSentence>
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
