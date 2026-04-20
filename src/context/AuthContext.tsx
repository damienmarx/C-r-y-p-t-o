import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  username: string;
  role: string;
  balances: Record<string, number>;
}

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  refreshBalances: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: React.ComponentProps<any> = {
  admin: { id: "admin-1", username: "admin", role: "ADMIN", balances: { BTC: 5.2, ETH: 100, OSRS: 500000000, USD: 250000 } },
  trader_joe: { id: "user-1", username: "trader_joe", role: "USER", balances: { BTC: 0.5, USDC: 10000, OSRS: 1000000 } }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USERS.trader_joe); // auto-login for prototype

  const login = (username: string) => {
    setUser(MOCK_USERS[username] || null);
  };

  const logout = () => setUser(null);

  const refreshBalances = () => {
    // In a real app we'd fetch from backend. For prototype, we mutate locally or just trigger render
    setUser(prev => prev ? { ...prev } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshBalances }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
