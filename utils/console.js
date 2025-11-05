const chalk = require('chalk');
const gradient = require('gradient-string');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

class BotpackConsole {
  static banner() {
    const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗  ██████╗ ████████╗██████╗  ██████╗  ██████╗██╗  ██╗ ║
║   ██╔══██╗██╔═══██╗╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝ ║
║   ██████╔╝██║   ██║   ██║   ██████╔╝██║   ██║██║     █████╔╝  ║
║   ██╔══██╗██║   ██║   ██║   ██╔═══╝ ██║   ██║██║     ██╔═██╗  ║
║   ██████╔╝╚██████╔╝   ██║   ██║     ╚██████╔╝╚██████╗██║  ██╗ ║
║   ╚═════╝  ╚═════╝    ╚═╝   ╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝ ║
║                                                              ║
║              Facebook Messenger Bot - Botpack Style         ║
║                    Created by: ioa39rkdev                   ║
╚══════════════════════════════════════════════════════════════╝
`;
    console.log(`${COLORS.cyan}${banner}${COLORS.reset}`);
  }

  static separator() {
    console.log(`${COLORS.dim}${'─'.repeat(62)}${COLORS.reset}`);
  }

  static success(message) {
    console.log(`${COLORS.green}✓${COLORS.reset} ${COLORS.bright}${message}${COLORS.reset}`);
  }

  static error(message) {
    console.log(`${COLORS.red}✗${COLORS.reset} ${COLORS.bright}${message}${COLORS.reset}`);
  }

  static info(message) {
    console.log(`${COLORS.blue}ℹ${COLORS.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${COLORS.yellow}⚠${COLORS.reset} ${message}`);
  }

  static command(name) {
    console.log(`${COLORS.magenta}🔧${COLORS.reset} Loaded command: ${COLORS.cyan}${name}${COLORS.reset}`);
  }

  static event(name) {
    console.log(`${COLORS.yellow}📅${COLORS.reset} Loaded event: ${COLORS.cyan}${name}${COLORS.reset}`);
  }

  static login(userID) {
    console.log(`${COLORS.green}✅${COLORS.reset} ${COLORS.bright}Logged in as: ${COLORS.cyan}${userID}${COLORS.reset}`);
  }

  static executing(command, user) {
    console.log(`${COLORS.blue}⚡${COLORS.reset} Executing: ${COLORS.yellow}${command}${COLORS.reset} ${COLORS.dim}by ${user}${COLORS.reset}`);
  }

  static download(platform, user) {
    console.log(`${COLORS.magenta}📥${COLORS.reset} Auto-downloading ${COLORS.cyan}${platform}${COLORS.reset} video ${COLORS.dim}for ${user}${COLORS.reset}`);
  }

  static systemInfo() {
    console.log(`\n${COLORS.cyan}╔════════════════════ SYSTEM INFO ═══════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}║${COLORS.reset} Platform: ${COLORS.green}${process.platform}${COLORS.reset}`);
    console.log(`${COLORS.cyan}║${COLORS.reset} Node Version: ${COLORS.green}${process.version}${COLORS.reset}`);
    console.log(`${COLORS.cyan}║${COLORS.reset} Memory: ${COLORS.green}${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB${COLORS.reset}`);
    console.log(`${COLORS.cyan}╚════════════════════════════════════════════════════╝${COLORS.reset}\n`);
  }
}

module.exports = BotpackConsole;
