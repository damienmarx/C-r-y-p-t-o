import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";

// In-memory Database for Demonstration
const db = {
  users: [
    { id: "admin-1", username: "admin", role: "ADMIN", balances: { BTC: 5.2, ETH: 100, OSRS: 500000000, USD: 250000 }, apiKeys: [{ id: "1", name: "Trading Bot Alpha", key: "sk_osrs_live_8f93j2m41xyz", created: "2026-01-14T08:00:00Z" }], osrsUsername: "", discordId: "", tier: "Diamond", theme: "default" },
    { id: "user-1", username: "trader_joe", role: "USER", balances: { BTC: 0.5, USDC: 10000, OSRS: 1000000 }, apiKeys: [], osrsUsername: "Zezima", discordId: "joe#1234", tier: "Bronze", theme: "default" }
  ],
  transactions: [] as any[],
  auditLogs: [] as any[],
  customTokens: [] as any[],
  marketPrices: {
    BTC: 65000.0,
    ETH: 3500.0,
    LTC: 85.0,
    USDC: 1.0,
    USDT: 1.0,
    OSRS: 0.00025, // 1M OSRS Gold = ~$0.25
  },
  tiers: [
    { id: "1", name: "Bronze", color: "#CD7F32", requirements: "0 USD Volume" },
    { id: "2", name: "Silver", color: "#C0C0C0", requirements: "10,000 USD Volume" },
    { id: "3", name: "Gold", color: "#FFD700", requirements: "50,000 USD Volume" },
    { id: "4", name: "Diamond", color: "#00FFFF", requirements: "Invite Only" }
  ],
  themes: [
    { id: "default", name: "Luxury Gold", primary: "#C5A059", bg: "#0A0B0D" },
    { id: "cyber", name: "Cyberpunk V2", primary: "#00FF41", bg: "#050A0F" },
    { id: "blood", name: "Crimson Matrix", primary: "#FF3366", bg: "#0F0505" }
  ]
};

// Market simulation loop
setInterval(() => {
  const volatilities: Record<string, number> = { BTC: 0.001, ETH: 0.0015, LTC: 0.002, OSRS: 0.005, USDC: 0.00001, USDT: 0.00001 };
  Object.keys(db.marketPrices).forEach(asset => {
    const change = 1 + (Math.random() * volatilities[asset] * 2 - volatilities[asset]);
    db.marketPrices[asset as keyof typeof db.marketPrices] *= change;
  });
}, 2000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  const router = express.Router();

  router.get("/market", (req, res) => {
    res.json(db.marketPrices);
  });

  router.post("/profile", (req, res) => {
    const { userId, osrsUsername, discordId, theme } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    if (osrsUsername !== undefined) user.osrsUsername = osrsUsername;
    if (discordId !== undefined) user.discordId = discordId;
    if (theme !== undefined) user.theme = theme;
    
    res.json(user);
  });

  router.get("/tiers", (req, res) => {
    res.json(db.tiers);
  });

  router.get("/themes", (req, res) => {
    res.json(db.themes);
  });

  router.post("/trade", (req, res) => {
    const { userId, type, asset, amount, quoteAsset } = req.body;
    
    // Auth Check
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Ensure assets exist in prices
    const price = db.marketPrices[asset as keyof typeof db.marketPrices];
    const quotePrice = db.marketPrices[quoteAsset as keyof typeof db.marketPrices];
    
    if (!price || !quotePrice) return res.status(400).json({ error: "Invalid trading pair" });

    // Fees: Maker 0.1%, Taker 0.2%. Assume Taker.
    const feeRate = 0.002;
    const valueInQuote = (amount * price) / quotePrice;
    const feeInQuote = valueInQuote * feeRate;
    const totalQuote = type === "BUY" ? valueInQuote + feeInQuote : valueInQuote - feeInQuote;

    // Fast mock execution without balance checks for preview purposes
    const tx = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      type,
      asset,
      amount,
      quoteAsset,
      priceConfigured: price,
      fee: feeInQuote,
      total: totalQuote,
      status: "COMPLETED",
      signature: crypto.createHash("sha256").update(`${userId}-${new Date().getTime()}`).digest("hex")
    };

    db.transactions.push(tx);
    db.auditLogs.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "TRADE_EXECUTED",
      details: tx,
      severity: "INFO"
    });

    res.json(tx);
  });

  router.get("/transactions", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const userTxs = db.transactions.filter(t => t.userId === String(userId));
    res.json(userTxs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)); // send latest 10 returning array
  });

  router.get("/keys", (req, res) => {
    const { userId } = req.query;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.json(user.apiKeys || []);
  });

  router.post("/keys", (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    if (!user.apiKeys) user.apiKeys = [];
    const newKey = {
      id: crypto.randomBytes(8).toString("hex"),
      name: `Integration Node ${user.apiKeys.length + 1}`,
      key: `sk_osrs_live_${crypto.randomBytes(16).toString("hex")}`,
      created: new Date().toISOString()
    };
    user.apiKeys.push(newKey);
    res.json(newKey);
  });

  router.delete("/keys/:id", (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    if (user.apiKeys) {
       user.apiKeys = user.apiKeys.filter(k => k.id !== req.params.id);
    }
    res.json({ success: true });
  });

  router.get("/admin/infrastructure", (req, res) => {
    const { userId } = req.query;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });
    
    // Send mocked VPS and env configs
    res.json({
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 3000,
      databaseUrl: process.env.DATABASE_URL ? "Configured (Hidden)" : "Missing / Not Configured",
      tunnelUrl: process.env.PUBLIC_DOMAIN || "Missing / Not Configured",
      tunnelId: process.env.CLOUDFLARE_TUNNEL_ID ? "Configured (Hidden)" : "Missing / Not Configured",
      vpsMemory: "16GB Allocated (8% usage)",
      vpsCPU: "8 Cores (1.2% usage)"
    });
  });

  router.post("/admin/market", (req, res) => {
    const { userId, asset, price } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });

    db.marketPrices[asset as keyof typeof db.marketPrices] = Number(price);

    db.auditLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "MARKET_ASSET_MODIFIED",
      details: `Admin force updated asset ${asset} to peg ${price}`,
      severity: "WARNING"
    });

    res.json(db.marketPrices);
  });

  router.delete("/admin/market/:asset", (req, res) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });

    delete (db.marketPrices as any)[req.params.asset];
    
    db.auditLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "MARKET_ASSET_DELETED",
      details: `Admin deleted asset ${req.params.asset} from global liquidity pool`,
      severity: "CRITICAL"
    });

    res.json(db.marketPrices);
  });

  router.post("/admin/tiers", (req, res) => {
    const { userId, tiers } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });

    db.tiers = tiers;
    
    db.auditLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "TIERS_UPDATED",
      details: `Admin updated progression tiers.`,
      severity: "INFO"
    });
    res.json(db.tiers);
  });

  router.post("/admin/themes", (req, res) => {
    const { userId, themes } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });

    db.themes = themes;
    
    db.auditLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "THEMES_UPDATED",
      details: `Admin updated visual theme presets.`,
      severity: "INFO"
    });
    res.json(db.themes);
  });

  router.get("/admin/system", (req, res) => {
    const { userId } = req.query;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });
    res.json({ users: db.users, transactions: db.transactions, auditLogs: db.auditLogs, tiers: db.tiers, themes: db.themes });
  });

  router.post("/admin/system", (req, res) => {
    const { userId, updates } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });
    
    // Process updates for users or configs
    if (updates?.users) {
       updates.users.forEach((updatedUser: any) => {
         const idx = db.users.findIndex(u => u.id === updatedUser.id);
         if (idx !== -1) db.users[idx] = { ...db.users[idx], ...updatedUser };
       });
    }

    db.auditLogs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "SYSTEM_RECONFIGURED",
      details: "Transcription & user data altered.",
      severity: "CRITICAL"
    });

    res.json({ success: true, logs: db.auditLogs, users: db.users });
  });

  router.get("/audit", (req, res) => {
    const { userId } = req.query;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });
    
    res.json({ logs: db.auditLogs, transactions: db.transactions });
  });

  router.post("/custom-tokens", (req, res) => {
    const { userId, name, ticker, supply, description, eventOrigin } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

    const token = { id: crypto.randomUUID(), name, ticker, supply, description, eventOrigin, createdAt: new Date().toISOString() };
    db.customTokens.push(token);
    
    db.auditLogs.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: "CUSTOM_TOKEN_MINT",
      details: token,
      severity: "WARNING"
    });

    res.json(token);
  });

  app.use("/api", router);

  // Vite middleware for dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
