import { createRoot } from "react-dom/client";
import App from "./App";
import { registerOfflineServiceWorker } from "./lib/offline";
import "./index.css";

registerOfflineServiceWorker();
createRoot(document.getElementById("root")!).render(<App />);
