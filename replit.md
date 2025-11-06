# Overview

This is a Facebook Messenger chatbot built on Node.js that uses the `ws3-fca` library to interact with Facebook's messaging platform. The bot features a modular command system with prefix-based commands, a Botpack-style colorful console interface, automatic video downloads from Facebook and TikTok links, and event handlers for welcoming users, notifying on leave, and automatically setting bot nickname when joining threads.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Authentication & Session Management

**Problem**: Maintaining persistent authentication with Facebook's messaging platform.

**Solution**: Cookie-based authentication using `appstate.json` file that stores Facebook session cookies.

**Rationale**: The `ws3-fca` library supports appState-based login, which allows the bot to maintain sessions without requiring username/password on every restart. The appState contains authentication cookies (datr, fr, ps_l, vpd) that validate the bot's session.

**Pros**:
- No need to re-authenticate with credentials on each restart
- Supports long-lived sessions through cookie expiration dates
- Simplified deployment and automation

**Cons**:
- Security risk if appstate.json is exposed
- Requires manual cookie refresh when sessions expire
- Tied to specific Facebook account

## Bot Framework Architecture (Updated November 6, 2025)

**Problem**: Creating a scalable and maintainable command-based chatbot.

**Solution**: Event-driven architecture using MQTT listener with a modular command loading system.

**Implementation**:
- Main event loop in `index.js` using `api.listenMqtt()`
- Commands are isolated in separate files under `modules/commands/`
- Dynamic command loading at startup via filesystem scanning
- Commands stored in a Map for O(1) lookup performance
- **Offline Mode Support**: Bot continues loading and running even without valid appstate.json

**Key Design Decisions**:
1. **Dual Command Modes**: Supports both prefix-required commands (`!help`, `!poli`) and prefix-free commands (`ai`, `prefix`) via `usePrefix` flag
2. **Self-Listen Disabled**: Bot ignores its own messages to prevent infinite loops
3. **Message Filtering**: Only processes "message" type events with body content from other users
4. **No Fallback Behavior**: Non-prefixed messages that don't match a command are ignored
5. **Graceful Degradation**: Missing appstate.json doesn't crash the bot - it continues in offline mode with animated loading
6. **Animated Loading**: Uses spinners during module loading for visual feedback

## Command Module System (Updated November 5, 2025)

**Problem**: Need flexible command registration without modifying core bot logic.

**Solution**: Plugin-style command modules with standardized interface using config/run pattern.

**Command Structure**:
```javascript
{
  config: {
    name: string,           // Command identifier
    description: string,    // Command documentation
    usage: string,          // Usage example
    cooldown: number,       // Cooldown in seconds
    role: number,           // Permission level (0=everyone, 1=admin)
    prefix: boolean         // Whether command requires "!" prefix
  },
  run: function             // Command handler with (api, event, args, reply, react)
}
```

**Command Discovery**: 
- Scans `modules/commands/` directory at startup
- Auto-loads all `.js` files
- Validates command structure (config.name and run function) before registration
- Logs loaded commands for debugging

**Helper Functions**:
- `reply(message)` - Quick reply function
- `react(emoji)` - React to message with emoji

**Per-Command Features**:
- Individual cooldown times configurable per command
- Role-based permissions (0 = everyone, 1 = admin)
- Prefix/non-prefix mode per command

**Pros**:
- Easy to add new commands without touching core code
- Commands are self-contained and testable
- Clear separation of concerns
- Flexible per-command configuration
- Helper functions simplify common operations

**Cons**:
- No hot-reload capability (requires bot restart)
- Limited error isolation between commands

## Event Module System (Added November 5, 2025)

**Problem**: Need automated responses to Facebook Messenger events like users joining/leaving groups.

**Solution**: Plugin-style event modules similar to command modules, with standardized interface for handling Facebook log events.

**Event Structure**:
```javascript
{
  name: string,           // Event identifier
  execute: function       // Event handler with { api, event, config }
}
```

**Event Discovery**:
- Scans `modules/events/` directory at startup
- Auto-loads all `.js` files
- Validates event structure before registration
- Logs loaded events for debugging

**Supported Events**:
1. **welcome** (log:subscribe) - Greets new users joining a thread
   - Triggers when users are added to a group
   - Skips greeting if the bot itself is added
   - Displays personalized welcome message with user's name
   
2. **leavenoti** (log:unsubscribe) - Notifies when users leave a thread
   - Triggers when users leave or are removed from a group
   - Fetches user information to display their name
   - Shows goodbye message to remaining members
   
3. **jointnoti** (log:subscribe) - Handles bot joining threads
   - Triggers only when the bot itself is added to a group
   - Sends introduction message explaining bot's purpose
   - Automatically changes bot's nickname to configured value using api.nickname()
   - Logs nickname change success/failure

4. **alldl** (message event) - Auto-downloads videos from social media links (Added November 5, 2025)
   - Automatically detects Facebook and TikTok video links in messages
   - Downloads and sends the video to the chat
   - Supported platforms: Facebook (facebook.com, fb.watch, m.facebook.com), TikTok (tiktok.com, vt.tiktok.com, vm.tiktok.com)
   - API Endpoint: `https://api-library-kohi.onrender.com/api/alldl`
   - Response includes video URL and platform name
   - Automatically cleans up downloaded files after 5 seconds

**Event Processing**:
- Event type detection: Distinguishes between "message" and "event" types
- Log type routing: Routes log:subscribe and log:unsubscribe to appropriate handlers
- Parallel execution: Both welcome and jointnoti can run for the same log:subscribe event
- Error isolation: Each event handler has independent try-catch blocks

**Pros**:
- Automated user engagement without manual intervention
- Self-contained event logic separate from command processing
- Graceful error handling prevents one event from breaking others
- Easy to add new event types following the same pattern

**Cons**:
- No hot-reload capability (requires bot restart)
- Dependent on Facebook's event payload structure
- Nickname change requires appropriate thread permissions

## Message Processing Pipeline

**Processing Flow** (Updated November 5, 2025):
1. Receive message event via MQTT
2. Filter out bot's own messages and non-message events
3. Parse message for prefix detection (with whitespace trimming)
4. Extract command name and arguments
5. Validate prefix usage against command requirements
6. Check cooldown status for user-command combination
7. Route to appropriate command handler or show validation/cooldown error
8. Execute command with standardized context
9. Update cooldown timestamp for user-command pair

**Prefix Handling Logic**:
- Prefix is configurable via `config.json` (default: `!`)
- Whitespace handling: Trims spaces after prefix (e.g., `!   help` works correctly)
- Prefix-free commands match without prefix check
- Arguments extracted via space-splitting with empty value filtering

**Prefix Validation** (Updated November 4, 2025):
- If command requires prefix but user doesn't use it: Returns "This command uses a prefix"
- If command doesn't require prefix but user uses it: Returns "This command doesn't use prefix"
- Commands must explicitly set `usePrefix: true` or `usePrefix: false`
- Prefixed unknown commands show configurable invalid command message
- Non-prefixed unknown messages are ignored (no response)

**Cooldown System** (Added November 5, 2025):
- Prevents command spam with configurable cooldown time
- Cooldown is tracked per user per command (different users can use same command simultaneously)
- Default cooldown: 3 seconds (configurable in config.json)
- Cooldown tracking uses Map with key format: `${userID}_${commandName}`
- User-friendly feedback: "⏳ Please wait X seconds before using this command again."
- Cooldowns are stored in memory and reset on bot restart
- No cooldown bypass for admins (can be added in future)

**Current Commands** (Updated November 5, 2025):
- `!help` - Shows available commands with usage examples (requires prefix)
- `!uptime` - Shows how long the bot has been running (requires prefix)
- `!uid` - Returns the user's Facebook User ID (requires prefix)
- `!poli <prompt>` - Generates images using Pollinations AI (requires prefix)
- `ai <question>` - Chat with AI assistant (no prefix needed)
- `prefix` - Displays the current command prefix (no prefix needed)

# External Dependencies

## Third-Party Libraries

**ws3-fca** (v3.5.2)
- Purpose: Facebook Chat API wrapper for Node.js
- Function: Handles Facebook Messenger protocol, authentication, and message sending/receiving
- Integration: Core dependency for all Facebook interactions

**axios** (v1.13.1)
- Purpose: HTTP client for making API requests
- Usage: Used by both AI and Poli commands for API requests
- Endpoints: Copilot AI API and Pollinations API

**@types/node** (v22.13.11)
- Purpose: TypeScript type definitions for Node.js
- Usage: Development dependency for IDE support

## External API Services

**Copilot AI API**
- Endpoint: `https://api-library-kohi.onrender.com/api/copilot`
- Model: GPT-5
- Parameters: `prompt`, `model`, `user` (sender ID)
- Response Format: `{ status, data: { text } }`
- Purpose: Provides AI-powered conversational responses
- Used By: `ai` command module

**Pollinations AI API** (Added November 4, 2025)
- Endpoint: `https://api-library-kohi.onrender.com/api/pollinations`
- Model: flux
- Parameters: `prompt` (image description), `model` (AI model name)
- Response Format: `{ status, data: "<base64 image data>" }`
- Purpose: Generates images from text prompts using AI
- Used By: `poli` command module
- Image Format: Returns JPEG image as base64-encoded string

## Platform Dependencies

**Facebook Messenger Platform**
- Protocol: MQTT for real-time message delivery
- Authentication: Cookie-based session management
- Required Data: Valid appstate.json with Facebook session cookies
- Features Used: Message sending, editing, thread management, user identification

## File System Dependencies

**config.json** (Required, Updated November 5, 2025)
- Format: JSON object with bot configuration
- Contains:
  - `prefix`: Command prefix character (default: `!`)
  - `invalidCommandMessage`: Message shown for invalid prefixed commands
  - `botName`: Bot name displayed in introduction messages
  - `botNickname`: Nickname automatically set when bot joins a thread
  - `cooldownTime`: Cooldown duration in seconds for commands (default: 3)
  - `admin`: Array of admin user IDs for future admin-only commands
- Purpose: Centralized configuration for bot behavior
- Security: Can be committed to version control (no sensitive data)
- Example:
  ```json
  {
    "prefix": "!",
    "invalidCommandMessage": "❌ Invalid command. Type !help to see available commands.",
    "botName": "Facebook Bot",
    "botNickname": "🤖 Bot",
    "cooldownTime": 3,
    "admin": []
  }
  ```

**appstate.json** (Required)
- Format: JSON array of cookie objects
- Contains: Facebook authentication cookies (datr, fr, ps_l, vpd)
- Security: Must be kept secure and not committed to version control
- Expiration: Cookies have expiration dates requiring periodic refresh

**modules/commands/** (Directory Structure)
- Expected Location: `./modules/commands/`
- Auto-created if missing
- Contains: Individual command module .js files
- Loaded: At bot startup via dynamic require()

**modules/events/** (Directory Structure, Added November 5, 2025)
- Expected Location: `./modules/events/`
- Auto-created if missing
- Contains: Individual event module .js files (welcome.js, leavenoti.js, jointnoti.js, alldl.js)
- Loaded: At bot startup via dynamic require()
- Purpose: Handles Facebook Messenger log events (user join/leave) and message events (auto-download)

**utils/console.js** (Console Interface, Updated November 6, 2025)
- Purpose: Modern CLI design with professional console output using cassidy-styler for Unicode fonts
- Dependencies: cassidy-styler (npm package for Unicode text styling)
- Design Principles:
  1. **Show Progress Visually**: Tree-style loading indicators, progress bars, and animated spinners
  2. **Reaction for Every Action**: Immediate feedback with timestamps for all operations
  3. **Actionable Error Messages**: Three-tier error output (message, details, suggestions)
  4. **Machine-Readable Output**: JSON mode via MACHINE_READABLE environment variable
  5. **Standard Streams (I/O)**: Errors to stderr, normal output to stdout
- Unicode Font Styling:
  - Banner: Bold font for "BOT", fancy font for subtitle, script font for author
  - Section Headers: Bold Unicode (e.g., "𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀")
  - Commands/Events: Typewriter font (e.g., "𝚊𝚒", "𝚑𝚎𝚕𝚙")
  - Messages: Fancy font for success/info messages
  - User IDs: Bold font for emphasis
- Features:
  - Beautiful Unicode banner with special arrow symbol (➤)
  - Timestamps on all log messages [HH:MM:SS]
  - Tree-style command/event loading visualization (├─ structure)
  - Color-coded log levels (success ✓, error ✗, info ℹ, warning ⚠)
  - Enhanced error handling with details and actionable suggestions
  - System info display (platform, Node version, memory, uptime)
  - Section headers for better organization
  - Progress bar support for long-running tasks
  - Animated spinner support for module loading
  - Machine-readable JSON output mode for automation/parsing
  - Offline mode support (bot continues running without appstate.json)
- Output Streams:
  - stdout: success, info, warnings, command execution logs
  - stderr: errors with details and suggestions
- ANSI color codes combined with Unicode fonts for enhanced visual appeal