const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

function loadApiKey() {
    if (fs.existsSync('.env')) {
        const content = fs.readFileSync('.env', 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        if (match) return match[1].trim();
    }
    return process.env.GEMINI_API_KEY;
}

const apiKey = loadApiKey();
if (!apiKey) {
    console.error("API KEY NOT FOUND");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const result = await genAI.listModels();
        console.log("AVAILABLE MODELS:");
        for (const m of result.models) {
            if (m.name.includes('flash') || m.name.includes('pro')) {
                console.log(`- ${m.name} Methods: ${m.supportedGenerationMethods.join(', ')}`);
            }
        }
    } catch (e) {
        console.error("List Models Failed:", e);
    }
}

listModels();
