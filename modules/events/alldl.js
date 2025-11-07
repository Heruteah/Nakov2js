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
      const ioa39rkdevbot = require("../../utils/console");
      ioa39rkdevbot.download(platform, event.senderID);
      
      // Send processing message (without reply to get message object back)
      const processingMsg = await api.sendMessage(
        `📥 Detected ${platform} link! Downloading video...`,
        event.threadID
      );
      
      let videoPath = null;
      
      try {
        // Call the API
        const apiUrl = `https://api-library-kohi.onrender.com/api/alldl?url=${encodeURIComponent(detectedUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 60000 });
        
        if (!response.data || !response.data.status || !response.data.data || !response.data.data.videoUrl) {
          if (processingMsg && processingMsg.messageID) {
            api.editMessage(
              `❌ Failed to download ${platform} video. Please try again later.`,
              processingMsg.messageID,
              event.threadID
            );
          }
          return;
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
        
        videoPath = path.join(tempDir, `alldl_${Date.now()}.mp4`);
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
        if (processingMsg && processingMsg.messageID) {
          api.unsendMessage(processingMsg.messageID);
        }
        
        // Clean up video file after 5 seconds
        setTimeout(() => {
          if (videoPath && fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        }, 5000);
        
      } catch (error) {
        console.error("Auto-download error:", error.message);
        
        // Clean up temp file on error
        if (videoPath && fs.existsSync(videoPath)) {
          try {
            fs.unlinkSync(videoPath);
          } catch (cleanupError) {
            console.error("Error cleaning up temp file:", cleanupError.message);
          }
        }
        
        // Update or send error message
        if (processingMsg && processingMsg.messageID) {
          api.editMessage(
            `❌ Error downloading ${platform} video: ${error.message}`,
            processingMsg.messageID,
            event.threadID
          );
        } else {
          api.sendMessage(
            `❌ Error downloading ${platform} video: ${error.message}`,
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
