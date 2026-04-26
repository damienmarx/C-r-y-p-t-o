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
  banner?: string;
}

interface AuthContextType {
  user: User | null;
  login: (osrsUsername: string, accessKey?: string) => void;
  logout: () => void;
  refreshBalances: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (osrsUsername: string, accessKey?: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ osrsUsername, accessKey })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        const err = await res.json();
        alert(err.error || "Login failed");
      }
    } catch (e) {
      console.error(e);
      alert("Network Error");
    }
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
