const fs = require("fs");
const path = require("path");
const { login } = require("ws3-fca");
const BotpackConsole = require("./utils/console");

console.clear();
BotpackConsole.banner();

global.botStartTime = Date.now();

let credentials = null;
let hasAppState = false;

try {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
  hasAppState = true;
} catch (err) {
  BotpackConsole.warning(
    "appstate.json not found - Running in offline mode",
    "Create appstate.json with valid Facebook credentials to enable bot functionality"
  );
  hasAppState = false;
}

let config;
try {
  config = JSON.parse(fs.readFileSync("config.json", "utf8"));
} catch (err) {
  BotpackConsole.error(
    "config.json is missing or malformed",
    err.message,
    "Create config.json with required settings (prefix, etc.)"
  );
  process.exit(1);
}

async function loadModules() {
  const spinner = BotpackConsole.spinner("Initializing modules...");
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  spinner.stop();
  
  BotpackConsole.section("Loading Commands");
  const commandsDir = path.join(__dirname, "modules", "commands");
  const commands = new Map();
  global.commands = commands;

  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

  const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));
  
  const loadSpinner = BotpackConsole.spinner(`Loading ${commandFiles.length} command files...`);
  
  for (let i = 0; i < commandFiles.length; i++) {
    const file = commandFiles[i];
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const command = require(path.join(commandsDir, file));
      if (command.config && command.config.name && typeof command.run === "function") {
        commands.set(command.config.name, command);
      }
    } catch (err) {
      loadSpinner.stop();
      BotpackConsole.error(
        `Failed to load command: ${file}`,
        err.message,
        "Check command file syntax and exports"
      );
      loadSpinner.stop = () => {};
    }
  }
  
  loadSpinner.stop();
  
  commands.forEach((cmd) => {
    BotpackConsole.command(cmd.config.name);
  });

  BotpackConsole.success(`Loaded ${commands.size} commands`);
  BotpackConsole.separator();
  
  BotpackConsole.section("Loading Events");
  const eventsDir = path.join(__dirname, "modules", "events");
  const events = new Map();

  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

  const eventFiles = fs.readdirSync(eventsDir).filter(f => f.endsWith(".js"));
  
  const eventSpinner = BotpackConsole.spinner(`Loading ${eventFiles.length} event files...`);
  
  for (let i = 0; i < eventFiles.length; i++) {
    const file = eventFiles[i];
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const eventHandler = require(path.join(eventsDir, file));
      if (eventHandler.name && typeof eventHandler.execute === "function") {
        events.set(eventHandler.name, eventHandler);
      }
    } catch (err) {
      eventSpinner.stop();
      BotpackConsole.error(
        `Failed to load event: ${file}`,
        err.message,
        "Check event file syntax and exports"
      );
      eventSpinner.stop = () => {};
    }
  }
  
  eventSpinner.stop();
  
  events.forEach((evt) => {
    BotpackConsole.event(evt.name);
  });
  
  BotpackConsole.success(`Loaded ${events.size} events`);
  
  return { commands, events };
}

if (!hasAppState) {
  BotpackConsole.separator();
  
  loadModules().then(() => {
    BotpackConsole.separator();
    BotpackConsole.systemInfo();
    BotpackConsole.warning(
      "Bot is in offline mode - No Facebook connection",
      "Add appstate.json to enable Facebook Messenger functionality"
    );
    BotpackConsole.separator();
  });
} else {
  BotpackConsole.info("Logging in...");
  BotpackConsole.separator();

  login(credentials, {
    online: true,
    updatePresence: true,
    selfListen: false,
    randomUserAgent: false
  }, async (err, api) => {
    if (err) {
      BotpackConsole.error(
        "Login failed",
        err.message,
        "Check appstate.json validity or regenerate Facebook credentials"
      );
      
      await loadModules();
      
      BotpackConsole.separator();
      BotpackConsole.systemInfo();
      BotpackConsole.warning(
        "Bot loaded but not connected to Facebook",
        "Fix appstate.json and restart to enable messaging"
      );
      BotpackConsole.separator();
      return;
    }

    BotpackConsole.login(api.getCurrentUserID());
    BotpackConsole.separator();

    const { commands, events } = await loadModules();

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
            BotpackConsole.error(
              `Command execution failed: ${commandName}`,
              error.message,
              `Check the ${commandName} command implementation`
            );
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
              BotpackConsole.error(
                "Welcome event failed",
                error.message,
                "Check welcome.js implementation"
              );
            }
          }
          
          if (jointnotiEvent) {
            try {
              await jointnotiEvent.execute({ api, event, config });
            } catch (error) {
              BotpackConsole.error(
                "Join notification event failed",
                error.message,
                "Check jointnoti.js implementation"
              );
            }
          }
        } else if (event.logMessageType === "log:unsubscribe") {
          const leavenotiEvent = events.get("leavenoti");
          
          if (leavenotiEvent) {
            try {
              await leavenotiEvent.execute({ api, event, config });
            } catch (error) {
              BotpackConsole.error(
                "Leave notification event failed",
                error.message,
                "Check leavenoti.js implementation"
              );
            }
          }
        }
      }

      const alldlEvent = events.get("alldl");
      if (alldlEvent && event.type === "message") {
        try {
          await alldlEvent.execute({ api, event, config });
        } catch (error) {
          BotpackConsole.error(
            "Auto-download event failed",
            error.message,
            "Check alldl.js implementation"
          );
        }
      }
    });
  });
}
