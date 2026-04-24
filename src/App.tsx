import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Exchange } from "./pages/Exchange";
import { Admin } from "./pages/Admin";
import { CustomTokenGen } from "./pages/CustomTokenGen";
import { Referral } from "./pages/Referral";
import { Settings } from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="exchange" element={<Exchange />} />
            <Route path="tokens" element={<CustomTokenGen />} />
            <Route path="referral" element={<Referral />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
