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
  ["👍", "👎", "❤️", "👋", "👏", "🙏", "🎉", "👀", "🥶", "🥵"],
  ["😀", "😢", "😟", "😡", "🥺", "😂", "😴", "🤒", "😭", "⌫"],
  ["🆘", "🛑", "😖", "⏳", "💧", "🍽️", "🚻", "🛏️", "💊", "🩺"],
];

const EMOJISTEXT = [
  [
    "[Yes]",
    "[No]",
    "[Love]",
    "[Hello]",
    "[Good job]",
    "[Thank you]",
    "[Congratulations]",
    "[Look here]",
    "[It is too cold.]",
    "[It is too hot.]",
  ],
  [
    "[I am happy.]",
    "[I am sad.]",
    "[I am worried.]",
    "[I am angry.]",
    "[Please]",
    "[That is funny.]",
    "[I am sleepy.]",
    "[I feel sick.]",
    "[I am very upset.]",
    "",
  ],
  [
    "[Help! This is an emergency!]",
    "[STOP PLEASE!]",
    "[I am in pain.]",
    "[Please wait]",
    "[I am thirsty.]",
    "[I am hungry.]",
    "[I need to use the washroom.]",
    "[I need to rest.]",
    "[I need my medication.]",
    "[I need a doctor.]",
  ],
];

const emojiToText = new Map<string, string>();

for (let row = 0; row < EMOJIBOARD.length; row++) {
  for (let column = 0; column < EMOJIBOARD[row].length; column++) {
    const emoji = EMOJIBOARD[row][column];
    const text = EMOJISTEXT[row][column];

    if (emoji && text) {
      emojiToText.set(emoji, text);
    }
  }
}

const NAMESELECT = [
  ["Newton", "Sam", "Preston", "Jacob", "Isaac", "Wilfred"],
  ["Einstien", "Jack", "Timothy", "Yousef", "Asher", "Ricardo"],
  ["Lorenzo", "Yuno", "Jason", "Justin", "Max", "Dominic"],
];

export function toSpokenText(sentence: string) {
  return Array.from(sentence)
    .map((char) => emojiToText.get(char) ?? char)
    .join("");
}

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

  const splits = keyboardNum === 3 ? [[0, 2], [2, 4], [4, 6]] : [[0, 3], [3, 7], [7, 10]];

  return (
    <div className="key-grid">
      {splits.map((bounds, blockIndex) => {
        const span = bounds[1] - bounds[0];
        
        return (
          <div 
            key={blockIndex} 
            className="keyboard-section"
            style={{ flex: span }}
          >
            {currentKeyboard.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="key-row"
                style={{
                  gridTemplateColumns: `repeat(${span}, 1fr)`
                }}
              >
                {row.slice(bounds[0], bounds[1]).map((key, kIdx) => {
                  const absoluteCol = bounds[0] + kIdx;
                  
                  return (
                    <Key
                      key={absoluteCol}
                      label={key}
                      row={rowIndex}
                      highAlert={
                        (absoluteCol == 0 || absoluteCol == 1) &&
                        rowIndex == 2 &&
                        keyboardNum === 2
                      }
                      col={absoluteCol}
                      nameKey={keyboardNum === 3}
                      ref={(original: any) => {
                        if (!keyRefs.current[rowIndex]) keyRefs.current[rowIndex] = [];
                        keyRefs.current[rowIndex][absoluteCol] = original;
                      }}
                      active={
                        activeKey?.row === rowIndex && activeKey?.col === absoluteCol
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
                        } else if (keyboardNum === 3) {
                          setTypedString((prev) => prev + ` ${key} `);
                        } else {
                          setTypedString((prev) => prev + key);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
