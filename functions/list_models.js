const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = "AIzaSyBdImEO91x5Ltloq32LPRQZAsB-guEQ_zw";
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = await genAI.listModels();
    console.log(JSON.stringify(models, null, 2));
}

listModels().catch(console.error);
