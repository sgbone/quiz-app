import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";

const mathJaxConfig = {
  options: { processHtmlClass: "mathjax-process" },
  tex: {
    processEscapes: true,
    inlineMath: [
      ["\\(", "\\)"],
      ["$", "$"],
    ],
    displayMath: [
      ["\\[", "\\]"],
      ["$$", "$$"],
    ],
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MathJaxContext version={3} config={mathJaxConfig}>
        <App />
      </MathJaxContext>
    </BrowserRouter>
  </React.StrictMode>
);
