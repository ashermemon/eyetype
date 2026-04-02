import React, { useState } from 'react'
import lightThemeImg from '../assets/lightTheme.png'
import darkThemeImg from '../assets/darkTheme.png'

type Props = {
    setStudyMode: (mode: "basic" | "pro" | null) => void;
}
    
export default function SelectionScreen({setStudyMode}: Props) {

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const [step, setStep] = useState(1);
  
  const [temp, setTemp] = useState<"basic" | "pro" | null>(null);


  return (
    <div>
      
        {step === 1 && (
          <>
        <h1 className='main-text' style={{textAlign: "center", color: "#ffffff", fontSize: "2em", marginBottom: "40px"}}>
            Select a study mode to begin:
        </h1>
        <div className="selection-buttons">
            <button className="selection-button" onClick={() => {setStep(2);  setTemp("basic") }}>
                <h3 className="home-title" style={{textAlign: "center", fontSize: "1.5em", margin: 0}}>EyeType Basic</h3>
                <p style={{textAlign: "center", fontSize: "1em", margin: 0, marginTop: 20}}>Character-by-Character Typing</p>
            </button>
            <button className="selection-button" onClick={() => {setStep(2); setTemp("pro") }}>
                <h3 className="home-title" style={{textAlign: "center", fontSize: "1.5em", margin: 0}}>EyeType Pro</h3>
                <p style={{textAlign: "center", fontSize: "1em", margin: 0, marginTop: 20}}>AI Abbreviation Expansion</p>
            </button>
        </div>
        </>

      )}
      {step === 2 && (
        <>
        <h1 className='main-text' style={{textAlign: "center", color: "#ffffff", fontSize: "2em", marginBottom: "40px", marginTop: "40px"}}>
            Choose a theme preference:
        </h1>
        <div className="selection-buttons">
            <button className="selection-button" onClick={() => {
                document.body.classList.add('light-theme');
                setStudyMode(temp);
            }}>
                <h3 className="main-text" style={{textAlign: "center", fontSize: "1.5em", margin: 0, marginBottom: "20px", color:"#f0f0f0"}}>Light Theme</h3>
                <img style={{width: "100%", height: "100%", borderRadius: "2px"}} src={lightThemeImg} alt="Light Theme" />
            </button>
            <button className="selection-button" onClick={() => {
                document.body.classList.remove('light-theme');
                setStudyMode(temp);
            }}>
                <h3 className="main-text" style={{textAlign: "center", fontSize: "1.5em", margin: 0, marginBottom: "20px", color:"#f0f0f0"}}>Dark Theme</h3>
                <img style={{width: "100%", height: "100%", borderRadius: "2px"}} src={darkThemeImg} alt="Dark Theme" />
            </button>
        </div>  
        </>  
      )}    
    </div>
  )
}