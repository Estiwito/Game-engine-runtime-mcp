# Game-engine-runtime-mcp 🚀
MCP server connecting Claude AI with Unity and Godot for automated testing, debugging, and code validation.

A production-grade Model Context Protocol (MCP) server that connects Anthropic's **Claude AI** directly with game engine runtimes (Unity & Godot). It enables automated testing, real-time error log filtering, scene hierarchy inspection, and safe file writing inside an isolated sandbox environment.

---

## 🌟 Key Features

* **Scene Hierarchy Inspection:** Parse Unity (`.unity`) and Godot (`.tscn`) scenes to give Claude complete awareness of active nodes, GameObjects, and attached components.
* **Headless Test Runner:** Execute game engine unit/integration tests directly without opening the GUI, avoiding command timeouts via asynchronous process handling.
* **Token-Optimized Log Filtering:** Extracts only stacktraces, null-pointer exceptions, and compilation errors from engine logs to prevent blowing past context limits.
* **Strict Security Sandboxing:** Protects host filesystems by restricting file read/write operations strictly to permitted game project folders.

---

## 🛠️ Included Tools

1. `inspeccionar_jerarquia_escena`: Returns a structured overview of GameObjects or Nodes inside a scene file.
2. `ejecutar_suite_pruebas_motor`: Triggers Unity or Godot in `EditMode`/`PlayMode` headless testing modes.
3. `escribir_codigo_seguro`: Safely writes/updates scripts inside the authorized project sandbox.
4. `analizar_fugas_memoria_y_logs`: Synthesizes runtime logs to extract exceptions and performance metrics.

---

## ⚙️ Configuration for Claude Desktop

Add this block to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "game-engine-runtime": {
      "command": "npx",
      "args": [
        "-y",
        "game-engine-runtime-mcp"
      ],
      "env": {
        "ALLOWED_PROJECT_PATHS": "C:/Users/YourUser/Projects/MyGame"
      }
    }
  }
}
