# Overview

This is a Facebook Messenger chatbot built on Node.js that uses the `ws3-fca` library to interact with Facebook's messaging platform. The bot features a modular command system with both prefix-based and prefix-free commands, enabling users to interact with an AI assistant and access help documentation through Facebook Messenger.

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

## Bot Framework Architecture

**Problem**: Creating a scalable and maintainable command-based chatbot.

**Solution**: Event-driven architecture using MQTT listener with a modular command loading system.

**Implementation**:
- Main event loop in `index.js` using `api.listenMqtt()`
- Commands are isolated in separate files under `modules/commands/`
- Dynamic command loading at startup via filesystem scanning
- Commands stored in a Map for O(1) lookup performance

**Key Design Decisions**:
1. **Dual Command Modes**: Supports both prefix-required commands (`!help`) and prefix-free commands (`ai`) via `usePrefix` flag
2. **Self-Listen Disabled**: Bot ignores its own messages to prevent infinite loops
3. **Message Filtering**: Only processes "message" type events with body content from other users

## Command Module System

**Problem**: Need flexible command registration without modifying core bot logic.

**Solution**: Plugin-style command modules with standardized interface.

**Command Structure**:
```javascript
{
  name: string,           // Command identifier
  description: string,    // Command documentation
  usePrefix: boolean,     // Whether command requires "!" prefix
  execute: function       // Command handler with { api, event, args }
}
```

**Command Discovery**: 
- Scans `modules/commands/` directory at startup
- Auto-loads all `.js` files
- Validates command structure before registration
- Logs loaded commands for debugging

**Pros**:
- Easy to add new commands without touching core code
- Commands are self-contained and testable
- Clear separation of concerns

**Cons**:
- No hot-reload capability (requires bot restart)
- Limited error isolation between commands

## Message Processing Pipeline

**Processing Flow**:
1. Receive message event via MQTT
2. Filter out bot's own messages and non-message events
3. Parse message for prefix detection (with whitespace trimming)
4. Extract command name and arguments
5. Validate prefix usage against command requirements
6. Route to appropriate command handler or show validation error
7. Execute command with standardized context or fallback to AI

**Prefix Handling Logic**:
- Default prefix: `!`
- Whitespace handling: Trims spaces after prefix (e.g., `!   help` works correctly)
- Prefix-free commands match without prefix check
- Arguments extracted via space-splitting with empty value filtering

**Prefix Validation** (Added November 4, 2025):
- If command requires prefix but user doesn't use it: Returns "This command uses a prefix"
- If command doesn't require prefix but user uses it: Returns "This command doesn't use prefix"
- Commands must explicitly set `usePrefix: true` or `usePrefix: false`
- Unmatched commands fall back to AI handler for conversational responses

**Current Commands**:
- `!help` - Shows available commands (requires prefix, `usePrefix: true`)
- `ai` - Chat with AI assistant (no prefix needed, `usePrefix: false`)

# External Dependencies

## Third-Party Libraries

**ws3-fca** (v3.5.2)
- Purpose: Facebook Chat API wrapper for Node.js
- Function: Handles Facebook Messenger protocol, authentication, and message sending/receiving
- Integration: Core dependency for all Facebook interactions

**axios** (v1.13.1)
- Purpose: HTTP client for making API requests
- Usage: AI command makes GET requests to external AI service
- Endpoint: `https://api-library-kohi.onrender.com/api/copilot`

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

## Platform Dependencies

**Facebook Messenger Platform**
- Protocol: MQTT for real-time message delivery
- Authentication: Cookie-based session management
- Required Data: Valid appstate.json with Facebook session cookies
- Features Used: Message sending, editing, thread management, user identification

## File System Dependencies

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