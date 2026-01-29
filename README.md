# Browsing MCP Skill

A powerful, human-like browsing automation skill for AI agents, built with Playwright.

## Features

- **Human-like Interactions**: Simulates realistic mouse movements (Bayesian curves) and typing (copy-paste simulation) to bypass bot detection.
- **Headful/Headless Modes**: Supports visible browser execution for debugging and verification.
- **Command-based Interface**: Execute sequences of browser actions (open, click, type, wait, snapshot) via JSON files or CLI arguments.
- **Session Management**: (Optional) Can persist browser contexts to maintain login sessions.

## Installation

```bash
npm install
npm run build
```

## Usage

### CLI

```bash
# Run a single command
npm run browse open https://google.com

# Run a sequence of commands from a file
npm run browse run-file commands/example.json
```

### Command File Example

```json
[
  ["open", "https://nid.naver.com/nidlogin.login"],
  ["type", "#id", "your_id"],
  ["wait", "1000"],
  ["type", "#pw", "your_password"],
  ["click", ".btn_login"],
  ["screenshot", "login_result.png"]
]
```

## logic

The core logic resides in `src/index.ts`. It uses Playwright to launch a browser context and exposes functions to control the page.

- `moveMouseHumanlike`: Generates natural-looking mouse paths.
- `type`: Simulates copy-paste or human typing.
- `executeBatch`: Processes a list of commands sequentially.

## License

MIT
