import React from "react";
import ReactDOM from "react-dom/client";
import { ShapeProvider } from "@/lib/shape-context";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ShapeProvider defaultShape="rounded">
      <App />
    </ShapeProvider>
  </React.StrictMode>,
);
