import React from "react";
import TopBarButton from "./TopBarButton";
import { speak } from "../util/tts";
import { toSpokenText } from "./KeyGrid";

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
};

export default function PredictedSentence({ sentenceText }: Props) {
  return (
    <div className={"row-container"}>
      <div className="sentence-container">
        <text className="button-text" style={{ color: "#f0f0f0" }}>
          {sentenceText}
        </text>
      </div>
      <div>
        <TopBarButton
          color="#6EC0FF"
          textColor="#19191b"
          label="speak 💬"
          onClick={() => speakText(sentenceText)}
        />
      </div>
    </div>
  );
}
