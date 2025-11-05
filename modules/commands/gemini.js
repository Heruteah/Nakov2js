const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyAed9G43rVmaTr4CcJznxVbBc6pCX2C-nY" });

module.exports = {
  name: "gemini",
  description: "Chat with Gemini AI or analyze images. Use 'gemini [question]' or reply to a photo with 'gemini [description request]'",
  usePrefix: false,
  async execute({ api, event, args }) {
    let imagePath = null;
    
    try {
      const userPrompt = args.join(" ").trim();

      if (!userPrompt) {
        return api.sendMessage(
          "🤖 Gemini AI Usage:\n\n1. Text: gemini [your question]\n   Example: gemini hello\n\n2. Image: Reply to a photo with gemini [description]\n   Example: Reply to photo and type 'gemini describe this'",
          event.threadID,
          event.messageID
        );
      }

      const hasPhotoReply = event.messageReply && 
                           event.messageReply.attachments && 
                           event.messageReply.attachments.length > 0 && 
                           event.messageReply.attachments[0].type === "photo";

      const waitingMsg = await api.sendMessage(
        hasPhotoReply ? "🔍 Analyzing image with Gemini AI..." : "🤖 Thinking...",
        event.threadID
      );

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let result;

      if (hasPhotoReply) {
        const imageUrl = event.messageReply.attachments[0].url;

        if (!imageUrl) {
          return api.editMessage("⚠️ Unable to retrieve image URL. Please try again.", waitingMsg.messageID, event.threadID);
        }

        const tempDir = path.join(__dirname, "../../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        imagePath = path.join(tempDir, `gemini_${Date.now()}.jpg`);
        
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, response.data);

        const imageBytes = fs.readFileSync(imagePath);
        const base64Image = imageBytes.toString("base64");

        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        };

        const textPart = {
          text: userPrompt,
        };

        result = await model.generateContent([imagePart, textPart]);
      } else {
        result = await model.generateContent(userPrompt);
      }

      const geminiResponse = await result.response;
      const responseText = geminiResponse.text() || "Unable to generate a response.";

      await api.editMessage(
        `${responseText}`,
        waitingMsg.messageID,
        event.threadID
      );

    } catch (err) {
      console.error("Gemini Command Error:", err);
      api.sendMessage(
        "❌ Error communicating with Gemini AI. Please try again later.",
        event.threadID,
        event.messageID
      );
    } finally {
      if (imagePath && fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (cleanupErr) {
          console.error("Error cleaning up temp file:", cleanupErr);
        }
      }
    }
  }
};
