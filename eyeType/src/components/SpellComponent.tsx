import React from 'react'

type Props = {
    prediction: string;
    originalSentence: string;
    typedText: string;
    isFocused: boolean;
    setTypedText: any;
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    setIsWordChanged: (isChanged: boolean) => void;
}

export default function SpellComponent({
    prediction, 
    originalSentence,
    typedText,
    setTypedText, 
    isFocused,
    focusedIndex,
    setFocusedIndex,
    setIsWordChanged
}: Props) {

    const words = prediction.split(" ");
    const originalWords = originalSentence.split(" ");

    const handleFocusNavigation = (newIndex: number) => {
        setFocusedIndex(newIndex);
        
        const currentWord = words[newIndex] || "";
        const originalWord = originalWords[newIndex] || "";

        if (currentWord !== originalWord) {
       
            setTypedText(currentWord);
            setIsWordChanged(true);
        } else {
          
            setTypedText(currentWord.substring(0, 1));
            setIsWordChanged(false);
        }
    };

  return (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", height: "100%" }}>
        <button
            className="spell-arrow-button"
            highlight-color="#0088dd"
            onClick={() => {
                if (focusedIndex > 0) {
                    handleFocusNavigation(focusedIndex - 1);
                }
            }}
        >
            <p className="button-text" style={{ color: "#19191b", fontSize: "40px" }}>
                {"←"}
            </p>
        </button>

        <div style={{ display: "flex", margin: "auto", justifyContent: "center", alignItems: "center", maxWidth: "80%", flexWrap: "wrap", gap: "20px" }}>
            {words.map((word, i) => {
                const isCurrentFocused = i === focusedIndex && isFocused;
                return (
                    <span 
                        key={i} 
                        className={`spell-text-wrapper ${isCurrentFocused ? "spell-text-focused" : "spell-text-unfocused"}`}
                    >
                        {isCurrentFocused ? (
                            <span>{typedText}_</span>
                        ): (
                           <>{word}</> 
                        )}
                    </span>
                );
            })}
        </div>
  
        <button
            className="spell-arrow-button"
            highlight-color="#0088dd"
            onClick={() => {
                if (focusedIndex < words.length - 1) {
                    handleFocusNavigation(focusedIndex + 1);
                }
            }}
        >
            <p className="button-text" style={{ color: "#19191b", fontSize: "40px" }}>
                {"→"}
            </p>
        </button>
    </div>
  )
}