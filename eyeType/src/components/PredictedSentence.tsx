import React from "react";
import TopBarButton from "./TopBarButton";

type Props = {
  sentenceText: string;
};

export default function PredictedSentence({ sentenceText }: Props) {
  return (
    <div className="sentence-container">
      <text className="button-text" style={{ color: "#f0f0f0" }}>
        {sentenceText}
      </text>
      <div>
        <TopBarButton
          color="#6EC0FF"
          textColor="#19191b"
          label="speak"
          onClick={() => console.log("dfjska")}
        />
      </div>
    </div>
  );
}
