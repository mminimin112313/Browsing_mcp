---
name: browsing
description: Control a web browser locally to navigate, snapshot, and interact with websites.
---

# Browsing Skill

This skill allows you to control a local web browser using Playwright. You can navigate, capture content, click elements, type text, and take screenshots.

## Installation

Before using this skill, install the dependencies:

```bash
cd .agent/skills/browsing
npm install
npm run build
```

> [!NOTE]
> This skill requires a Chromium-based browser. Playwright will use the system Chrome/Chromium.

## Usage

Use `npm run browse` to execute browser actions.

### Commands

| Command | Example | Description |
|---|---|---|
| `open` | `npm run browse open https://google.com` | Opens a URL in a new browser |
| `snapshot` | `npm run browse snapshot` | Gets the current page HTML content |
| `screenshot` | `npm run browse screenshot ./output.png` | Captures a full-page screenshot |
| `click` | `npm run browse click 'button#submit'` | Clicks an element by selector |
| `type` | `npm run browse type 'input[name=q]' 'search query'` | Types text into an input |
| `getText` | `npm run browse getText '.result'` | Extracts text from an element |
| `close` | `npm run browse close` | Closes the browser |

### Example Workflow

```bash
# Open a page
npm run browse open https://www.google.com

# Take a screenshot
npm run browse screenshot ./google-home.png

# Type in search box and submit
npm run browse type 'textarea[name=q]' 'Antigravity Agent'

# Click search button
npm run browse click 'input[type=submit]'

# Get results
npm run browse snapshot
```

## Tips

- Always start with `open` to initialize the browser.
- Use `snapshot` to "see" the page content before interacting.
- The browser closes automatically after each command for clean execution.
- Use CSS selectors for `click`, `type`, and `getText`.
