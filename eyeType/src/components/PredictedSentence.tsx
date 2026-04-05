import { useEffect } from "react";
import TopBarButton from "./TopBarButton";
import { speak } from "../util/tts";
import { toSpokenText } from "./KeyGrid";
import { resetKeystrokeCount } from "./HighlightKey";

function speakText(text: string) {
  const spoken = toSpokenText(text);

  speak(spoken, {
    voiceName: "Google UK English Female",
    rate: 0.85,
    interrupt: true,
  });
}

type Props = {
  sentenceText: string;
  onSelect?: (text: string) => void;
};





export default function PredictedSentence({ sentenceText, onSelect }: Props) {
  return (
    <div className={"row-container"}>
      <button className="sentence-container" onClick={() => onSelect && onSelect(sentenceText)}>
        <span
          className="button-text"
          style={{ color: "#f0f0f0", textAlign: "left", width: "100%" }}
        >
          {sentenceText}
        </span>
      </button>
      <div>
        <TopBarButton
          color="#6EC0FF"
          highlightColor="#0088dd"
          textColor="#19191b"
          label="speak 💬"
          onClick={() => {
            speakText(sentenceText);
            resetKeystrokeCount(sentenceText);
          }}
        />
      </div>
    </div>
  );
}
