import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KeyboardPage from "./pages/keyboardPage";
import SettingsPage from "./pages/settingsPage";
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
        <Route path="/keyboard" element={<KeyboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
