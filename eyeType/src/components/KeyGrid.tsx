import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import Key from "./Key";

type Props = {
  activeKey: { row: number; col: number } | null;
  typedString: string;
  setTypedString: Dispatch<SetStateAction<string>>;
  keyboardNum: number;
  setKeyboardNum: Dispatch<SetStateAction<number>>;
};

const KEYBOARD = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
  ["Z", "X", "C", "V", "B", "N", "M", ".", "?", "123"],
];
const NUMBOARD = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["@", "#", "$", "%", "&", "/", "+", "-", "*", "⌫"],
  ["<", ">", "=", ":", ";", ",", "!", ".", "?", "ABC"],
];

const EMOJIBOARD = [
  ["👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍"],
  ["👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍", "⌫"],
  ["👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍", "👍"],
];

export default function KeyGrid({
  activeKey,
  typedString,
  setTypedString,
  keyboardNum,
  setKeyboardNum,
}: Props) {
  const currentKeyboard =
    keyboardNum == 0 ? KEYBOARD : keyboardNum == 1 ? NUMBOARD : EMOJIBOARD;

  function switchKeys() {
    setKeyboardNum((prev) => (prev == 1 ? 0 : 1));
  }

  const keyRefs = useRef<(HTMLDivElement | null)[][]>([]);

  return (
    <div className="key-grid">
      {currentKeyboard.map((row, rowIndex) => (
        <div key={rowIndex} className="key-row">
          {row.map((key, keyIndex) => (
            <Key
              key={keyIndex}
              label={key}
              row={rowIndex}
              col={keyIndex}
              ref={(original: any) => {
                if (!keyRefs.current[rowIndex]) keyRefs.current[rowIndex] = [];
                keyRefs.current[rowIndex][keyIndex] = original;
              }}
              active={
                activeKey?.row === rowIndex && activeKey?.col === keyIndex
              }
              onSelect={() => {
                if (key === "123" || key === "ABC") {
                  switchKeys();
                } else if (key === "⌫") {
                  if (typedString.length >= 1) {
                    setTypedString((prev) => prev.slice(0, prev.length - 1));
                  }
                } else {
                  setTypedString((prev) => prev + key);
                }
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
