---
name: browsing
description: Control a web browser locally to navigate, snapshot, and interact with websites using a cognitive architecture.
---

# Browsing Skill

This skill allows you to control a local web browser using Playwright. It is designed to mimic a human cognitive process, separating "Memory/Knowledge" (Brain) from "Work Output" (Workspace).

## 🧠 Cognitive Architecture

This skill uses a bio-inspired memory structure located in `.agent/skills/browsing/brain/`. You must use this to maintain context and learn from your interactions.

- **Sensory Memory** (`brain/sensory/`):
    - **Usage**: When you capture a snapshot or see something temporary, think of it here.
    - **Action**: "I see X on the page."

- **Short-Term Memory** (`brain/short_term/`):
    - **Usage**: Store your *current* mission status, active selectors you are testing, or temporary variables.
    - **Action**: "I am currently on Step 2 of the login flow."

- **Long-Term Memory** (`brain/long_term/`):
    - **Episodic** (`episodic/`): Logs of past sessions. **Check this before starting** to see if you've failed this task before.
    - **Semantic** (`semantic/`): **Verified Knowledge**. If you successfully identify a stable selector (e.g., `#login-button`), SAVE IT here. Future sessions should look here first.

## 📂 Browser Workspace (Output)

**CRITICAL**: Do **NOT** save task artifacts (screenshots for the user, downloaded files, final reports) inside the skill directory.

- **Target Directory**: `c:/Users/mskim/projects/naverblog/browser_workspace/`
- **Rule**: All `screenshot`, `download`, or `report` actions must target this directory.

## Installation

```bash
cd .agent/skills/browsing
npm install
npm run build
```

## Usage

### Basic Commands

| Command | Arguments | Description |
|---|---|---|
| `open` | `<url>` | Opens a URL. |
| `click` | `<selector>` | Clicks an element. |
| `type` | `<selector> <text>` | Types text. |
| `press` | `<key>` | Presses a key (Enter, Tab). |
| `screenshot` | `<path> [fullPage]` | **Save to `browser_workspace/`**. |
| `snapshot` | - | Dumps HTML (Ephemeral, can go to `brain/sensory` if needed). |

### Running External Workflows

You can run JSON command files located anywhere on your system. This allows you to keep project-specific workflows separate from the generic skill.

```bash
# Example: Run a specific workflow from your project root
npm run browse run-file c:/Users/mskim/projects/naverblog/naver_workflows/core/login_humanlike.json
```

### Generic Example

```bash
# Run the built-in example
npm run browse run-file commands/examples/google_search.json
```

## Learning Protocol

1. **Before Action**: Check `brain/long_term/semantic` for known selectors/rules for the current domain.
2. **After Success**: If you found a new reliable selector/pattern, create a new file in `brain/long_term/semantic/` (e.g., `duckduckgo_rules.json`) to "learn" it.
3. **After Failure**: Log the failure in `brain/long_term/episodic/` so you don't repeat the mistake.
