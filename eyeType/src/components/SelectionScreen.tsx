import React from 'react'

type Props = {
    setStudyMode: (mode: "basic" | "pro" | null) => void;
}
    
export default function SelectionScreen({setStudyMode}: Props) {
  return (
    <div>
        <h1 className='main-text' style={{textAlign: "center", color: "#ffffff", fontSize: "2em"}}>
            Welcome to EyeType! Select a study mode to begin:
        </h1>
        <div className="selection-buttons">
            <button className="selection-button" onClick={() => {setStudyMode("basic")}}><h3 style={{textAlign: "center", fontSize: "1.5em", color: "#435058"}}>EyeType Basic</h3><p style={{textAlign: "center", fontSize: "1em", color: "#435058"}}>Character-by-Character Typing</p></button>
            <button className="selection-button" onClick={() => {setStudyMode("pro")}}><h3 style={{textAlign: "center", fontSize: "1.5em", color: "#435058"}}>EyeType Pro</h3><p style={{textAlign: "center", fontSize: "1em", color: "#435058"}}>AI Abbreviation Expansion</p></button>
        </div>
    </div>
  )
}