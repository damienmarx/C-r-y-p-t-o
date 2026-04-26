import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Exchange } from "./pages/Exchange";
import { Admin } from "./pages/Admin";
import { CustomTokenGen } from "./pages/CustomTokenGen";
import { Referral } from "./pages/Referral";
import { Settings } from "./pages/Settings";
import { Banking } from "./pages/Banking";
import { GlobalChat } from "./pages/GlobalChat";
import { P2PTrading } from "./pages/P2PTrading";
import { Explorer } from "./pages/Explorer";
import { Bots } from "./pages/Bots";
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
            <Route path="banking" element={<Banking />} />
            <Route path="chat" element={<GlobalChat />} />
            <Route path="p2p" element={<P2PTrading />} />
            <Route path="explorer" element={<Explorer />} />
            <Route path="bots" element={<Bots />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
