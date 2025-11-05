module.exports = {
  config: {
    name: "prefix",
    description: "Shows the current command prefix",
    usage: "prefix",
    cooldown: 3,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    const config = require("../../config.json");
    const message = `📌 Current prefix: ${config.prefix}\n\nUse ${config.prefix}help to see available commands.`;
    reply(message);
  }
};
