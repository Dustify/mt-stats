import React from "react";
import { createRoot } from "react-dom/client";
import { StateService } from "./service/StateService.js";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { Signal, SignalLoader } from "./components/Signal.js";
import { Layout } from "./components/Layout.js";

(async () => {
  await StateService.init();

  const defaultGatewayId = StateService.Gateways[0].Id;

  const domNode = document.getElementById("app");

  if (!domNode) {
    return;
  }

  const defaultRoute = `${defaultGatewayId}/signal`;

  const router = createBrowserRouter(
    createRoutesFromElements([
      <Route element={<Layout />}>
        <Route path="/:gatewayId/signal" element={<Signal />} loader={SignalLoader} />,
        <Route path="/*" element={<Navigate to={defaultRoute} />} />
      </Route>
    ]));

  createRoot(domNode).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();