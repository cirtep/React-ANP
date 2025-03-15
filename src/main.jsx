import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import AppProviders from "./contexts/AppProviders.jsx";
import "./index.css";
import "./styles/responsive.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AppProviders>
        <App />
      </AppProviders>
    </Router>
  </StrictMode>
);
