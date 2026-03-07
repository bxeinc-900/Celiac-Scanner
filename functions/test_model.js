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
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel() {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            tools: [{ googleSearchRetrieval: {} }]
        });
        const result = await model.generateContent("Test prompt. Are you reaching the search tool?");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("TEST FAILED:", e.message);
    }
}

testModel();
