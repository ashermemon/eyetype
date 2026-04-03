import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/mainPage";
import "./styles/fonts.css";
import "./styles/index.css";
import { useEffect } from "react";
import { loadVoices } from "./util/tts";
import HomePage from "./pages/homePage";

function App() {
  useEffect(() => {
    loadVoices();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
