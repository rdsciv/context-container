# Context Container

A native macOS desktop app that eliminates the friction of setting up AI workspaces. Define your profile once, browse context image templates, and generate perfectly synthesized LLM payloads in one click.

Built with Tauri v2, React 19, and Rust.

## How It Works

Context Container replaces copy-paste prompt engineering with a visual control board:

1. **Profiles** — Store your role, location, tech stack, and preferences as reusable variables
2. **Context Images** — Browse and create markdown templates with `{{variable.name}}` placeholders
3. **Process** — Select a template, and the engine auto-swaps all variables from your active profile
4. **Export** — Copy the fully resolved payload to your clipboard, ready for any LLM

```
Template:  "Act as a {{user.role}} specializing in {{framework.backend}}."
Profile:   { user.role: "Software Engineer", framework.backend: "Rust" }
Output:    "Act as a Software Engineer specializing in Rust."
```

## Features

- **Variable Substitution Engine** — `{{variable.name}}` placeholders resolve against your active profile with missing variable detection
- **Profile Management** — Create multiple profiles for different contexts (work, personal, data science) with inline key-value editing
- **Template Authoring** — Build custom context images with live variable detection and tag organization
- **MCP Server Toggles** — Manage which local tools (GitHub, Docker, filesystem, web search) are exposed per session
- **Dual-View Comparison** — View raw template source alongside processed output to verify substitutions
- **Native macOS Feel** — Glassmorphism UI with overlay title bar, dark theme, and smooth transitions

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v18+)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### Install and Run

```bash
git clone https://github.com/rdsciv/context-container.git
cd context-container
npm install
npm run tauri dev
```

On first launch, the app initializes `~/.context-container/` with:
- A default developer profile
- Four seed context images (Karpathy Protocol, Research Analyst, DevOps Commander, Creative Director)
- Four MCP server entries (GitHub, Local Filesystem, Web Search, Docker)

### Build for Production

```bash
npm run tauri build
```

The compiled `.app` bundle appears in `src-tauri/target/release/bundle/`.

## Architecture

```
src/                        # React frontend
  App.tsx                   # Shell: sidebar + view routing
  api.ts                    # Tauri IPC wrappers (12 commands)
  types.ts                  # Shared TypeScript interfaces
  components/
    Dashboard.tsx           # Image card grid with MCP status dots
    ProfilesView.tsx        # Profile CRUD with inline editing
    McpView.tsx             # MCP server toggle panel
    SessionView.tsx         # Processed output with copy + source toggle
    ImageEditor.tsx         # Template creator/editor with live var detection
    ConfirmDialog.tsx       # Shared confirmation overlay

src-tauri/src/              # Rust backend
  commands.rs               # Tauri command handlers
  storage.rs                # File I/O + seed data (~/.context-container/)
  template.rs               # {{variable}} substitution engine
  models.rs                 # Data structures (Profile, ContextImage, McpServer)
```

### Data Storage

All data persists as JSON files in `~/.context-container/`:

| File | Contents |
|------|----------|
| `profiles.json` | User profiles with metadata and tech stack |
| `mcp_servers.json` | MCP server registry with enabled/disabled state |
| `images/<id>/manifest.json` | Context image metadata (name, tags, variables) |
| `images/<id>/template.md` | Raw markdown template with `{{variable}}` placeholders |

## Seed Templates

| Template | Purpose | Required Variables |
|----------|---------|-------------------|
| Karpathy Protocol | Senior pair programming context | `user.role`, `user.location`, `framework.backend` |
| Research Analyst | Structured research and analysis | `user.role`, `user.expertise` |
| DevOps Commander | Infrastructure and CI/CD | `user.role`, `framework.backend`, `database`, `deployment` |
| Creative Director | Design thinking and copywriting | `user.role`, `user.style` |

## Documentation

Full documentation: [acme-3daf558c.mintlify.app](https://acme-3daf558c.mintlify.app/introduction)

## License

MIT
