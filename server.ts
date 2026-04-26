import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";

// In-memory Database
const db = {
  users: [] as any[],
  transactions: [] as any[],
  auditLogs: [] as any[],
  customTokens: [] as any[],
  narratives: [] as any[],
  events: [] as any[],
  chats: [] as any[],
  trades: [] as any[],
  bots: [] as any[],
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

  // Trading Bot Engine Interval
  setInterval(() => {
    db.bots.forEach(bot => {
      if (bot.status === "ACTIVE") {
         // 30% chance to execute a trade every 5 seconds
         if (Math.random() < 0.3) {
           const isProfitable = Math.random() > 0.4; // 60% chance of profit
           // Between $5 to $100 change based on budget magnitude simulation
           const magnitude = (bot.budget * 0.05) * Math.random(); 
           const result = isProfitable ? magnitude : -magnitude;
           
           bot.totalProfit += result;
           bot.tradesExecuted++;
           
           if (bot.userId) {
              const user = db.users.find(u => u.id === bot.userId);
              if (user) {
                 user.balances.USD = (user.balances.USD || 0) + result;
                 db.transactions.push({
                   id: `bot-${crypto.randomUUID()}`,
                   userId: user.id,
                   type: 'BOT_TRADE',
                   amount: result,
                   currency: 'USD',
                   status: 'COMPLETED',
                   timestamp: new Date().toISOString(),
                   note: `Automated ${bot.strategy} execution on ${bot.asset}`
                 });
              }
           }
         }
      }
    });
  }, 5000);

  app.use(express.json());

  // API Routes
  const router = express.Router();

  router.get("/market", (req, res) => {
    res.json(db.marketPrices);
  });

  router.post("/profile", (req, res) => {
    const { userId, osrsUsername, discordId, theme, banner, avatar } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    if (osrsUsername !== undefined) user.osrsUsername = osrsUsername;
    if (discordId !== undefined) user.discordId = discordId;
    if (theme !== undefined) user.theme = theme;
    if (banner !== undefined) user.banner = banner;
    if (avatar !== undefined) user.avatar = avatar;
    
    res.json(user);
  });

  router.get("/tiers", (req, res) => {
    res.json(db.tiers);
  });

  router.get("/themes", (req, res) => {
    res.json(db.themes);
  });

  router.post("/banking/transact", (req, res) => {
    const { userId, type, asset, amount, address } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ error: "Invalid amount" });

    if (type === "WITHDRAW") {
       if ((user.balances[asset] || 0) < numAmount) {
          return res.status(400).json({ error: "Insufficient balance" });
       }
       user.balances[asset] -= numAmount;
    } else if (type === "DEPOSIT") {
       user.balances[asset] = (user.balances[asset] || 0) + numAmount;
    }

    db.transactions.unshift({
      id: crypto.randomUUID(),
      userId,
      asset,
      quoteAsset: "NETWORK/EXTERNAL",
      amount: numAmount,
      total: numAmount,
      type: type,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, balances: user.balances });
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
    if (!userId) {
      return res.json(db.transactions.slice(-100));
    }
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
    if (!user || (user.role !== "ADMIN" && user.role !== "AUDITOR")) return res.status(403).json({ error: "Forbidden: Admin or Auditor only" });
    
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

  router.post("/login", (req, res) => {
    const { accessKey, osrsUsername } = req.body;
    let rank = "Bronze";
    let role = "TRADER";
    if (accessKey === "monalisa") {
      rank = "Diamond";
      role = "ADMIN";
    } else if (accessKey === "auditor") {
      rank = "Silver";
      role = "AUDITOR";
    }
    
    // Find or create user
    // We match by osrsUsername if provided, or give a new ID
    let user = db.users.find(u => u.osrsUsername && u.osrsUsername === osrsUsername);
    if (!user) {
      const isFirstAdmin = db.users.filter(u=>u.role==="ADMIN").length === 0;
      if (isFirstAdmin && accessKey === "monalisa") {
        // Just let them be admin
      } else if (!osrsUsername) {
         return res.status(400).json({ error: "OSRS username is required for new accounts." });
      }
      
      const newId = `user-${crypto.randomUUID()}`;
      user = {
        id: newId,
        username: osrsUsername || "Admin",
        role: role,
        balances: { BTC: 0, ETH: 0, OSRS: 0, USDC: 0 },
        apiKeys: [],
        osrsUsername: osrsUsername || "",
        discordId: "",
        tier: rank,
        theme: "default",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1920"
      };
      db.users.push(user);
    } else {
      if (accessKey === "monalisa") {
         user.role = "ADMIN";
         user.tier = "Diamond";
      } else if (accessKey === "auditor" && user.role !== "ADMIN") {
         user.role = "AUDITOR";
         user.tier = "Silver";
      }
    }
    
    res.json(user);
  });

  router.get("/chats", (req, res) => {
    res.json(db.chats.slice(-100)); // Last 100 messages
  });

  router.post("/chats", (req, res) => {
    const { userId, message } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    const newChat = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.username,
      tier: user.tier,
      avatar: user.avatar,
      message,
      timestamp: new Date().toISOString()
    };
    db.chats.push(newChat);
    res.json(newChat);
  });

  router.get("/trades", (req, res) => {
    res.json(db.trades.filter(t => t.status === "OPEN"));
  });

  router.post("/trades", (req, res) => {
    const { userId, type, assetOffer, amountOffer, assetRequest, amountRequest } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    // In a real app we'd verify and lock balances here
    const newTrade = {
      id: crypto.randomUUID(),
      creatorId: user.id,
      creatorName: user.username,
      type, // 'BUY' or 'SELL'
      assetOffer,
      amountOffer: Number(amountOffer),
      assetRequest,
      amountRequest: Number(amountRequest),
      status: "OPEN",
      timestamp: new Date().toISOString()
    };
    db.trades.push(newTrade);
    res.json(newTrade);
  });

  router.post("/trades/:id/accept", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const trade = db.trades.find(t => t.id === id);
    const user = db.users.find(u => u.id === userId);
    if (!trade || !user) return res.status(404).json({ error: "Not found" });
    
    if (trade.creatorId === userId) return res.status(400).json({ error: "Cannot accept own trade" });
    if (trade.status !== "OPEN") return res.status(400).json({ error: "Trade not open" });
    
    // Process trade execution
    trade.status = "COMPLETED";
    trade.takerId = user.id;
    trade.takerName = user.username;
    trade.completedAt = new Date().toISOString();
    
    // Generate transaction records for both parties
    db.transactions.push({
      id: crypto.randomUUID(),
      userId: trade.creatorId,
      type: "TRADE_EXECUTION",
      amount: trade.amountRequest,
      currency: trade.assetRequest,
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      note: `Trade ${trade.id} fulfilled by ${user.username}`
    });
    db.transactions.push({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "TRADE_EXECUTION",
      amount: trade.amountOffer,
      currency: trade.assetOffer,
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
      note: `Accepted trade ${trade.id} from ${trade.creatorName}`
    });

    res.json(trade);
  });


  router.get("/bots", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const userBots = db.bots.filter(b => b.userId === String(userId));
    res.json(userBots);
  });

  router.post("/bots", (req, res) => {
    const { userId, name, asset, strategy, budget } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    const newBot = {
      id: crypto.randomUUID(),
      userId: user.id,
      name,
      asset,
      strategy,
      budget: Number(budget),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      tradesExecuted: 0,
      totalProfit: 0
    };
    db.bots.push(newBot);
    res.json(newBot);
  });

  router.post("/bots/:id/toggle", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const bot = db.bots.find(b => b.id === id && b.userId === userId);
    if (!bot) return res.status(404).json({ error: "Not found" });
    
    bot.status = bot.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    res.json(bot);
  });

  router.delete("/bots/:id", (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const initialLen = db.bots.length;
    db.bots = db.bots.filter(b => !(b.id === id && b.userId === userId));
    if (db.bots.length === initialLen) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  router.get("/admin/system", (req, res) => {
    const { userId } = req.query;
    const user = db.users.find(u => u.id === userId);
    if (!user || (user.role !== "ADMIN" && user.role !== "AUDITOR")) return res.status(403).json({ error: "Forbidden: Admin or Auditor only" });
    res.json({ users: db.users, transactions: db.transactions, auditLogs: db.auditLogs, tiers: db.tiers, themes: db.themes, narratives: db.narratives, events: db.events });
  });

  router.post("/admin/narratives", (req, res) => {
    const { userId, narratives } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });
    db.narratives = narratives;
    res.json(db.narratives);
  });

  router.post("/admin/events", (req, res) => {
    const { userId, events } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden: Admin only" });
    db.events = events;
    res.json(db.events);
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
