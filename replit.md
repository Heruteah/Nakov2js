# Facebook Messenger Bot

## Overview

This is a modular Facebook Messenger bot built with Node.js that provides automated responses, command handling, and event-driven interactions. The bot features a web-based console dashboard for real-time monitoring, supports both prefix and non-prefix commands, and includes automatic media downloading from social platforms. It uses the ws3-fca library for Facebook API integration and cassidy-styler for elegant Unicode-formatted responses across all commands and events.

## Recent Changes

**November 7, 2025**
- Renamed console class from `BotpackConsole` to `ioa39rkdevbot` throughout codebase
- Added new `out` command for admins to remove bot from threads (admin-only, role 2)
- Added cassidy-styler formatting to all commands: `prefix.js`, `uid.js`
- Added cassidy-styler formatting to all events: `leavenoti.js`, `alldl.js`
- All 7 commands and 4 events now use consistent FontSystem styling for professional appearance

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Framework
- **Runtime**: Node.js application with modular architecture
- **Facebook Integration**: Uses `ws3-fca` library for Facebook Messenger API connectivity
- **Authentication**: Cookie-based authentication via `appstate.json` file containing Facebook session cookies
- **Offline Mode**: Bot can initialize without valid credentials for development/testing purposes

### Command System
- **Dynamic Module Loading**: Commands are loaded from `modules/commands/` directory at startup
- **Command Structure**: Each command exports a config object (name, description, usage, cooldown, role, prefix) and a run function
- **Prefix Support**: Dual-mode system supporting both prefixed (e.g., `-help`) and non-prefixed commands (e.g., `ai`)
- **Permission Levels**: Role-based access control (0=everyone, 1=admin, 2=super admin)
- **Cooldown System**: Per-command spam prevention with configurable cooldown periods
- **Global Command Registry**: Commands stored in `global.commands` Map for centralized access
- **Available Commands**:
  - `ai` - Conversational AI using GPT-5 (no prefix required)
  - `help` - Display all available commands (prefix required)
  - `out` - Admin-only command to remove bot from thread (prefix required, role 2)
  - `poli` - Generate AI images from text prompts (prefix required)
  - `prefix` - Show current command prefix (no prefix required)
  - `uid` - Get Facebook user ID (prefix required)
  - `uptime` - Display bot runtime statistics (prefix required)

### Event Handling
- **Event-Driven Architecture**: Separate event handlers in `modules/events/` for different Facebook events
- **Supported Events**: 
  - Welcome messages for new members
  - Leave notifications
  - Bot join notifications with auto-nickname setting
  - Automatic link detection and media downloading (Facebook, TikTok)
- **Event Execution Pattern**: Each event exports name and execute function receiving api, event, and config objects

### Web Console Dashboard
- **Real-Time Monitoring**: HTTP server on port 5000 serving live dashboard
- **Server-Sent Events (SSE)**: Streaming logs to connected clients via `/logs` endpoint
- **Log Broadcasting**: Global `webConsoleBroadcast` function for pushing logs to all connected clients
- **Statistics Tracking**: Uptime, total logs, success/error counts displayed in real-time
- **UI Features**: Color-coded logs, filtering by type, glassmorphism design with gradients

### Message Formatting
- **Unicode Styling**: All commands and events use `cassidy-styler` library for elegant text formatting
- **Font Systems**: Multiple font styles (bold, fancy, typewriter, script, double_struck)
- **Structured Formatting**: `format()` function creates title/content structured messages with consistent layout
- **Consistent UX**: Unified styling across all 7 commands and 4 events for professional appearance
- **Implementation**: Every command and event imports and uses FontSystem.applyFonts() and format() for consistent message presentation

### Utility Systems
- **Custom Console Logger**: `utils/console.js` (exported as `ioa39rkdevbot` class) provides styled terminal output with spinners, sections, and banners
- **Machine-Readable Mode**: Optional JSON output for programmatic log consumption
- **Temporary File Management**: `temp/` directory for downloaded media files
- **Error Handling**: Try-catch blocks with formatted error messages throughout
- **Admin Controls**: Bot removal command (`out`) with admin verification against config.admin array

### Configuration Management
- **Central Config**: `config.json` stores bot-wide settings (prefix, bot name, admin IDs, invalid command message)
- **Bot Identity**: Configurable bot name that's applied as nickname when joining threads
- **Admin List**: Array of Facebook user IDs with elevated permissions

## External Dependencies

### Core Libraries
- **ws3-fca** (v3.5.2): Facebook Chat API wrapper for sending/receiving messages, managing threads
- **cassidy-styler** (v1.2.6): Unicode text styling library providing FontSystem and format utilities
- **axios** (v1.13.1): HTTP client for external API calls (AI services, media downloaders)

### External APIs
- **Pollinations AI** (`api-library-kohi.onrender.com/api/pollinations`): Image generation from text prompts using Flux model
- **Copilot AI** (`api-library-kohi.onrender.com/api/copilot`): GPT-5 conversational AI with conversation history
- **All Downloader** (`api-library-kohi.onrender.com/api/alldl`): Universal media downloader for Facebook and TikTok videos

### Runtime Environment
- **Node.js**: JavaScript runtime (no specific version constraint in package.json)
- **File System**: Local file operations for appstate, config, temp files, and module loading
- **HTTP Server**: Built-in Node.js HTTP module for web console (no Express dependency)

### Authentication Storage
- **appstate.json**: Contains Facebook session cookies (datr, fr, ps_l, vpd) with expiration dates
- **Cookie Management**: Persistent authentication state maintained across bot restarts
- **Security Note**: appstate.json contains sensitive credentials and should be protected