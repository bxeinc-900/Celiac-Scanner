const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
    const apiKey = "AIzaSyBdImEO91x5Ltloq32LPRQZAsB-guEQ_zw";
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash");
        console.log(result.response.text());
    } catch (e) {
        console.error("Failed with gemini-1.5-flash:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash (v1beta)");
        console.log(result.response.text());
    } catch (e) {
        console.error("Failed with gemini-1.5-flash (v1beta):", e.message);
    }
}

testModel().catch(console.error);
