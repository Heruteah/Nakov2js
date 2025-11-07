const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { FontSystem } = require('cassidy-styler');

module.exports = {
  name: "alldl",
  execute: async ({ api, event, config }) => {
    try {
      if (event.type !== "message" || !event.body) return;
      
      const messageBody = event.body.trim();
      
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
      
      const ioa39rkdevbot = require("../../utils/console");
      ioa39rkdevbot.download(platform, event.senderID);
      
      const processingMsg = await api.sendMessage(
        `📥 ${FontSystem.applyFonts('Detected', 'fancy')} ${FontSystem.applyFonts(platform, 'bold')} ${FontSystem.applyFonts('link! Downloading video...', 'fancy')}`,
        event.threadID
      );
      
      let videoPath = null;
      
      try {
        const apiUrl = `https://api-library-kohi.onrender.com/api/alldl?url=${encodeURIComponent(detectedUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 60000 });
        
        if (!response.data || !response.data.status || !response.data.data || !response.data.data.videoUrl) {
          if (processingMsg && processingMsg.messageID) {
            api.editMessage(
              `❌ ${FontSystem.applyFonts('Failed to download', 'fancy')} ${FontSystem.applyFonts(platform, 'bold')} ${FontSystem.applyFonts('video. Please try again later.', 'fancy')}`,
              processingMsg.messageID,
              event.threadID
            );
          }
          return;
        }
        
        const videoUrl = response.data.data.videoUrl;
        const detectedPlatform = response.data.data.platform || platform;
        
        const videoResponse = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          timeout: 120000
        });
        
        const tempDir = path.join(__dirname, "../../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        videoPath = path.join(tempDir, `alldl_${Date.now()}.mp4`);
        fs.writeFileSync(videoPath, videoResponse.data);
        
        await api.sendMessage(
          {
            body: `✅ ${FontSystem.applyFonts('Downloaded', 'fancy')} ${FontSystem.applyFonts(detectedPlatform, 'bold')} ${FontSystem.applyFonts('video successfully!', 'fancy')} 🎉`,
            attachment: fs.createReadStream(videoPath)
          },
          event.threadID,
          event.messageID
        );
        
        if (processingMsg && processingMsg.messageID) {
          api.unsendMessage(processingMsg.messageID);
        }
        
        setTimeout(() => {
          if (videoPath && fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        }, 5000);
        
      } catch (error) {
        console.error("Auto-download error:", error.message);
        
        if (videoPath && fs.existsSync(videoPath)) {
          try {
            fs.unlinkSync(videoPath);
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError.message);
          }
        }
        
        if (processingMsg && processingMsg.messageID) {
          api.editMessage(
            `❌ ${FontSystem.applyFonts('Error downloading', 'fancy')} ${FontSystem.applyFonts(platform, 'bold')} ${FontSystem.applyFonts('video:', 'fancy')} ${error.message}`,
            processingMsg.messageID,
            event.threadID
          );
        } else {
          api.sendMessage(
            `❌ ${FontSystem.applyFonts('Error downloading', 'fancy')} ${FontSystem.applyFonts(platform, 'bold')} ${FontSystem.applyFonts('video:', 'fancy')} ${error.message}`,
            event.threadID,
            event.messageID
          );
        }
      }
      
    } catch (error) {
      console.error("Error in alldl event:", error);
    }
  }
};
