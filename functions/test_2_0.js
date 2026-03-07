const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
    const apiKey = "AIzaSyBdImEO91x5Ltloq32LPRQZAsB-guEQ_zw";
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        "gemini-2.5-flash",
        "gemini-3.1-flash-image-preview"
    ];

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: "v1beta" });
            const result = await model.generateContent("Hello");
            console.log(`Success with ${modelName}`);
            console.log(result.response.text());
        } catch (e) {
            console.error(`Failed with ${modelName}:`, e.message);
        }
    }
}

testModel().catch(console.error);
