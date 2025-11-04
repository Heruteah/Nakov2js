const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "poli",
  description: "Generate an image using Pollinations AI.",
  usePrefix: true,
  async execute({ api, event, args }) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return api.sendMessage("🎨 Please provide a prompt for image generation.\n\nExample: !poli beautiful sunset over mountains", event.threadID, event.messageID);
    }

    try {
      const waitingMsg = await api.sendMessage("🎨 Generating your image...", event.threadID);
      const url = `https://api-library-kohi.onrender.com/api/pollinations?prompt=${encodeURIComponent(prompt)}&model=flux`;
      const res = await axios.get(url);

      if (!res.data || !res.data.status || !res.data.data) {
        return api.editMessage("⚠️ Failed to generate image. Please try again.", waitingMsg.messageID, event.threadID);
      }

      const base64Data = res.data.data.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const imagePath = path.join(tempDir, `poli_${Date.now()}.jpg`);
      fs.writeFileSync(imagePath, imageBuffer);

      await api.sendMessage(
        {
          body: `🎨 Generated image for: "${prompt}"`,
          attachment: fs.createReadStream(imagePath)
        },
        event.threadID
      );

      api.unsendMessage(waitingMsg.messageID);
      
      setTimeout(() => {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }, 5000);
    } catch (err) {
      console.error("Poli Command Error:", err);
      api.sendMessage("❌ Error generating image. Please try again later.", event.threadID, event.messageID);
    }
  }
};
