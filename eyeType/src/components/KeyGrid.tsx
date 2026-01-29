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

const NAMESELECT = [
  ["Newton", "Sam", "Preston", "Jacob", "Isaac"],
  ["Einstien", "Jack", "Timothy", "Yousef", "Asher"],
  ["Lorenzo", "Yuno", "Jason", "Justin", "Max"],
];

export default function KeyGrid({
  activeKey,
  typedString,
  setTypedString,
  keyboardNum,
  setKeyboardNum,
}: Props) {
  const currentKeyboard =
    keyboardNum == 0
      ? KEYBOARD
      : keyboardNum == 1
        ? NUMBOARD
        : keyboardNum == 2
          ? EMOJIBOARD
          : NAMESELECT;

  function switchKeys() {
    setKeyboardNum((prev) => (prev == 1 ? 0 : 1));
  }

  const keyRefs = useRef<(HTMLDivElement | null)[][]>([]);

  return (
    <div className="key-grid">
      {currentKeyboard.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="key-row"
          style={{
            gridTemplateColumns:
              keyboardNum === 3 ? `repeat(5, 1fr)` : `repeat(10, 1fr)`,
            gap: keyboardNum === 3 ? 22.5 : 10,
          }}
        >
          {row.map((key, keyIndex) => (
            <Key
              key={keyIndex}
              label={key}
              row={rowIndex}
              col={keyIndex}
              nameKey={keyboardNum == 3 ? true : false}
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
                    setTypedString((prev) => {
                      const arr = Array.from(prev);
                      arr.pop();
                      return arr.join("");
                    });
                  }
                } else if (keyboardNum == 3) {
                  setTypedString((prev) => prev + ` ${key} `);
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
