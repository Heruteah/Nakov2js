# 🤖 Facebook Messenger Bot

A beautiful, modular Facebook Messenger bot with elegant Unicode styling, real-time web dashboard, and intelligent automation features.

**Developer**: [ioa39rkdev](https://www.facebook.com/ioa39rkdev.00)

---

## ✨ Features

- 🎨 **Beautiful Unicode Styling** - All commands and events use cassidy-styler for elegant formatted responses
- 🌐 **Web Console Dashboard** - Real-time monitoring with Server-Sent Events (SSE)
- 📦 **Modular Architecture** - Easy-to-add command and event system
- 🎭 **Smart Event Handlers** - Welcome messages, join/leave notifications, auto-downloads
- 🔄 **Offline Mode** - Bot loads even without Facebook credentials for testing
- ⚡ **Animated Console** - Spinners, progress bars, and colorful terminal output
- 🎯 **Dual Prefix System** - Commands with or without prefixes
- ❄️ **Cooldown Protection** - Per-command spam prevention
- 🤖 **AI Integration** - GPT-5 conversational AI and image generation
- 📥 **Auto-Download** - Automatic video downloads from Facebook and TikTok

---

## 📋 Available Commands

All commands now feature beautiful Unicode formatting with cassidy-styler!

| Command | Prefix | Description | Permission |
|---------|--------|-------------|------------|
| `ai` | ❌ No | Chat with GPT-5 AI assistant | Everyone |
| `help` | ✅ Yes | Display all available commands | Everyone |
| `poli` | ✅ Yes | Generate AI images from text prompts | Everyone |
| `prefix` | ❌ No | Show current command prefix | Everyone |
| `uid` | ✅ Yes | Get your Facebook user ID | Everyone |
| `uptime` | ✅ Yes | Display detailed bot runtime statistics | Everyone |

**Total**: 6 commands with elegant styling

---

## 🎭 Event Handlers

All events feature professional Unicode formatting!

- **Welcome** - Greets new members joining the group
- **Join Notification** - Bot introduces itself when added to a thread
- **Leave Notification** - Announces when members leave
- **Auto-Download** - Automatically downloads videos from Facebook and TikTok links

**Total**: 4 events with consistent styling

---

## 🌐 Web Console Dashboard

Access the real-time monitoring dashboard at `http://localhost:5000`:

- 📊 **Live Statistics** - Total logs, success count, errors, warnings, uptime
- 🎨 **Color-Coded Logs** - Green (success), red (error), yellow (warning), blue (info)
- 🔍 **Log Filtering** - Filter by type: All, Errors, Warnings, Success
- ✨ **Modern UI** - Glassmorphism design with gradients and animations
- 📡 **Real-Time Updates** - Server-Sent Events (SSE) for instant log streaming
- 📈 **System Monitoring** - Platform, Node version, memory usage, uptime tracking

---

## 🎨 Styling System

Every command and event uses **cassidy-styler** for beautiful Unicode text formatting:

### Available Font Styles
- **Bold** (`𝗕𝗼𝗹𝗱`) - For titles and emphasis
- **Fancy** (`𝖥𝖺𝗇𝖼𝗒`) - For elegant content text
- **Typewriter** (`𝚃𝚢𝚙𝚎𝚠𝚛𝚒𝚝𝚎𝚛`) - For code and commands
- **Script** (`𝓢𝓬𝓻𝓲𝓹𝓽`) - For signatures and special text
- **Double Struck** (`𝟙𝟚𝟛`) - For numbers and stats

### Message Format
All responses follow a consistent structure:
```
╔═══════════════════════════════╗
║  𝗧𝗶𝘁𝗹𝗲                        ║
╚═══════════════════════════════╝

𝖢𝗈𝗇𝗍𝖾𝗇𝗍 𝗍𝖾𝗑𝗍 𝗁𝖾𝗋𝖾...
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- Facebook account
- Facebook session cookies (appstate.json)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd facebook-messenger-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   
   Edit `config.json`:
   ```json
   {
     "prefix": "-",
     "botName": "🌸 WAGUBOT",
     "admin": ["YOUR_FACEBOOK_USER_ID"]
   }
   ```

4. **Add Facebook credentials**
   
   Create `appstate.json` with your Facebook session cookies:
   ```json
   [
     {
       "key": "c_user",
       "value": "your-user-id"
     }
   ]
   ```

5. **Start the bot**
   ```bash
   node index.js
   ```

6. **Access the dashboard**
   
   Open `http://localhost:5000` in your browser

---

## 🛠️ Creating Custom Commands

### Command Template

Create a new file in `modules/commands/`:

```javascript
const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "commandname",
    description: "What this command does",
    usage: "commandname <args>",
    cooldown: 5,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const message = format({
      title: '🎯 Command Title',
      titleFont: 'bold',
      content: `${FontSystem.applyFonts('Your content here', 'fancy')}`,
      contentFont: 'none'
    });
    
    reply(message);
  }
};
```

### Command Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | Command identifier (lowercase, no spaces) |
| `description` | String | Brief description for help command |
| `usage` | String | Usage example with arguments |
| `cooldown` | Number | Seconds between command uses |
| `role` | Number | Permission (0=everyone, 1=admin, 2=super admin) |
| `prefix` | Boolean | Requires prefix or not |

### Function Parameters

```javascript
run: async (api, event, args, reply, react) => { }
```

- **api** - Facebook Chat API instance
- **event** - Message event object (senderID, threadID, body, etc.)
- **args** - Array of arguments from message
- **reply(message)** - Quick reply function
- **react(emoji)** - React to message with emoji

---

## 🎨 Creating Custom Events

### Event Template

Create a new file in `modules/events/`:

```javascript
const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  name: "eventname",
  execute: async ({ api, event, config }) => {
    const message = format({
      title: '🎉 Event Title',
      titleFont: 'bold',
      content: `${FontSystem.applyFonts('Event content', 'fancy')}`,
      contentFont: 'none'
    });
    
    await api.sendMessage(message, event.threadID);
  }
};
```

---

## 🔧 Configuration

### config.json

```json
{
  "prefix": "-",
  "invalidCommandMessage": "❌ Invalid command. Type -help to see available commands.",
  "botName": "🌸 WAGUBOT",
  "admin": ["100077070762554"]
}
```

### Environment Variables

- `MACHINE_READABLE=true` - Enable JSON log output for programmatic consumption

---

## 📥 Auto-Download Feature

The bot automatically detects and downloads videos from:

**Supported Platforms:**
- Facebook (facebook.com, fb.watch, m.facebook.com)
- TikTok (tiktok.com, vt.tiktok.com, vm.tiktok.com)

**How it works:**
1. User sends a message containing a video link
2. Bot detects the platform using regex
3. Downloads video via API
4. Sends video to the chat with styled message
5. Auto-deletes temporary file after 5 seconds

---

## 🎯 API Integrations

### External APIs Used

- **Copilot AI** - GPT-5 conversational AI with history
  - Endpoint: `api-library-kohi.onrender.com/api/copilot`
  - Model: GPT-5
  - Features: User-specific conversations

- **Pollinations AI** - Text-to-image generation
  - Endpoint: `api-library-kohi.onrender.com/api/pollinations`
  - Model: Flux
  - Features: High-quality AI image generation

- **All Downloader** - Universal media downloader
  - Endpoint: `api-library-kohi.onrender.com/api/alldl`
  - Platforms: Facebook, TikTok
  - Features: Video URL extraction and download

---

## 🧑‍💻 Developer

**Name**: ioa39rkdev  
**Facebook**: [@ioa39rkdev](https://facebook.com/ioa39rkdev)  
**Expertise**: Facebook Messenger Bots, Node.js, Modular Architecture

---

## 📦 Dependencies

- **ws3-fca** (v3.5.2) - Facebook Chat API wrapper
- **cassidy-styler** (v1.2.6) - Unicode text styling library
- **axios** (v1.13.1) - HTTP client for API calls
- **@types/node** (v22.13.11) - TypeScript definitions for Node.js

---

## 🌟 Features in Detail

### Console System (ioa39rkdevbot)
Custom console class exported from `utils/console.js`:
- Styled banners and section headers
- Animated spinners for loading states
- Color-coded log levels (success, error, warning, info)
- System information display
- Machine-readable JSON output mode
- Web console broadcasting for real-time monitoring

### Cooldown System
- Per-user per-command cooldown tracking
- Prevents spam and rate limiting
- Configurable cooldown times per command
- User-friendly cooldown messages with time remaining

### Error Handling
- Try-catch blocks in all commands and events
- Graceful error messages with styling
- Detailed console error logging
- Fallback to offline mode when credentials unavailable

---

## 📝 Notes

- Commands are loaded dynamically at startup
- Restart bot to apply new commands
- All text responses use Unicode styling for consistency
- Session cookies stored securely in appstate.json
- Web console uses Server-Sent Events for real-time updates
- Temporary media files auto-deleted after sending

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your command/event following the template
4. Ensure proper Unicode styling using cassidy-styler
5. Test thoroughly
6. Submit a pull request

---

## 📄 License

MIT License - Free to use and modify

---

## 🙏 Credits

- **Developer**: ioa39rkdev
- **Styling Library**: cassidy-styler
- **Facebook API**: ws3-fca (NethWs3Dev)
- **External APIs**: api-library-kohi.onrender.com

---

**Made with ❤️ by ioa39rkdev**
