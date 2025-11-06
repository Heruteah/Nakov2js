# Console Output Guide

This bot features a modern, professional console interface with enhanced readability and useful feedback.

## Features

### 1. **Compact Design**
The large ASCII art banner has been replaced with a clean, 3-line header that saves screen space while maintaining visual appeal.

### 2. **Timestamps**
Every log entry includes a timestamp `[HH:MM:SS]` to help track when events occurred.

```
✓ [23:18:59] Loaded 6 commands
ℹ [23:18:55] Logging in...
```

### 3. **Tree-Style Loading**
Commands and events are displayed in an organized tree structure for better readability:

```
Loading Commands
  ├─ ai
  ├─ help
  ├─ poli
  ├─ prefix
  ├─ uid
  ├─ uptime
✓ [23:18:59] Loaded 6 commands
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

1. **Less Clutter**: Compact banner saves ~10 lines of screen space
2. **Better Debugging**: Timestamps help track execution flow
3. **Faster Problem Solving**: Error suggestions guide you to solutions
4. **Automation Ready**: Machine-readable JSON mode for scripts
5. **Professional Look**: Clean, modern CLI design
