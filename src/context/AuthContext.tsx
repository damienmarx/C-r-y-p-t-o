import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  username: string;
  role: string;
  balances: Record<string, number>;
  osrsUsername?: string;
  discordId?: string;
  theme?: string;
  tier?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  refreshBalances: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User> = {
  admin: { id: "admin-1", username: "admin", role: "ADMIN", balances: { BTC: 5.2, ETH: 100, OSRS: 500000000, USD: 250000 }, tier: "Diamond", theme: "default", osrsUsername: "", discordId: "" },
  trader_joe: { id: "user-1", username: "trader_joe", role: "USER", balances: { BTC: 0.5, USDC: 10000, OSRS: 1000000 }, tier: "Bronze", theme: "default", osrsUsername: "Zezima", discordId: "joe#1234" }
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
  
  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshBalances, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
