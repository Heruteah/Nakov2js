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

console.log("Logging in...");

login(credentials, {
  online: true,
  updatePresence: true,
  selfListen: false,
  randomUserAgent: false
}, async (err, api) => {
  if (err) return console.error("LOGIN ERROR:", err);

  console.log(`✅ Logged in as: ${api.getCurrentUserID()}`);

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

  api.listenMqtt(async (err, event) => {
    if (err || !event.body || event.type !== "message") return;
    if (event.senderID === api.getCurrentUserID()) return;
    const aiCommand = commands.get("ai");
    if (!aiCommand) return console.error("⚠️ AI command not loaded.");
    try {
      await aiCommand.execute({ api, event, args: [event.body] });
    } catch (error) {
      console.error("Error in AI command:", error);
      api.sendMessage("❌ Error processing your message.", event.threadID, event.messageID);
    }
  });
});
