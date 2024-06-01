import React from "react";
import { createRoot } from "react-dom/client";
import { StateService } from "./service/StateService.js";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { Layout } from "./components/Layout.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  BarElement
} from 'chart.js';
import Annotation from "chartjs-plugin-annotation";
import { Routes } from "./Routes.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  Annotation,
  BarElement
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
        {
          Routes.map(x => <Route path={x.Path} element={x.Element} loader={x.Loader} />)
        }

        <Route path="/*" element={<Navigate to={defaultRoute} />} />
      </Route>
    ]));

  createRoot(domNode).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();