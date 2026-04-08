import type { Dispatch, SetStateAction } from "react";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
};

export interface ContextBarHandle {
  startMicrophone: () => void;
}

const ContextBar = forwardRef<ContextBarHandle, Props>(
  ({ value, onChange }, ref) => {
    const {
      transcript,
      resetTranscript,
      browserSupportsSpeechRecognition,
      isMicrophoneAvailable,
    } = useSpeechRecognition();

    const [speechEnabled, setSpeechEnabled] = useState(false);
    const [isTriggered, setIsTriggered] = useState(false);
    const prevTranscriptRef = useRef("");

    useImperativeHandle(ref, () => ({
      startMicrophone: () => {
        if (browserSupportsSpeechRecognition) {
          SpeechRecognition.startListening({ continuous: true });
          setSpeechEnabled(isMicrophoneAvailable);
        }
      },
    }));

    const lastSetValueRef = useRef("");

    useEffect(() => {
      if (transcript) {
        const lower = transcript.toLowerCase();
        const startTriggers = [
          "hi eyetype",
          "hi i type",
          "hi type",
          "hi eye type",
          "hey eye type",
          "hey eyetype",
          "hey i type",
          "hey type",
          "high i type",
          "high type",
          "high eyetype",
          "high eye type",
          "hello i type",
          "hello type",
          "hello eye type",
          "hello eyetype",
          "start context",
          "context start",
          "start contacts",
          "contacts start",
        ];

        const stopTriggers = [
          "stop eyetype",
          "stop i type",
          "stop type",
          "stop eye type",
          "end eye type",
          "end eyetype",
          "end i type",
          "end type",
          "end context",
          "context end",
          "end contacts",
          "contacts end",
          "stop context",
          "context stop",
          "stop contacts",
          "contacts stop",
          "stop contact",
          "contact stop",
          "end contact",
          "contact end",
        ];

        let startIndex = -1;
        let startTriggerLen = 0;
        for (const trigger of startTriggers) {
          const idx = lower.lastIndexOf(trigger);
          if (
            idx > startIndex ||
            (idx === startIndex && trigger.length > startTriggerLen)
          ) {
            startIndex = idx;
            startTriggerLen = trigger.length;
          }
        }

        let stopIndex = -1;
        for (const trigger of stopTriggers) {
          const idx = lower.lastIndexOf(trigger);
          if (idx > stopIndex) {
            stopIndex = idx;
          }
        }

        if (startIndex !== -1 && stopIndex > startIndex) {
          setIsTriggered(false);

          const betweenText = transcript
            .slice(startIndex + startTriggerLen, stopIndex)
            .trim();
          if (betweenText && betweenText !== lastSetValueRef.current) {
            lastSetValueRef.current = betweenText;
            onChange(betweenText);
          }
        } else if (startIndex !== -1) {
          setIsTriggered(true);
          const afterTrigger = transcript
            .slice(startIndex + startTriggerLen)
            .trim();
          if (afterTrigger && afterTrigger !== lastSetValueRef.current) {
            lastSetValueRef.current = afterTrigger;
            onChange(afterTrigger);
          }
        } else {
          setIsTriggered(false);
        }
      }
    }, [transcript, onChange]);

    return (
      <div className="context-bar-container">
        <input
          type="text"
          className="context-bar-input"
          style={isTriggered ? { border: "4px solid #ccc" } : {}}
          placeholder={
            speechEnabled
              ? 'Enter context (Physical Keyboard or say "Start/stop context")'
              : "Enter context (Physical Keyboard)"
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className="context-bar-clear"
          onClick={() => {
            onChange("");
            resetTranscript();
            prevTranscriptRef.current = "";
          }}
        >
          ✕
        </button>
      </div>
    );
  },
);

ContextBar.displayName = "ContextBar";
export default ContextBar;
