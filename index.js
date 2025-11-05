const fs = require("fs");
const path = require("path");
const { login } = require("ws3-fca");
const BotpackConsole = require("./utils/console");

console.clear();
BotpackConsole.banner();

let credentials;
try {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
} catch (err) {
  BotpackConsole.error("appstate.json is missing or malformed.");
  console.error(err);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync("config.json", "utf8"));
} catch (err) {
  BotpackConsole.error("config.json is missing or malformed.");
  console.error(err);
  process.exit(1);
}

BotpackConsole.info("Logging in...");
BotpackConsole.separator();

login(credentials, {
  online: true,
  updatePresence: true,
  selfListen: false,
  randomUserAgent: false
}, async (err, api) => {
  if (err) {
    BotpackConsole.error("LOGIN FAILED!");
    console.error(err);
    return;
  }

  BotpackConsole.login(api.getCurrentUserID());
  BotpackConsole.separator();

  global.botStartTime = Date.now();

  BotpackConsole.info("Loading commands...");
  const commandsDir = path.join(__dirname, "modules", "commands");
  const commands = new Map();
  global.commands = commands;

  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

  for (const file of fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(commandsDir, file));
    if (command.config && command.config.name && typeof command.run === "function") {
      commands.set(command.config.name, command);
      BotpackConsole.command(command.config.name);
    }
  }

  BotpackConsole.separator();
  BotpackConsole.info("Loading events...");
  const eventsDir = path.join(__dirname, "modules", "events");
  const events = new Map();

  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

  for (const file of fs.readdirSync(eventsDir).filter(f => f.endsWith(".js"))) {
    const eventHandler = require(path.join(eventsDir, file));
    if (eventHandler.name && typeof eventHandler.execute === "function") {
      events.set(eventHandler.name, eventHandler);
      BotpackConsole.event(eventHandler.name);
    }
  }

  BotpackConsole.separator();
  BotpackConsole.systemInfo();
  BotpackConsole.success("Bot is ready and listening for messages!");
  BotpackConsole.separator();

  const PREFIX = config.prefix;
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
        if (command.config.prefix && !hasPrefix) {
          return api.sendMessage("This command uses a prefix", event.threadID, event.messageID);
        }
        
        if (!command.config.prefix && hasPrefix) {
          return api.sendMessage("This command doesn't use prefix", event.threadID, event.messageID);
        }

        const now = Date.now();
        const cooldownKey = `${event.senderID}_${commandName}`;
        const cooldownTime = (command.config.cooldown || 3) * 1000;
        
        if (userCooldowns.has(cooldownKey)) {
          const expirationTime = userCooldowns.get(cooldownKey) + cooldownTime;
          
          if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            return api.sendMessage(`⏳ Please wait ${timeLeft} seconds before using this command again.`, event.threadID, event.messageID);
          }
        }

        userCooldowns.set(cooldownKey, now);

        BotpackConsole.executing(commandName, event.senderID);

        const reply = (message) => {
          return api.sendMessage(message, event.threadID, event.messageID);
        };

        const react = (emoji) => {
          return api.setMessageReaction(emoji, event.messageID, (err) => {
            if (err) console.error("React error:", err);
          }, true);
        };

        try {
          await command.run(api, event, args, reply, react);
        } catch (error) {
          BotpackConsole.error(`Error in ${commandName} command: ${error.message}`);
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
            BotpackConsole.error(`Error in welcome event: ${error.message}`);
          }
        }
        
        if (jointnotiEvent) {
          try {
            await jointnotiEvent.execute({ api, event, config });
          } catch (error) {
            BotpackConsole.error(`Error in jointnoti event: ${error.message}`);
          }
        }
      } else if (event.logMessageType === "log:unsubscribe") {
        const leavenotiEvent = events.get("leavenoti");
        
        if (leavenotiEvent) {
          try {
            await leavenotiEvent.execute({ api, event, config });
          } catch (error) {
            BotpackConsole.error(`Error in leavenoti event: ${error.message}`);
          }
        }
      }
    }

    // Execute alldl event for all messages
    const alldlEvent = events.get("alldl");
    if (alldlEvent && event.type === "message") {
      try {
        await alldlEvent.execute({ api, event, config });
      } catch (error) {
        BotpackConsole.error(`Error in alldl event: ${error.message}`);
      }
    }
  });
});
