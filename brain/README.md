# Browsing Skill Cognitive Architecture

This skill utilizes a bio-inspired memory structure to organize information, ensuring the agent acts consistently and learns over time.

## 🧠 Brain Structure

The `brain/` directory acts as the agent's memory center.

### 1. Sensory Memory (`brain/sensory/`)
**Purpose**: Stores raw, transient inputs received from the browser.
- **Content**: HTML snapshots (`.html`), Screenshots (`.png`), Raw text dumps.
- **Lifecycle**: Very short. Overwritten frequently.
- **Usage**: "I need to see what's on the page right now."

### 2. Short-Term Memory (`brain/short_term/`)
**Purpose**: Stores the current workspace context and active variables.
- **Content**: `current_context.json`, `active_selectors.json`, `mission_status.md`.
- **Lifecycle**: Valid for the duration of the current task or session.
- **Usage**: "What was I trying to click? What step am I on?"

### 3. Long-Term Memory

#### A. Episodic (`brain/long_term/episodic/`)
**Purpose**: Records specific events and session logs.
- **Content**: `session_2024_01_01.log`, `error_logs/`.
- **Usage**: "Did I try this before? What happened last time I ran this workflow?"

#### B. Semantic (`brain/long_term/semantic/`)
**Purpose**: Stores generalized knowledge, learned patterns, and verified rules.
- **Content**: `common_selectors.json` (e.g., "Login buttons usually look like X"), `site_rules/` (e.g., "Site A requires slow typing").
- **Usage**: "How do I generally handle a search bar? What are the known quirks of this website?"

## 📂 Browser Workspace (`browser_workspace/`)
**Purpose**: Dedicated output directory for task results.
- **Location**: Project Root `browser_workspace/`.
- **Usage**: **ALL** final screenshots, downloaded files, and reports intended for the User must be saved here. Do not save user artifacts inside the `brain` or `skills` folder.
