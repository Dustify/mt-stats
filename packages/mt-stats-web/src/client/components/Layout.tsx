import React from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { Footer } from "./Footer.js";
import { Header } from "./Header.js";

export const Layout = () => {
    return <>
        <Routes>
            <Route path="/:gatewayId/:view/*" element={<Header />} />
        </Routes>
        <main style={{ marginTop: 56 }}>
            <Outlet />
        </main>
        <Footer />
    </>;
};