import React from "react";
import { createRoot } from "react-dom/client";
import { StateService } from "./service/StateService.js";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import Signal from "./components/Signal.js";

(async () => {
  await StateService.init();

  const defaultGatewayId = StateService.Gateways[0].Id;

  const domNode = document.getElementById("app");

  if (!domNode) {
    return;
  }

  const root = createRoot(domNode);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/:gatewayId/:view" Component={Header} />
        </Routes>
        <main style={{ marginTop: 56 }} key="main">
          <Routes>
            <Route path="/:gatewayId/signal" Component={Signal} />
            <Route
              path="*"
              element={<Navigate to={defaultGatewayId + "/signal"} />}
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </React.StrictMode>
  );
})();