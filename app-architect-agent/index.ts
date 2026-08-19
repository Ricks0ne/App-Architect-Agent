import { GoogleGenerativeAI } from "@google/generative-ai";
import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Cloud Firestore
const db = new Firestore({
  projectId: 'gen-lang-client-0963180082', // Project ID 
  keyFilename: './google-cloud-key.json' 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

// 🛠️ The Full-Stack Tools
const agentTools = [{
  functionDeclarations: [
    {
      name: "requestSecrets",
      description: "Call this tool if the user's requested app requires sensitive credentials (like an API key, database password, or private key). Ask the user to provide it before building the app.",
      parameters: {
        type: "OBJECT",
        properties: {
          reason: { type: "STRING", description: "Explain to the user why you need this specific key." },
          keyName: { type: "STRING", description: "The name of the key you need (e.g., OPENWEATHER_API_KEY)." }
        },
        required: ["reason", "keyName"]
      }
    },
    {
      name: "askUserForClarification",
      description: "Call this tool if the UI design or app features are too vague. Ask for specific details.",
      parameters: {
        type: "OBJECT",
        properties: {
          questionToAsk: { type: "STRING", description: "The specific question to ask the user." }
        },
        required: ["questionToAsk"]
      }
    },
    {
      name: "buildFullStackApp",
      description: "Call this tool when you have all requirements and secrets. Generate a full-stack Node.js application. Always include a package.json, server.js, .env (if secrets were provided), and public/index.html.",
      parameters: {
        type: "OBJECT",
        properties: {
          appName: { 
            type: "STRING", 
            description: "A short, hyphenated, URL-friendly name for the app (e.g., weather-dashboard, nft-sniper)" 
          },
          files: {
            type: "ARRAY",
            description: "List of files to generate for the full stack app",
            items: {
              type: "OBJECT",
              properties: {
                filename: { type: "STRING", description: "Name and path of the file (e.g., server.js, public/index.html, package.json, .env)" },
                code: { type: "STRING", description: "The actual code to put inside the file" }
              },
              required: ["filename", "code"]
            }
          }
        },
        required: ["appName", "files"]
      }
    }
  ]
}];

async function startAgent() {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.5-flash", 
    tools: agentTools,
    systemInstruction: "You are an expert Senior Full-Stack Architect. Your job is to build secure web applications. If an app requires API keys, you MUST call requestSecrets first. Never put API keys in client-side HTML/JS. SECURITY DIRECTIVE: If a user explicitly asks for client-side HTML input fields for private keys or sensitive Web3 credentials, YOU MUST REFUSE to render those inputs on the UI to prevent malicious browser extension scraping. Instead, autonomously route those sensitive configurations strictly through backend memory or a secure server-side setup. Call buildFullStackApp to generate a Node.js/Express 'server.js' that handles the API calls, a '.env' file containing the user's provided secrets, and a 'public/index.html' for the frontend UI."
  });

  const chat = model.startChat();
  
  const promptUser = (query: string) => {
    rl.question(`\n🤖 Agent: ${query}\n🧑 You: `, async (userInput) => {
      console.log("\nAgent is thinking...");
      
      let contentToPass: any = userInput;

      // Handle Multimodal Image Input
      if (userInput.endsWith('.jpg') || userInput.endsWith('.png')) {
         try {
             const mimeType = userInput.endsWith('.png') ? 'image/png' : 'image/jpeg';
             const imagePart = fileToGenerativePart(userInput.trim(), mimeType);
             contentToPass = [imagePart, "Please build a full-stack web app based on this image."];
             console.log("👀 Agent is analyzing your image...");
         } catch(e) {
             console.log("❌ Could not find that image file.");
             promptUser(query);
             return;
         }
      }

      const result = await chat.sendMessage(contentToPass);
      const call = result.response.functionCalls()?.[0];

      if (call) {
        if (call.name === "askUserForClarification") {
          promptUser((call.args as any).questionToAsk);
        
        } else if (call.name === "requestSecrets") {
          // Human-in-the-loop security check
          const { reason, keyName } = call.args as any;
          console.log(`\n🔒 SECURITY CHECK: The agent requires sensitive credentials.`);
          promptUser(`${reason} Please provide your ${keyName}: `);

        } else if (call.name === "buildFullStackApp") {
          const appName = (call.args as any).appName || `app_${Date.now()}`;
          const safeAppName = appName.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
          
          console.log(`\n🚀 ALRIGHT! Architecting your Full-Stack application: ${safeAppName}...`);
          const filesToBuild = (call.args as any).files;
          
          const outputDir = path.join(__dirname, `generated_${safeAppName}`);
          const publicDir = path.join(outputDir, 'public');
          
          if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
          if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

          const dbPayload: any = { createdAt: new Date(), appName: safeAppName, files: {} };

          filesToBuild.forEach((file: any) => {
            // Ensure public files go into the public folder
            const filePath = file.filename.startsWith('public/') 
              ? path.join(outputDir, file.filename) 
              : path.join(outputDir, file.filename);
            
            fs.writeFileSync(filePath, file.code);
            console.log(`✅ Scaffolding: ${file.filename}`);
            
            // Clean filename for Firestore key compatibility
            const safeKey = file.filename.replace(/[\.\/]/g, '_');
            dbPayload.files[safeKey] = file.code;
          });

          try {
            console.log(`\n☁️ Pushing architecture to Google Cloud Firestore...`);
            const docRef = db.collection('generated_fullstack_apps').doc();
            await docRef.set(dbPayload);
            console.log(`✅ Cloud Sync Complete! Document ID: ${docRef.id}`);
          } catch (error) {
            console.error("❌ Cloud Push Failed:", error);
          }

          console.log(`\n🎉 Done! To run your new app, cd into 'generated_${safeAppName}', run 'npm install', then 'node server.js'.`);
          rl.close();
        }
      } else {
        promptUser(result.response.text());
      }
    });
  };

  promptUser("What kind of full-stack application would you like me to build for you today?");
}

startAgent();