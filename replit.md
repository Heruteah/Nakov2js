# Facebook Messenger Bot

**Developer**: ioa39rkdev

## Overview

A modular Facebook Messenger chatbot built with Node.js that provides automated responses, AI interactions, media downloads, and group management features. The bot uses a command and event-driven architecture with a web-based monitoring console for real-time log viewing.

## Recent Changes

**November 7, 2025**
- Renamed console class from `BotpackConsole` to `ioa39rkdevbot` throughout codebase
- Added cassidy-styler formatting to all commands: `prefix.js`, `uid.js`
- Added cassidy-styler formatting to all events: `leavenoti.js`, `alldl.js`
- All 6 commands and 4 events now use consistent FontSystem styling for professional appearance
- Updated README.md with comprehensive documentation and developer attribution

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
- **Runtime**: Node.js
- **Facebook API**: ws3-fca (unofficial Facebook Chat API)
- **HTTP Server**: Built-in Node.js http module
- **Styling Library**: cassidy-styler for Unicode text formatting
- **HTTP Client**: axios for external API calls

### Application Structure

**Modular Command System**
- Commands are dynamically loaded from `modules/commands/` directory
- Each command module exports a config object with metadata (name, description, usage, cooldown, role, prefix requirement)
- Commands support both prefix-based and prefix-free invocation
- Role-based access control (0 = everyone, 1+ = admin levels)
- Built-in cooldown system to prevent spam

**Event-Driven Architecture**
- Event handlers loaded from `modules/events/` directory
- Handles Facebook Messenger events: user joins, leaves, message sends
- Automatic welcome messages for new members
- Bot auto-announces itself when added to groups

**Session Management**
- Uses `appstate.json` for Facebook session persistence (cookie-based authentication)
- Graceful offline mode when credentials are unavailable
- Global state tracking for bot uptime and command registry

**Configuration System**
- `config.json` stores bot settings (prefix, bot name, admin user IDs)
- Centralized admin list for permission checks

### Web Console Dashboard

**Real-time Monitoring**
- HTTP server on port 5000 provides web interface
- Server-Sent Events (SSE) for live log streaming
- Single HTML file with embedded CSS/JavaScript
- Color-coded log display (errors, warnings, success, info)
- Statistics tracking (total logs, uptime, error counts)

**Technical Implementation**
- `/` endpoint serves static HTML dashboard
- `/logs` endpoint establishes SSE connection for log broadcasts
- Global `webConsoleBroadcast()` function pushes logs to all connected clients
- Custom console utility (`utils/console.js`) formats terminal output and web logs

### Text Formatting

**Unicode Styling**
- cassidy-styler library provides font transformations (bold, fancy, typewriter, script, double_struck)
- `format()` function creates structured message layouts with titles and content
- `FontSystem.applyFonts()` applies Unicode font styles to text
- Consistent styling across all commands and events

### Command Examples

**AI Integration** (`ai.js`)
- No-prefix command for natural conversation
- Calls external Copilot API with user prompts
- Edit-in-place responses (updates waiting message)

**Media Processing** (`poli.js`)
- Image generation via Pollinations API
- Base64 image decoding and temporary file storage
- Attachment sending with captions

**Auto-Download** (`alldl.js` event)
- Passive URL detection in messages (Facebook, TikTok)
- Automatic video download and sharing
- Regex-based platform detection

**Utility Commands**
- `help`: Lists all commands with descriptions
- `prefix`: Shows current command prefix
- `uid`: Returns user's Facebook ID
- `uptime`: Detailed runtime statistics with memory usage

### Error Handling
- Try-catch blocks in all command and event handlers
- Fallback to offline mode when Facebook credentials missing
- User-friendly error messages with Unicode styling
- Console logging for debugging

### File System Operations
- Temporary directory (`temp/`) for downloaded media
- Automatic directory creation when needed
- File cleanup after sending attachments

## External Dependencies

### APIs
- **Copilot AI API** (`api-library-kohi.onrender.com/api/copilot`) - GPT-5 chat completions
- **Pollinations AI** (`api-library-kohi.onrender.com/api/pollinations`) - Image generation via Flux model
- **All-Download API** (`api-library-kohi.onrender.com/api/alldl`) - Video downloads from Facebook and TikTok

### NPM Packages
- **ws3-fca** (^3.5.2) - Unofficial Facebook Chat API wrapper
- **axios** (^1.13.1) - Promise-based HTTP client
- **cassidy-styler** (^1.2.6) - Unicode text styling and formatting
- **@types/node** (^22.13.11) - TypeScript definitions for Node.js

### Authentication
- Cookie-based authentication via `appstate.json`
- No password storage - uses Facebook session cookies
- Session persistence across bot restarts

### Data Storage
- **Configuration**: JSON files (`config.json`, `appstate.json`)
- **Temporary Files**: Local filesystem for media downloads
- **No Database**: All state is in-memory (commands, events, uptime tracking)