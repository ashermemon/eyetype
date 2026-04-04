import React, { useState, type SetStateAction } from 'react'

type Props = {
    prediction: string;
    typedText: string;
    isFocused: boolean;
    setTypedText: React.Dispatch<React.SetStateAction<string>>
}

export default function SpellComponent({prediction, typedText,setTypedText, isFocused}: Props) {

    const [focusedIndex, setFocusedIndex] = useState(0);

  return (
    <div style={{ display: "flex", margin: "auto", justifyContent: "center", alignItems: "center", maxWidth: "90%", flexWrap: "wrap", gap: "20px" }}>
        {prediction.split(" ").map((word, i) => {
            const isCurrentFocused = i === focusedIndex && isFocused;
            return (
                <span 
                    key={i} 
                    className={`spell-text-wrapper ${isCurrentFocused ? "spell-text-focused" : "spell-text-unfocused"}`}
                >
                
                    {isCurrentFocused ? (
                        <span>{word.substring(0,1)}{typedText}_</span>
                    ): (
                       <>{word}</> 
                    )}
                </span>
            );
        })}
    </div>
  )
}