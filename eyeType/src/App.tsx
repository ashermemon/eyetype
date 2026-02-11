import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import "./styles/fonts.css";
import "./styles/index.css";
import { useEffect } from "react";
import { loadVoices } from "./util/tts";

function App() {
  useEffect(() => {
    loadVoices();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
