const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testTool() {
    const apiKey = "AIzaSyBdImEO91x5Ltloq32LPRQZAsB-guEQ_zw";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-image-preview",
        tools: [{ googleSearch: {} }]
    }, { apiVersion: "v1beta" });

    try {
        const result = await model.generateContent("Who won the Super Bowl in 2025?");
        console.log("Success with googleSearch tool on 3.1");
        // console.log(result.response.text());
    } catch (e) {
        console.error("Failed with googleSearch tool on 3.1:", e.message);
    }
}

testTool().catch(console.error);
