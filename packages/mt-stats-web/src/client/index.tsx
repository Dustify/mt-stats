import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App.js";
import { StateService } from "./service/StateService.js";

(async () => {
  await StateService.init();

  const domNode = document.getElementById("app");

  if (!domNode) {
    return;
  }

  const root = createRoot(domNode);

  root.render(<App />);
})();