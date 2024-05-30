import React from "react";
import { createRoot } from "react-dom/client";
import { StateService } from "./service/StateService.js";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { Signal, SignalLoader } from "./components/Signal.js";
import { Layout } from "./components/Layout.js";
import { Util, UtilLoader } from "./components/Util.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import Annotation from "chartjs-plugin-annotation";
import { Packets, PacketsLoader } from "./components/Packets.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  Annotation
);

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
        <Route path="/:gatewayId/util" element={<Util />} loader={UtilLoader} />,
        <Route path="/:gatewayId/packets" element={<Packets />} loader={PacketsLoader} />,
        <Route path="/*" element={<Navigate to={defaultRoute} />} />
      </Route>
    ]));

  createRoot(domNode).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();