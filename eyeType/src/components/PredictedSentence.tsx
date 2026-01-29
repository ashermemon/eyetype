import React from "react";

type Props = {
  sentenceText: string;
};

export default function PredictedSentence({ sentenceText }: Props) {
  return (
    <div className="sentence-container">
      <text className="button-text" style={{ color: "#f0f0f0" }}>
        {sentenceText}
      </text>
    </div>
  );
}
