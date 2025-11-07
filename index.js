const fs = require("fs");
const path = require("path");
const { login } = require("ws3-fca");
const ioa39rkdevbot = require("./utils/console");

require("./web-console/server");

console.clear();
ioa39rkdevbot.banner();

global.botStartTime = Date.now();

let credentials = null;
let hasAppState = false;

try {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
  hasAppState = true;
} catch (err) {
  ioa39rkdevbot.warning(
    "appstate.json not found - Running in offline mode",
    "Create appstate.json with valid Facebook credentials to enable bot functionality"
  );
  hasAppState = false;
}

let config;
try {
  config = JSON.parse(fs.readFileSync("config.json", "utf8"));
} catch (err) {
  ioa39rkdevbot.error(
    "config.json is missing or malformed",
    err.message,
    "Create config.json with required settings (prefix, etc.)"
  );
  process.exit(1);
}

async function loadModules() {
  const spinner = ioa39rkdevbot.spinner("Initializing modules...");
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  spinner.stop();
  
  ioa39rkdevbot.section("Loading Commands");
  const commandsDir = path.join(__dirname, "modules", "commands");
  const commands = new Map();
  global.commands = commands;

  if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

  const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));
  
  const loadSpinner = ioa39rkdevbot.spinner(`Loading ${commandFiles.length} command files...`);
  
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
      ioa39rkdevbot.error(
        `Failed to load command: ${file}`,
        err.message,
        "Check command file syntax and exports"
      );
      loadSpinner.stop = () => {};
    }
  }
  
  loadSpinner.stop();
  
  commands.forEach((cmd) => {
    ioa39rkdevbot.command(cmd.config.name);
  });

  ioa39rkdevbot.success(`Loaded ${commands.size} commands`);
  ioa39rkdevbot.separator();
  
  ioa39rkdevbot.section("Loading Events");
  const eventsDir = path.join(__dirname, "modules", "events");
  const events = new Map();

  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

  const eventFiles = fs.readdirSync(eventsDir).filter(f => f.endsWith(".js"));
  
  const eventSpinner = ioa39rkdevbot.spinner(`Loading ${eventFiles.length} event files...`);
  
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
      ioa39rkdevbot.error(
        `Failed to load event: ${file}`,
        err.message,
        "Check event file syntax and exports"
      );
      eventSpinner.stop = () => {};
    }
  }
  
  eventSpinner.stop();
  
  events.forEach((evt) => {
    ioa39rkdevbot.event(evt.name);
  });
  
  ioa39rkdevbot.success(`Loaded ${events.size} events`);
  
  return { commands, events };
}

if (!hasAppState) {
  ioa39rkdevbot.separator();
  
  loadModules().then(() => {
    ioa39rkdevbot.separator();
    ioa39rkdevbot.systemInfo();
    ioa39rkdevbot.warning(
      "Bot is in offline mode - No Facebook connection",
      "Add appstate.json to enable Facebook Messenger functionality"
    );
    ioa39rkdevbot.separator();
  });
} else {
  ioa39rkdevbot.info("Logging in...");
  ioa39rkdevbot.separator();

  login(credentials, {
    online: true,
    updatePresence: true,
    selfListen: false,
    randomUserAgent: false
  }, async (err, api) => {
    if (err) {
      ioa39rkdevbot.error(
        "Login failed",
        err.message,
        "Check appstate.json validity or regenerate Facebook credentials"
      );
      
      await loadModules();
      
      ioa39rkdevbot.separator();
      ioa39rkdevbot.systemInfo();
      ioa39rkdevbot.warning(
        "Bot loaded but not connected to Facebook",
        "Fix appstate.json and restart to enable messaging"
      );
      ioa39rkdevbot.separator();
      return;
    }

    ioa39rkdevbot.login(api.getCurrentUserID());
    ioa39rkdevbot.separator();

    const { commands, events } = await loadModules();

    ioa39rkdevbot.separator();
    ioa39rkdevbot.systemInfo();
    ioa39rkdevbot.success("Bot is ready and listening for messages!");
    ioa39rkdevbot.separator();

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

          ioa39rkdevbot.executing(commandName, event.senderID);

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
            ioa39rkdevbot.error(
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
              ioa39rkdevbot.error(
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
              ioa39rkdevbot.error(
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
              ioa39rkdevbot.error(
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
          ioa39rkdevbot.error(
            "Auto-download event failed",
            error.message,
            "Check alldl.js implementation"
          );
        }
      }
    });
  });
}
