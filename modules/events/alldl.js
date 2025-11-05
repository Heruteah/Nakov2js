const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "alldl",
  execute: async ({ api, event, config }) => {
    try {
      if (event.type !== "message" || !event.body) return;
      
      const messageBody = event.body.trim();
      
      // Detect Facebook or TikTok links
      const facebookRegex = /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch|fb\.com|m\.facebook\.com)\/[^\s]+/gi;
      const tiktokRegex = /(https?:\/\/)?(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/[^\s]+/gi;
      
      const facebookMatch = messageBody.match(facebookRegex);
      const tiktokMatch = messageBody.match(tiktokRegex);
      
      let detectedUrl = null;
      let platform = null;
      
      if (facebookMatch && facebookMatch.length > 0) {
        detectedUrl = facebookMatch[0];
        platform = "Facebook";
      } else if (tiktokMatch && tiktokMatch.length > 0) {
        detectedUrl = tiktokMatch[0];
        platform = "TikTok";
      }
      
      if (!detectedUrl) return;
      
      // Log download attempt
      const BotpackConsole = require("../../utils/console");
      BotpackConsole.download(platform, event.senderID);
      
      // Send processing message
      const processingMsg = await api.sendMessage(
        `📥 Detected ${platform} link! Downloading video...`,
        event.threadID,
        event.messageID
      );
      
      try {
        // Call the API
        const apiUrl = `https://api-library-kohi.onrender.com/api/alldl?url=${encodeURIComponent(detectedUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 60000 });
        
        if (!response.data || !response.data.status || !response.data.data || !response.data.data.videoUrl) {
          return api.editMessage(
            `❌ Failed to download ${platform} video. Please try again later.`,
            processingMsg.messageID,
            event.threadID
          );
        }
        
        const videoUrl = response.data.data.videoUrl;
        const detectedPlatform = response.data.data.platform || platform;
        
        // Download the video
        const videoResponse = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          timeout: 120000
        });
        
        // Save to temp directory
        const tempDir = path.join(__dirname, "../../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const videoPath = path.join(tempDir, `alldl_${Date.now()}.mp4`);
        fs.writeFileSync(videoPath, videoResponse.data);
        
        // Send the video
        await api.sendMessage(
          {
            body: `✅ Downloaded ${detectedPlatform} video successfully!`,
            attachment: fs.createReadStream(videoPath)
          },
          event.threadID,
          event.messageID
        );
        
        // Delete processing message
        api.unsendMessage(processingMsg.messageID);
        
        // Clean up video file after 5 seconds
        setTimeout(() => {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        }, 5000);
        
      } catch (error) {
        console.error("Auto-download error:", error.message);
        api.editMessage(
          `❌ Error downloading ${platform} video: ${error.message}`,
          processingMsg.messageID,
          event.threadID
        );
      }
      
    } catch (error) {
      console.error("Error in alldl event:", error);
    }
  }
};
