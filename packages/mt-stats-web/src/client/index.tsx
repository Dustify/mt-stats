import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App.js";
import { StateService } from "./service/StateService.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

(async () => {
  await StateService.init();

  const domNode = document.getElementById("app");

  if (!domNode) {
    return;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
    },
  ]);

  const root = createRoot(domNode);

  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();