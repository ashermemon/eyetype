import Key from "./Key";

type Props = {};

export default function KeyGrid({}: Props) {
  const KEYBOARD = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
    ["Z", "X", "C", "V", "B", "N", "M", ".", "?", "123"],
  ];

  return (
    <div className="key-grid">
      {KEYBOARD.map((row, rowIndex) => (
        <div key={rowIndex} className="key-row">
          {row.map((key, keyIndex) => (
            <Key
              key={keyIndex}
              label={key}
              active={false}
              onSelect={() => {
                console.log(`Key ${key} selected`);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
