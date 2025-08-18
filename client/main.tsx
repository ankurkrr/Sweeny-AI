import "./global.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeViewportHandling } from "@/lib/viewport-utils";

// Initialize viewport handling for mobile keyboard support
initializeViewportHandling();

createRoot(document.getElementById("root")!).render(<App />);
