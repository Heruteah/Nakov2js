# Facebook Messenger Bot - Command Structure Documentation

## Overview

This Facebook Messenger bot uses a modular command system with a standardized structure. Commands are dynamically loaded from the `modules/commands/` directory.

## Command Structure

Every command file must follow this structure:

```javascript
module.exports = {
  config: {
    name: "commandname",        // Command name (lowercase, no spaces)
    description: "Description",  // Brief description of what the command does
    usage: "commandname <args>", // How to use the command
    cooldown: 5,                 // Cooldown in seconds (default: 3)
    role: 0,                     // Permission level (0 = everyone, 1 = admin)
    prefix: true                 // true = requires prefix, false = no prefix
  },
  run: async (api, event, args, reply, react) => {
    // Your command logic here
  }
};
```

### Config Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | ✅ | Command identifier (used to call the command) |
| `description` | String | ✅ | Brief description shown in help command |
| `usage` | String | ✅ | Usage example with arguments |
| `cooldown` | Number | ✅ | Cooldown time in seconds between uses |
| `role` | Number | ✅ | Permission level (0=everyone, 1=admin) |
| `prefix` | Boolean | ✅ | Whether command requires prefix or not |

### Run Function Parameters

The `run` function receives 5 parameters:

```javascript
run: async (api, event, args, reply, react) => { }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `api` | Object | Facebook Chat API instance |
| `event` | Object | Message event object containing sender info, thread ID, etc. |
| `args` | Array | Array of arguments from user message (split by spaces) |
| `reply` | Function | Helper function to quickly reply to the message |
| `react` | Function | Helper function to react to the message with emoji |

## Helper Functions

### reply(message)

Quick way to send a reply to the user:

```javascript
reply("Hello, world!");
// Equivalent to:
api.sendMessage("Hello, world!", event.threadID, event.messageID);
```

### react(emoji)

React to the message with an emoji:

```javascript
react("👍");
react("❤️");
```

## Example Commands

### Basic Command (With Prefix)

```javascript
module.exports = {
  config: {
    name: "hello",
    description: "Say hello to the bot",
    usage: "hello",
    cooldown: 3,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    reply("Hello! 👋");
  }
};
```

Usage: `!hello`

### Command Without Prefix

```javascript
module.exports = {
  config: {
    name: "ai",
    description: "Chat with AI",
    usage: "ai <question>",
    cooldown: 5,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    const question = args.join(" ");
    if (!question) return reply("Please provide a question");
    
    // AI logic here
    reply("AI response...");
  }
};
```

Usage: `ai what is the weather?` (no prefix needed)

### Command With Arguments

```javascript
module.exports = {
  config: {
    name: "echo",
    description: "Echo your message",
    usage: "echo <message>",
    cooldown: 3,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const message = args.join(" ");
    
    if (!message) {
      return reply("Please provide a message to echo");
    }
    
    reply(message);
  }
};
```

Usage: `!echo Hello everyone!`

### Command With External API

```javascript
const axios = require("axios");

module.exports = {
  config: {
    name: "weather",
    description: "Get weather information",
    usage: "weather <city>",
    cooldown: 10,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const city = args.join(" ");
    
    if (!city) {
      return reply("Please provide a city name");
    }
    
    try {
      react("⏳");
      
      const response = await axios.get(`https://api.example.com/weather?city=${city}`);
      const weatherData = response.data;
      
      reply(`Weather in ${city}: ${weatherData.temp}°C`);
      react("✅");
    } catch (error) {
      console.error("Weather API Error:", error);
      reply("❌ Failed to get weather data");
    }
  }
};
```

Usage: `!weather New York`

## Accessing Event Properties

Common event properties you can use:

```javascript
event.senderID       // User's Facebook ID
event.threadID       // Conversation/group thread ID
event.messageID      // Message ID
event.body           // Full message text
event.isGroup        // true if message is in a group
event.messageReply   // Replied message object (if replying to a message)
```

## Using API Methods

Common Facebook Chat API methods:

```javascript
// Send message
api.sendMessage("Hello", event.threadID);

// Send message with attachment
api.sendMessage({
  body: "Here's an image",
  attachment: fs.createReadStream("image.jpg")
}, event.threadID);

// Edit message
api.editMessage("New text", messageID, event.threadID);

// Unsend message
api.unsendMessage(messageID);

// Set nickname
api.changeNickname("New Nickname", event.threadID, event.senderID);

// Get user info
api.getUserInfo(event.senderID, (err, data) => {
  console.log(data);
});
```

## File Structure

```
project/
├── index.js                    # Main bot file
├── config.json                 # Bot configuration
├── appstate.json              # Facebook session cookies
├── package.json               # Dependencies
├── README.md                  # This file
└── modules/
    ├── commands/              # Command files
    │   ├── ai.js
    │   ├── help.js
    │   ├── poli.js
    │   ├── prefix.js
    │   ├── uid.js
    │   └── uptime.js
    └── events/                # Event handlers
        ├── welcome.js
        ├── leavenoti.js
        └── jointnoti.js
```

## Adding New Commands

1. Create a new `.js` file in `modules/commands/`
2. Follow the command structure template
3. Restart the bot
4. The command will be automatically loaded

## Configuration (config.json)

```json
{
  "prefix": "!",
  "invalidCommandMessage": "❌ Invalid command. Type !help to see available commands.",
  "botName": "Facebook Bot",
  "botNickname": "🤖 Bot",
  "cooldownTime": 3,
  "admin": []
}
```

## Features

- ✅ Automatic command loading
- ✅ Per-command cooldown system
- ✅ Prefix and non-prefix commands
- ✅ Role-based permissions (future feature)
- ✅ Helper functions for quick replies
- ✅ Individual cooldown per command
- ✅ Error handling

## Notes

- Command names must be lowercase and unique
- Files must end with `.js` extension
- Commands are loaded on bot startup (restart required for changes)
- Cooldowns are tracked per user per command
- Use `console.error()` for debugging errors
