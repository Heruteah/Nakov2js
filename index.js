const fs = require("fs");
const path = require("path");
const { login } = require("ws3-fca");

let credentials;
try {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
} catch (err) {
  console.error("❌ appstate.json is missing or malformed.", err);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync("config.json", "utf8"));
} catch (err) {
  console.error("❌ config.json is missing or malformed.", err);
  process.exit(1);
}

console.log("Logging in...");

login(credentials, {
  online: true,
  updatePresence: true,
  selfListen: false,
  randomUserAgent: false
}, async (err, api) => {
  if (err) return console.error("LOGIN ERROR:", err);

  console.log(`✅ Logged in as: ${api.getCurrentUserID()}`);

  global.botStartTime = Date.now();

  const commandsDir = path.join(__dirname, "modules", "commands");
  const commands = new Map();

  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

  for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(commandsDir, file));
    if (command.name && typeof command.execute === "function") {
      commands.set(command.name, command);
      console.log(`🔧 Loaded command: ${command.name}`);
    }
  }

  const eventsDir = path.join(__dirname, "modules", "events");
  const events = new Map();

  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

  for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith(".js"))) {
    const eventHandler = require(path.join(eventsDir, file));
    if (eventHandler.name && typeof eventHandler.execute === "function") {
      events.set(eventHandler.name, eventHandler);
      console.log(`📅 Loaded event: ${eventHandler.name}`);
    }
  }

  const PREFIX = config.prefix || "!";
  const cooldownTime = (config.cooldownTime || 3) * 1000;
  const userCooldowns = new Map();

  api.listenMqtt(async (err, event) => {
    if (err) return;

    if (event.type === "message") {
      if (!event.body) return;
      if (event.senderID === api.getCurrentUserID()) return;

      const messageBody = event.body.trim();
      const hasPrefix = messageBody.startsWith(PREFIX);
      const withoutPrefix = hasPrefix ? messageBody.slice(PREFIX.length).trim() : messageBody;
      const commandName = withoutPrefix.split(" ")[0].toLowerCase();
      const args = withoutPrefix.slice(commandName.length).trim().split(" ").filter(Boolean);

      let command = commands.get(commandName);

      if (command) {
        if (command.usePrefix && !hasPrefix) {
          return api.sendMessage("This command uses a prefix", event.threadID, event.messageID);
        }
        
        if (!command.usePrefix && hasPrefix) {
          return api.sendMessage("This command doesn't use prefix", event.threadID, event.messageID);
        }

        const now = Date.now();
        const cooldownKey = `${event.senderID}_${commandName}`;
        
        if (userCooldowns.has(cooldownKey)) {
          const expirationTime = userCooldowns.get(cooldownKey) + cooldownTime;
          
          if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            return api.sendMessage(`⏳ Please wait ${timeLeft} seconds before using this command again.`, event.threadID, event.messageID);
          }
        }

        userCooldowns.set(cooldownKey, now);

        try {
          await command.execute({ api, event, args });
        } catch (error) {
          console.error(`Error in ${commandName} command:`, error);
          api.sendMessage("❌ Error processing your command.", event.threadID, event.messageID);
        }
      } else {
        if (hasPrefix) {
          return api.sendMessage(config.invalidCommandMessage || "❌ Invalid command.", event.threadID, event.messageID);
        }
      }
    } else if (event.type === "event") {
      if (event.logMessageType === "log:subscribe") {
        const welcomeEvent = events.get("welcome");
        const jointnotiEvent = events.get("jointnoti");
        
        if (welcomeEvent) {
          try {
            await welcomeEvent.execute({ api, event, config });
          } catch (error) {
            console.error("Error in welcome event:", error);
          }
        }
        
        if (jointnotiEvent) {
          try {
            await jointnotiEvent.execute({ api, event, config });
          } catch (error) {
            console.error("Error in jointnoti event:", error);
          }
        }
      } else if (event.logMessageType === "log:unsubscribe") {
        const leavenotiEvent = events.get("leavenoti");
        
        if (leavenotiEvent) {
          try {
            await leavenotiEvent.execute({ api, event, config });
          } catch (error) {
            console.error("Error in leavenoti event:", error);
          }
        }
      }
    }
  });
});
