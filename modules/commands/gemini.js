const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

module.exports = {
  name: "gemini",
  description: "Analyze and describe images using Gemini AI. Reply to a photo with 'gemini [your text]' to describe it.",
  usePrefix: false,
  async execute({ api, event, args }) {
    let imagePath = null;
    
    try {
      // Check if this is a reply to a message with an attachment
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage(
          "📸 To use Gemini image recognition:\n\n1. Reply to a photo/image\n2. Type: gemini [your question/description request]\n\nExample: Reply to a photo and type 'gemini describe this photo'",
          event.threadID,
          event.messageID
        );
      }

      // Get the first attachment
      const attachment = event.messageReply.attachments[0];
      
      // Check if it's an image
      if (attachment.type !== "photo") {
        return api.sendMessage(
          "⚠️ Please reply to a photo/image, not other types of attachments.",
          event.threadID,
          event.messageID
        );
      }

      const imageUrl = attachment.url;
      
      // Validate URL
      if (!imageUrl) {
        return api.sendMessage(
          "⚠️ Unable to retrieve image URL. Please try again.",
          event.threadID,
          event.messageID
        );
      }
      
      const userPrompt = args.join(" ").trim() || "Describe this image in detail";

      const waitingMsg = await api.sendMessage("🔍 Analyzing image with Gemini AI...", event.threadID);

      // Download the image
      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      imagePath = path.join(tempDir, `gemini_${Date.now()}.jpg`);
      
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, response.data);

      // Read image and convert to base64
      const imageBytes = fs.readFileSync(imagePath);
      const base64Image = imageBytes.toString("base64");

      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Prepare content for Gemini with proper structure
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      };

      const textPart = {
        text: userPrompt,
      };

      // Call Gemini API for image analysis
      const result = await model.generateContent([imagePart, textPart]);
      const geminiResponse = await result.response;
      const analysisText = geminiResponse.text() || "Unable to analyze the image.";

      await api.editMessage(
        `🤖 Gemini Analysis:\n\n${analysisText}`,
        waitingMsg.messageID,
        event.threadID
      );

    } catch (err) {
      console.error("Gemini Command Error:", err);
      api.sendMessage(
        "❌ Error analyzing image with Gemini AI. Please try again later.",
        event.threadID,
        event.messageID
      );
    } finally {
      // Clean up temporary file in all cases
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
