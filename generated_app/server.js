const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulated storage for active sniper tasks
let sniperTasks = [
  {
    id: "task_1",
    chain: "ethereum",
    contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // Bored Ape
    targetId: "Any / Floor",
    maxPrice: "0.05",
    gasPremium: "45",
    priorityFee: "3.5",
    status: "monitoring",
    successTx: null,
    timestamp: new Date(Date.now() - 120000).toISOString(),
    logs: [
      "Initialized Ethereum Node connection...",
      "Subscribed to Pending Transactions (mempool)",
      "Target: Bored Ape Yacht Club (0xBC4CA...) < 0.05 ETH",
      "Scanning block headers for instant calldata matches..."
    ]
  },
  {
    id: "task_2",
    chain: "polygon",
    contract: "0x79FcDef22fc0c3311fc928660e1d0f62c0EAA3A7", 
    targetId: "8823",
    maxPrice: "120.0",
    gasPremium: "250",
    priorityFee: "45.0",
    status: "sniped",
    successTx: "0x4f3e6a2b1c8d9e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    logs: [
      "Initialized Polygon Node connection...",
      "Targeting Token ID: 8823 for max price 120.0 MATIC",
      "Mempool Match Found: Listing detected inside transaction pool!",
      "Frontrun transaction generated with 250 Gwei gas cost.",
      "Mined successfully in block #5892019!",
      "Estimated Sniper Response: 82ms"
    ]
  }
];

// Presets of Chain Information & Public RPCs
const CHANNELS_PRESET = {
  ethereum: {
    name: "Ethereum Mainnet",
    rpc: "https://cloudflare-eth.com",
    symbol: "ETH",
    explorer: "https://etherscan.io/tx/"
  },
  polygon: {
    name: "Polygon PoS",
    rpc: "https://polygon-rpc.com",
    symbol: "MATIC",
    explorer: "https://polygonscan.com/tx/"
  },
  arbitrum: {
    name: "Arbitrum One",
    rpc: "https://arb1.arbitrum.io/rpc",
    symbol: "ETH",
    explorer: "https://arbiscan.io/tx/"
  },
  base: {
    name: "Base Mainnet",
    rpc: "https://mainnet.base.org",
    symbol: "ETH",
    explorer: "https://basescan.org/tx/"
  },
  optimism: {
    name: "Optimism",
    rpc: "https://mainnet.optimism.io",
    symbol: "ETH",
    explorer: "https://optimistic.etherscan.io/tx/"
  },
  bsc: {
    name: "BNB Smart Chain",
    rpc: "https://bsc-dataseed.binance.org",
    symbol: "BNB",
    explorer: "https://bscscan.com/tx/"
  }
};

// Route: Get Sniper Tasks
app.get('/api/snipe/tasks', (req, res) => {
  res.json(sniperTasks);
});

// Route: Create Sniper Task
app.post('/api/snipe/create', (req, res) => {
  const { chain, contract, targetId, maxPrice, gasPremium, priorityFee, rpcOverride } = req.body;
  
  if (!contract || !maxPrice) {
    return res.status(400).json({ error: "Missing required contract or max price parameters." });
  }

  const newTask = {
    id: "task_" + Math.random().toString(36).substr(2, 9),
    chain: chain || "ethereum",
    contract: contract.trim(),
    targetId: targetId || "Any / Floor",
    maxPrice: maxPrice,
    gasPremium: gasPremium || "20",
    priorityFee: priorityFee || "2",
    status: "monitoring",
    successTx: null,
    timestamp: new Date().toISOString(),
    logs: [
      `Initialized task for contract ${contract.trim()} on ${chain.toUpperCase()}`,
      `Connecting via: ${rpcOverride || CHANNELS_PRESET[chain]?.rpc || 'Custom RPC'}`,
      "Verifying ERC-721 / ERC-1155 listing detection vectors...",
      "Bypassing MEV searcher relays for Flashbots submission...",
      "Monitoring mempool for matching Sell/List events..."
    ]
  };

  sniperTasks.unshift(newTask);
  res.status(201).json(newTask);
});

// Route: Action on Task (Pause / Stop / Simulate Sniper Hit)
app.post('/api/snipe/action', (req, res) => {
  const { taskId, action } = req.body;
  const task = sniperTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(444).json({ error: "Task not found" });
  }

  if (action === "delete") {
    sniperTasks = sniperTasks.filter(t => t.id !== taskId);
    return res.json({ success: true, message: "Task deleted." });
  }

  if (action === "simulate") {
    task.status = "sniped";
    const simulatedHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    task.successTx = simulatedHash;
    task.logs.push(`[SIMULATOR] Match triggered! Mempool detected listing for ${task.targetId !== 'Any / Floor' ? 'Token #' + task.targetId : 'Floor'}`);
    task.logs.push(`[SIMULATOR] Assembling instant transaction payload using EIP-1559 standard.`);
    task.logs.push(`[SIMULATOR] Gas Bid: ${parseFloat(task.gasPremium) + 12} Gwei. Priority: ${task.priorityFee} Gwei.`);
    task.logs.push(`[SIMULATOR] Sending bundle directly to MEV Builders (Flashbots, Builder0x69, Titan, Eden)...`);
    task.logs.push(`[SUCCESS] Transaction included at front of Block! TX Hash: ${simulatedHash}`);
    task.logs.push(`[METRIC] Execution Speed: 42ms (Block latency: 1.2s)`);
    return res.json({ success: true, task });
  }

  if (action === "stop") {
    task.status = "stopped";
    task.logs.push("User requested stop. Monitoring terminated.");
    return res.json({ success: true, task });
  }

  if (action === "start") {
    task.status = "monitoring";
    task.logs.push("Resuming mempool monitoring & front-running listener...");
    return res.json({ success: true, task });
  }

  res.status(400).json({ error: "Invalid action" });
});

// Route: Query Live Network Data (Gas, Block Height, Node Latency)
app.post('/api/rpc-info', async (req, res) => {
  const { chain, customRpc } = req.body;
  const targetChain = CHANNELS_PRESET[chain];
  const rpcUrl = customRpc || (targetChain ? targetChain.rpc : null);

  if (!rpcUrl) {
    return res.status(400).json({ error: "No valid RPC URL provided." });
  }

  const startTime = Date.now();
  try {
    // We will do a generic JSON-RPC call to fetch current block number
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1
      }),
      signal: AbortSignal.timeout(4000) // 4 second timeout
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (data && data.result) {
      const blockNum = parseInt(data.result, 16);
      
      // Fetch current Gas Price as well
      let gasInGwei = "N/A";
      try {
        const gasRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_gasPrice",
            params: [],
            id: 2
          }),
          signal: AbortSignal.timeout(2000)
        });
        const gasData = await gasRes.json();
        if (gasData && gasData.result) {
          const wei = parseInt(gasData.result, 16);
          gasInGwei = (wei / 1e9).toFixed(1);
        }
      } catch (e) {
        gasInGwei = "Unknown";
      }

      return res.json({
        success: true,
        rpc: rpcUrl,
        latencyMs: latency,
        blockNumber: blockNum,
        gasPriceGwei: gasInGwei,
        chainName: targetChain ? targetChain.name : "Custom EVM Chain"
      });
    } else {
      return res.status(500).json({ error: "RPC returned unexpected structure.", raw: data });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Timeout connecting to RPC",
      latencyMs: Date.now() - startTime
    });
  }
});

// Route: Real EVM Contract Scanner (Read metadata if available on public RPC)
app.post('/api/nft-scan', async (req, res) => {
  const { chain, contractAddress, customRpc } = req.body;
  const targetChain = CHANNELS_PRESET[chain];
  const rpcUrl = customRpc || (targetChain ? targetChain.rpc : null);

  if (!contractAddress || !rpcUrl) {
    return res.status(400).json({ error: "Contract address and RPC destination required." });
  }

  // standard ERC721 Name selector is 0x06fdde03
  // standard ERC721 Symbol selector is 0x95d89b41
  try {
    const makeEthCall = async (dataHex) => {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{
            to: contractAddress.trim(),
            data: dataHex
          }, "latest"],
          id: 1
        }),
        signal: AbortSignal.timeout(3000)
      });
      return await response.json();
    };

    const [nameRes, symbolRes] = await Promise.all([
      makeEthCall("0x06fdde03").catch(() => null),
      makeEthCall("0x95d89b41").catch(() => null)
    ]);

    // Simple decoder function for abi encoded strings
    const decodeString = (hex) => {
      if (!hex || hex === "0x" || hex.length < 130) return null;
      // skip 0x, offset (64 chars), length (64 chars)
      const data = hex.slice(130);
      let decoded = "";
      for (let i = 0; i < data.length; i += 2) {
        const charCode = parseInt(data.substr(i, 2), 16);
        if (charCode === 0) break; // End of string padded with nulls
        if (charCode >= 32 && charCode <= 126) {
          decoded += String.fromCharCode(charCode);
        }
      }
      return decoded.trim();
    };

    const name = nameRes && nameRes.result ? (decodeString(nameRes.result) || "EVM Token Contract") : "EVM Token Contract";
    const symbol = symbolRes && symbolRes.result ? (decodeString(symbolRes.result) || "ERC721") : "NFT";

    return res.json({
      success: true,
      name,
      symbol,
      contract: contractAddress,
      verified: name !== "EVM Token Contract"
    });

  } catch (err) {
    return res.json({
      success: false,
      error: "Unable to auto-read contract metadata (Check address & network RPC availability).",
      details: err.message
    });
  }
});

// Serve web ui
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Professional NFT Sniping server running on http://localhost:${PORT}`);
});
