const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
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
  static machineReadable = process.env.MACHINE_READABLE === 'true';
  static startTime = Date.now();
  
  static banner() {
    if (this.machineReadable) {
      this.jsonOutput('banner', { app: 'BOT', version: '1.0.0' });
      return;
    }
    
    const banner = `
  ${COLORS.cyan}${COLORS.bright}┌─────────────────────────────────────┐
  │  ${COLORS.bgCyan}${COLORS.black} BOT ${COLORS.reset}${COLORS.cyan}${COLORS.bright} Facebook Messenger Bot  │
  │  ${COLORS.dim}by ioa39rkdev${COLORS.reset}${COLORS.cyan}${COLORS.bright}                    │
  └─────────────────────────────────────┘${COLORS.reset}`;
    process.stdout.write(banner + '\n\n');
  }

  static separator() {
    if (this.machineReadable) return;
    process.stdout.write(`${COLORS.dim}${'─'.repeat(40)}${COLORS.reset}\n`);
  }

  static success(message) {
    if (this.machineReadable) {
      this.jsonOutput('success', { message });
      return;
    }
    const timestamp = this.getTimestamp();
    process.stdout.write(`${COLORS.green}✓${COLORS.reset} ${timestamp} ${message}\n`);
  }

  static error(message, details = null, suggestion = null) {
    if (this.machineReadable) {
      this.jsonOutput('error', { message, details, suggestion }, true);
      return;
    }
    
    const timestamp = this.getTimestamp();
    process.stderr.write(`${COLORS.red}✗${COLORS.reset} ${timestamp} ${COLORS.bright}${message}${COLORS.reset}\n`);
    
    if (details) {
      process.stderr.write(`  ${COLORS.dim}Details: ${details}${COLORS.reset}\n`);
    }
    
    if (suggestion) {
      process.stderr.write(`  ${COLORS.yellow}💡 Suggestion: ${suggestion}${COLORS.reset}\n`);
    }
  }

  static info(message) {
    if (this.machineReadable) {
      this.jsonOutput('info', { message });
      return;
    }
    const timestamp = this.getTimestamp();
    process.stdout.write(`${COLORS.blue}ℹ${COLORS.reset} ${timestamp} ${message}\n`);
  }

  static warning(message, suggestion = null) {
    if (this.machineReadable) {
      this.jsonOutput('warning', { message, suggestion });
      return;
    }
    
    const timestamp = this.getTimestamp();
    process.stdout.write(`${COLORS.yellow}⚠${COLORS.reset} ${timestamp} ${message}\n`);
    
    if (suggestion) {
      process.stdout.write(`  ${COLORS.dim}💡 ${suggestion}${COLORS.reset}\n`);
    }
  }

  static command(name) {
    if (this.machineReadable) {
      this.jsonOutput('command_loaded', { name });
      return;
    }
    process.stdout.write(`  ${COLORS.cyan}├─${COLORS.reset} ${name}\n`);
  }

  static event(name) {
    if (this.machineReadable) {
      this.jsonOutput('event_loaded', { name });
      return;
    }
    process.stdout.write(`  ${COLORS.yellow}├─${COLORS.reset} ${name}\n`);
  }

  static login(userID) {
    if (this.machineReadable) {
      this.jsonOutput('login_success', { userID });
      return;
    }
    const timestamp = this.getTimestamp();
    process.stdout.write(`${COLORS.green}✓${COLORS.reset} ${timestamp} Logged in as ${COLORS.cyan}${userID}${COLORS.reset}\n`);
  }

  static executing(command, user) {
    if (this.machineReadable) {
      this.jsonOutput('command_execute', { command, user });
      return;
    }
    const timestamp = this.getTimestamp();
    process.stdout.write(`${COLORS.blue}▶${COLORS.reset} ${timestamp} ${COLORS.yellow}${command}${COLORS.reset} ${COLORS.dim}(user: ${user})${COLORS.reset}\n`);
  }

  static download(platform, user) {
    if (this.machineReadable) {
      this.jsonOutput('download_start', { platform, user });
      return;
    }
    const timestamp = this.getTimestamp();
    process.stdout.write(`${COLORS.magenta}↓${COLORS.reset} ${timestamp} Downloading ${COLORS.cyan}${platform}${COLORS.reset} ${COLORS.dim}(user: ${user})${COLORS.reset}\n`);
  }

  static systemInfo() {
    const info = {
      platform: process.platform,
      nodeVersion: process.version,
      memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      uptime: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`
    };

    if (this.machineReadable) {
      this.jsonOutput('system_info', info);
      return;
    }

    process.stdout.write(`\n${COLORS.dim}System Info:${COLORS.reset}\n`);
    process.stdout.write(`  ${COLORS.cyan}•${COLORS.reset} Platform: ${COLORS.green}${info.platform}${COLORS.reset}\n`);
    process.stdout.write(`  ${COLORS.cyan}•${COLORS.reset} Node: ${COLORS.green}${info.nodeVersion}${COLORS.reset}\n`);
    process.stdout.write(`  ${COLORS.cyan}•${COLORS.reset} Memory: ${COLORS.green}${info.memory}${COLORS.reset}\n`);
    process.stdout.write(`  ${COLORS.cyan}•${COLORS.reset} Uptime: ${COLORS.green}${info.uptime}${COLORS.reset}\n\n`);
  }

  static progressBar(current, total, label = '') {
    if (this.machineReadable) {
      this.jsonOutput('progress', { current, total, label, percentage: Math.round((current / total) * 100) });
      return;
    }

    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filled = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    process.stdout.write(`\r  ${COLORS.cyan}${bar}${COLORS.reset} ${percentage}% ${label}`);
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  static spinner(text) {
    if (this.machineReadable) {
      this.jsonOutput('spinner', { text });
      return;
    }
    
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
      process.stdout.write(`\r${COLORS.cyan}${frames[i]}${COLORS.reset} ${text}`);
      i = (i + 1) % frames.length;
    }, 80);
    
    return {
      stop: (finalText = null) => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
        if (finalText) {
          process.stdout.write(finalText + '\n');
        }
      }
    };
  }

  static getTimestamp() {
    const now = new Date();
    return `${COLORS.dim}[${now.toTimeString().split(' ')[0]}]${COLORS.reset}`;
  }

  static jsonOutput(type, data, isError = false) {
    const output = {
      timestamp: new Date().toISOString(),
      type,
      ...data
    };
    
    const stream = isError ? process.stderr : process.stdout;
    stream.write(JSON.stringify(output) + '\n');
  }

  static section(title) {
    if (this.machineReadable) return;
    process.stdout.write(`\n${COLORS.bright}${COLORS.cyan}${title}${COLORS.reset}\n`);
  }
}

module.exports = BotpackConsole;
