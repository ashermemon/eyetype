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
      
        {step === 3 ? (<>
        <h1 className='main-text' style={{textAlign: "center", color: "#ffffff", fontSize: "2em", marginBottom: "40px"}}>
            Calibration
        </h1>

                  <p className="main-text" style={{textAlign: "center", color: "#cccccc", fontSize: "1.5em", lineHeight: "1.5", width: "80%", margin: "auto", marginBottom: "30px"}}>
            Before beginning calibration, please ensure the following conditions are met: 
            <ul style={{textAlign: "left"}}>
                <li>The laptop is placed on a sturdy table and is not moving</li>
                <li>There is adequate lighting and the face is centered within the box</li>
                <li>There is no movement in the background</li>
            </ul>
            To ensure eye tracking accuracy, throughout calibration and while using the app, do not move your head or body. If excessive movement makes it difficult to use the app, you will need to recalibrate. 
        </p>


        <button className="selection-button" style={{width: '50%', margin: "auto"}} onClick={() => setStudyMode(temp)}>
          <h3 style={{textAlign: "center", fontSize: "2em", margin: 0}}>Proceed to Calibration</h3>
        </button>

</>) :
          <>
        <h1 className='main-text' style={{textAlign: "center", color: "#ffffff", fontSize: "2em", marginBottom: "40px"}}>
            {step === 1 ? "Select a study mode to begin:" : "Choose a theme preference:"}
        </h1>
        <div className="selection-buttons">
            <button className="selection-button" onClick={ () => {step === 1 ? [setStep(2),  setTemp("basic")] :  [document.body.classList.add('light-theme'), setStep(3)]}}>
                
                {step === 1 ?(
                <>
                  <h3 className="home-title" style={{textAlign: "center", fontSize: "1.5em", margin: 0}}>EyeType Basic</h3>
                  <p style={{textAlign: "center", fontSize: "1em", margin: 0, marginTop: 20}}>The base version of EyeType which involves typing out words character by character using eye gaze. This version excludes any predictive or AI functionality. Select a character group to zoom in, then select a character to type a letter to form words. To read a typed sentence aloud, click the speak button.</p>
                </>
                ):(
                <>
                <h3 className="main-text" style={{textAlign: "center", fontSize: "1.5em", margin: 0, marginBottom: "20px", color:"#f0f0f0"}}>Light Keyboard Theme</h3>
     
                <img style={{width: "100%", height: "100%", borderRadius: "2px"}} src={lightThemeImg} alt="Light Theme" />
                </>)}



            </button>
            <button className="selection-button" onClick={() => {step === 1 ? [setStep(2), setTemp("pro")] :  [document.body.classList.remove('light-theme'), setStep(3)]}}>

            {step === 1 ?(
              <>
                <h3 className="home-title" style={{textAlign: "center", fontSize: "1.5em", margin: 0}}>EyeType Pro</h3>
                <p style={{textAlign: "center", fontSize: "1em", margin: 0, marginTop: 20}}>This version of EyeType includes AI powered abbreviation expansion. Instead of typing whole words, type the first letter of each word in a phrase and the AI will suggest the full phrase. Click the speak button to read the typed sentence aloud or select the sentence itself to edit it.  </p>
              </>
            ) : (

                            <>
                <h3 className="main-text" style={{textAlign: "center", fontSize: "1.5em", margin: 0, marginBottom: "20px", color:"#f0f0f0"}}>Dark Keyboard Theme</h3>
                <img style={{width: "100%", height: "100%", borderRadius: "2px"}} src={darkThemeImg} alt="Dark Theme" />
              </>
            )}
            
            </button>
        </div>


        </> 
      }
      
 
    </div>
  )
}