import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from './components/App.js';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const domNode = document.getElementById('app');

if (domNode) {
  const root = createRoot(domNode);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}