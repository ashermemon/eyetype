import { useState } from "react";
import Key from "./Key";

type Props = {};

export default function KeyGrid({}: Props) {
  const KEYBOARD = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
    ["Z", "X", "C", "V", "B", "N", "M", ".", "?", "123"],
  ];
  const NUMBOARD = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
    ["Z", "X", "C", "V", "B", "N", "M", ".", "?", "ABC"],
  ];
  const [keyboardBool, setKeyboardBool] = useState(true); //false for numboard, true for keyboard

  const currentKeyboard = keyboardBool ? KEYBOARD : NUMBOARD;

  function switchKeys() {
    setKeyboardBool(!keyboardBool);
  }

  return (
    <div className="key-grid">
      {currentKeyboard.map((row, rowIndex) => (
        <div key={rowIndex} className="key-row">
          {row.map((key, keyIndex) => (
            <Key
              key={keyIndex}
              label={key}
              active={false}
              onSelect={() => {
                if (key == "123" || key == "ABC") {
                  switchKeys();
                }
                console.log(`Key ${key} selected`);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
