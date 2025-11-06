# Console Output Guide

This bot features a modern, professional console interface powered by **cassidy-styler** for beautiful Unicode fonts, enhanced readability, and useful feedback.

## Features

### 1. **Stylish Unicode Design**
The console now uses **cassidy-styler** to create beautiful Unicode fonts:
- **Banner**: Bold title "𝗕𝗢𝗧" with fancy subtitle "𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝖬𝖾𝗌𝗌𝖾𝗇𝗀𝖾𝗋 𝖡𝗈𝗍"
- **Author**: Script font "𝑏𝑦 𝑖𝑜𝑎39𝑟𝑘𝑑𝑒𝑣"
- **Section Headers**: Bold Unicode "𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀"
- **Commands/Events**: Typewriter font "𝚊𝚒", "𝚑𝚎𝚕𝚙", "𝚙𝚘𝚕𝚒"
- **Messages**: Fancy font for success and info messages

### 2. **Timestamps**
Every log entry includes a timestamp `[HH:MM:SS]` to help track when events occurred.

```
✓ [23:18:59] Loaded 6 commands
ℹ [23:18:55] Logging in...
```

### 3. **Tree-Style Loading with Unicode Fonts**
Commands and events are displayed in an organized tree structure with beautiful typewriter fonts:

```
𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀
  ├─ 𝚊𝚒
  ├─ 𝚑𝚎𝚕𝚙
  ├─ 𝚙𝚘𝚕𝚒
  ├─ 𝚙𝚛𝚎𝚏𝚒𝚡
  ├─ 𝚞𝚒𝚍
  ├─ 𝚞𝚙𝚝𝚒𝚖𝚎
✓ [23:27:50] 𝖫𝗈𝖺𝖽𝖾𝖽 𝟨 𝖼𝗈𝗆𝗆𝖺𝗇𝖽𝗌
```

### 4. **Actionable Error Messages**
Errors now provide three levels of information:
- **Message**: What went wrong
- **Details**: Technical error details
- **Suggestion**: How to fix it

Example:
```
✗ [23:19:02] appstate.json is missing or malformed
  Details: ENOENT: no such file or directory
  💡 Suggestion: Create appstate.json with valid Facebook credentials or check file permissions
```

### 5. **Proper Stream Handling**
- Normal output (success, info, warnings) → `stdout`
- Errors → `stderr`

This allows you to redirect error logs separately in production.

### 6. **System Information**
Compact system info display with uptime tracking:

```
System Info:
  • Platform: linux
  • Node: v22.17.0
  • Memory: 40.39 MB
  • Uptime: 4.0s
```

## Machine-Readable Mode

For automation, parsing, or logging systems, enable JSON output mode:

```bash
MACHINE_READABLE=true node index.js
```

All output will be in JSON format:

```json
{"timestamp":"2025-11-06T23:18:59.000Z","type":"login_success","userID":"61577787296126"}
{"timestamp":"2025-11-06T23:18:59.000Z","type":"command_loaded","name":"ai"}
{"timestamp":"2025-11-06T23:18:59.000Z","type":"success","message":"Loaded 6 commands"}
```

## Color Legend

- 🟢 Green ✓ - Success operations
- 🔴 Red ✗ - Errors (with suggestions)
- 🔵 Blue ℹ - Informational messages
- 🟡 Yellow ⚠ - Warnings
- 🟣 Cyan - Section headers and highlights

## Benefits

1. **Beautiful Unicode Fonts**: Powered by cassidy-styler for elegant text styling
2. **Better Readability**: Different font styles for different types of information
3. **Better Debugging**: Timestamps help track execution flow
4. **Faster Problem Solving**: Error suggestions guide you to solutions
5. **Automation Ready**: Machine-readable JSON mode for scripts
6. **Professional Look**: Clean, modern CLI design with Unicode symbols
7. **Offline Mode Support**: Bot loads even without appstate.json

## Offline Mode

The bot now gracefully handles missing appstate.json:
- **Continues to run** and load all commands/events
- **Shows animated spinners** during module loading
- **Displays clear warnings** with actionable suggestions
- **System info** still visible even in offline mode

No more crashes - the bot stays running for testing and development!
