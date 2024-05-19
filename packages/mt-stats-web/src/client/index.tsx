import React from "react";
import { createRoot } from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from "./components/App.js";

(async () => {
// const gateways = await 

  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
    },
  ]);

  const domNode = document.getElementById("app");

  if (!domNode) {
    return;
  }

  const root = createRoot(domNode);

  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();