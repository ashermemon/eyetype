import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import KeyGrid from "./KeyGrid";
import TopBarButton from "./TopBarButton";

type Props = {
  activeKey: { row: number; col: number } | null;
};

export default function PrimaryUI({ activeKey }: Props) {
  const [typedString, setTypedString] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.scrollLeft = input.scrollWidth;
  }, [typedString]);

  return (
    <>
      <div className="top-bar-container">
        <div className="top-bar-input">
          <input
            readOnly
            ref={inputRef}
            type="text"
            className="top-bar-input-text"
            value={typedString}
            onChange={() => {}}
          ></input>
        </div>
        <div className="top-bar-divider">
          <TopBarButton color="#6EC0FF" textColor="#19191b" label="spell" />
          <TopBarButton color="#FFC054" textColor="#19191b" label="emoji" />

          <TopBarButton color="#D04C4C" textColor="#f0f0f0" label="name" />
        </div>
      </div>
      <KeyGrid
        activeKey={activeKey}
        typedString={typedString}
        setTypedString={setTypedString}
      ></KeyGrid>
    </>
  );
}
