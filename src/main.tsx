import "./assets/css/index.css";
import App from "./App";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
