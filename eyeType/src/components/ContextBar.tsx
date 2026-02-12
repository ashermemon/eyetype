import type { Dispatch, SetStateAction } from "react";

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
};

export default function ContextBar({ value, onChange }: Props) {
  return (
    <div className="context-bar-container">
      <input
        type="text"
        className="context-bar-input"
        placeholder="Enter context (Physical Keyboard)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="context-bar-clear" onClick={() => onChange("")}>
        ✕
      </button>
    </div>
  );
}
