import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
};

export default function ContextBar({ value, onChange }: Props) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  const [speechEnabled, setSpeechEnabled] = useState(false);
  const prevTranscriptRef = useRef("");

  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
      if(isMicrophoneAvailable){
        setSpeechEnabled(true);
      }
      else{
        setSpeechEnabled(false);
      }
    }
  }, []);


  useEffect(() => {
    if (speechEnabled && transcript && transcript !== prevTranscriptRef.current) {
      const newPart = transcript.slice(prevTranscriptRef.current.length).trim();
      if (newPart) {
        onChange((prev) => prev ? prev + " " + newPart : newPart);
      }
      prevTranscriptRef.current = transcript;
    }
  }, [transcript, speechEnabled]);

  return (
    <div className="context-bar-container">
      <input
        type="text"
        className="context-bar-input"
        placeholder={speechEnabled ? 'Enter context (Physical Keyboard or say "Hi eyetype")' : "Enter context (Physical Keyboard)"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="context-bar-clear" onClick={() => { onChange(""); resetTranscript(); prevTranscriptRef.current = ""; }}>
        ✕
      </button>
    </div>
  );
}
