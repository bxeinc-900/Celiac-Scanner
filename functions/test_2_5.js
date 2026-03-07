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
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }]
        }, { apiVersion: 'v1beta' });

        const result = await model.generateContent("Test the search grounding for Celiac Safety.");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("TEST FAILED:", e.message);
    }
}

testModel();
