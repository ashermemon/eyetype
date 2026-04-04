import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dictaphone from '../components/voiceMicrophone';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Dictaphone></Dictaphone>
      <div className="splash-screen">
        <img src="/faviconSVG.svg" alt="EyeType Logo" className="splash-logo" />
      </div>
      
      <div className="fill-page home-animate" style={{justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', padding: '20px'}}>
          <h1 className="main-text home-title" style={{textAlign: "center", fontSize: "4.5em", marginBottom: "20px"}}>
            EyeType
          </h1>
          <p className="main-text" style={{textAlign: "center", color: "#cccccc", fontSize: "1.5em", marginBottom: "50px", lineHeight: "1.5"}}>
            Eyetype is an assistive communication system that allows for seamless expression for patients with severe motor impairments. By leveraging eye tracking and a fine-tuned LLM for speech prediction, Eyetype improves communication efficiency and effectiveness while being accessible to all.
          </p>
          
          <div className="selection-buttons" style={{width: '100%', justifyContent: 'center', marginTop: '0'}}>
            <button className="selection-button" style={{width: '50%'}} onClick={() => navigate('/study')}>
              <h3 style={{textAlign: "center", fontSize: "2em", margin: 0}}>Start Typing</h3>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}