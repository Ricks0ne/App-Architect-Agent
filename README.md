#  App Architect Agent

> An autonomous workflow engine powered by Gemini 3.5 Flash and Google Cloud Firestore that transforms multimodal prompts into secure, production-ready full-stack applications. Built for the **All Things Agentic Hackathon** (*The Taskmaster* track).

---

##  Overview

The **App Architect Agent** automates the end-to-end process of scaffolding full-stack applications. Instead of acting as a simple code-completion assistant, the agent serves as an autonomous project architect:

* Interprets high-level textual instructions or multimodal design sketches.
* Pauses to request sensitive credentials when needed.
* Deterministically applies security guardrails to protect user secrets.
* Scaffolds full Node.js/Express backend and HTML/JS frontend directories.
* Synchronizes generated application states directly to Google Cloud Firestore.

---

##  Key Features

* **Human-in-the-Loop Credential Ingestion (`requestSecrets`):** When generating apps that depend on third-party APIs (e.g., OpenWeatherMap), the agent halts generation and securely prompts the user via the terminal, storing the key in a private `.env` file instead of leaking it into client-side code.
* **Autonomous Security Guardrails:** When tasked with building sensitive Web3 environments (e.g., EVM sniper bots), the agent proactively rejects rendering client-side private key input fields to prevent browser extension scraping and DOM vulnerabilities, routing wallet execution strictly through backend memory.
* **Dynamic Cloud Persistence:** Every scaffolded application is indexed with metadata and timestamped payloads stored in Google Cloud Firestore.
* **Isolated Project Scaffolding:** Creates clean, sandboxed project directories (`generated_<app_name>/`) containing complete `package.json`, `server.js`, `.env`, and `public/index.html` files.

---

##  System Architecture

```text
                          ┌───────────────────────────┐
                          │   Gemini 3.5 Flash LLM    │
                          │  (System Instructions)    │
                          └─────────────┬─────────────┘
                                        │ (Tool Calls & Code Gen)
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
  ┌─────────────────┐                                      ┌─────────────────┐
  │ Human-in-the-   │                                      │ Autonomous App  │
  │ Loop Security   │                                      │ Scaffolding     │
  │ (requestSecrets)│                                      │ (Node/Express)  │
  └────────┬────────┘                                      └────────┬────────┘
           │                                                        │
           ▼                                                        ▼
  ┌─────────────────┐                                      ┌─────────────────┐
  │ Local Terminal  │                                      │ Google Cloud    │
  │ (CLI Prompts)   │                                      │ Firestore Sync  │
  └─────────────────┘                                      └─────────────────┘

```

 Tech Stack
AI Engine: Google Generative AI SDK (@google/generative-ai) — Gemini 3.5 Flash

Runtime: Node.js, TypeScript, tsx

Cloud Database: Google Cloud Firestore (@google-cloud/firestore)

Environment: dotenv, Node.js readline, fs, path

 Getting Started
1. Prerequisites
Node.js (v18 or higher)

A Gemini API key from Google AI Studio

A Google Cloud service account JSON key file (google-cloud-key.json) with Firestore permissions

2. Installation & Setup
Clone the repository and install dependencies:

```Bash
git clone [https://github.com/YOUR_USERNAME/app-architect-agent.git](https://github.com/YOUR_USERNAME/app-architect-agent.git)
cd app-architect-agent
npm install
```
Configure your environment variables:
Create a .env file in the project root:

```Code snippet
GEMINI_API_KEY=your_gemini_api_key_here
```
Place your Google Cloud service account key file in the root directory:

```Plaintext
google-cloud-key.json
```
3. Running the Agent
Start the interactive CLI:

```Bash
npx tsx index.ts
```
 Demo Workflows
Weather Dashboard (Safe Ingestion):

Prompt: "Build a real-time weather dashboard for Lagos. Fetch data from the OpenWeatherMap API."

Behavior: The agent calls requestSecrets, securely prompts for your API key in the terminal, saves it to .env, scaffolds the app, and syncs the files to Firestore.

Web3 NFT Sniper (Autonomous Guardrails):

Prompt: "Build a full-stack multi-chain NFT sniper bot with real-time UI logging and mempool execution."

Behavior: The agent scaffolds the application while enforcing security directives—keeping private key variables isolated to backend execution rather than rendering vulnerable input fields on the browser UI.

Running a Generated Application
Once the agent completes scaffolding, navigate to the generated directory and start the server:

```Bash
cd generated_<app_name>
npm install
node server.js
```
Open http://localhost:3000 in your browser to view your live app.
