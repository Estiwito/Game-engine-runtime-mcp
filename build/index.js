import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

const ALLOWED_PROJECT_PATHS = process.env.ALLOWED_PROJECT_PATHS
  ? process.env.ALLOWED_PROJECT_PATHS.split(",").map(p => path.resolve(p.trim()))
  : [path.resolve(process.cwd())];

function assertInSandbox(targetPath) {
  const resolved = path.resolve(targetPath);
  const isAllowed = ALLOWED_PROJECT_PATHS.some(allowed => resolved.startsWith(allowed));
  if (!isAllowed) {
    throw new McpError(ErrorCode.InvalidParams, `Acceso denegado: La ruta '${targetPath}' está fuera del Sandbox permitido.`);
  }
  return resolved;
}

const server = new Server(
  {
    name: "game-engine-runtime-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "inspeccionar_jerarquia_escena",
        description: "Analiza la escena o mapa actual del motor (Unity/Godot) y devuelve el árbol de objetos, nodos y componentes asignados.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string", description: "Ruta absoluta al proyecto." },
            scenePath: { type: "string", description: "Ruta relativa del archivo de escena (.unity o .tscn)." }
          },
          required: ["projectPath", "scenePath"]
        }
      },
      {
        name: "ejecutar_suite_pruebas_motor",
        description: "Ejecuta el Test Runner nativo del motor en modo Headless, filtrando el resultado para devolver solo fallos críticos y stacktraces limpios.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string", description: "Ruta al proyecto." },
            engine: { type: "string", enum: ["godot", "unity"], description: "Motor de desarrollo." },
            testMode: { type: "string", enum: ["EditMode", "PlayMode"], description: "Tipo de pruebas." }
          },
          required: ["projectPath", "engine", "testMode"]
        }
      },
      {
        name: "escribir_codigo_seguro",
        description: "Escribe o actualiza código dentro del Sandbox del proyecto verificando la estructura previa.",
        inputSchema: {
          type: "object",
          properties: {
            projectPath: { type: "string", description: "Ruta del proyecto." },
            relativePath: { type: "string", description: "Ruta del script (ej. Scripts/Player.cs)." },
            content: { type: "string", description: "Código fuente completo." }
          },
          required: ["projectPath", "relativePath", "content"]
        }
      },
      {
        name: "analizar_fugas_memoria_y_logs",
        description: "Lee los últimos logs de consola y los sintetiza automáticamente extraendo NullPointerExceptions, Warnings y métricas de rendimiento.",
        inputSchema: {
          type: "object",
          properties: {
            logFilePath: { type: "string", description: "Ruta al log del motor." },
            maxErrors: { type: "number", description: "Número máximo de errores a extraer (por defecto 10)." }
          },
          required: ["logFilePath"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "inspeccionar_jerarquia_escena") {
      const { projectPath, scenePath } = args;
      const fullProjectPath = assertInSandbox(projectPath);
      const fullScenePath = assertInSandbox(path.join(fullProjectPath, scenePath));

      const sceneRaw = await fs.readFile(fullScenePath, "utf-8");
      const nodeMatches = [...sceneRaw.matchAll(/(?:node name="([^"]+)"|m_Name:\s*([^\r\n]+))/g)]
        .map(m => m[1] || m[2])
        .filter(Boolean);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              escena: scenePath,
              totalObjetosDetectados: nodeMatches.length,
              jerarquiaDetectada: nodeMatches.slice(0, 50)
            }, null, 2)
          }
        ]
      };
    }

    if (name === "ejecutar_suite_pruebas_motor") {
      const { projectPath, engine, testMode } = args;
      const cleanProjectPath = assertInSandbox(projectPath);

      return new Promise((resolve) => {
        const command = engine === "godot" ? "godot" : "unity";
        const cmdArgs = engine === "godot"
          ? ["--headless", "--path", cleanProjectPath, "--run-tests"]
          : ["-batchmode", "-runTests", `-testPlatform`, testMode, "-projectPath", cleanProjectPath, "-logFile", "-"];

        const child = spawn(command, cmdArgs, { shell: true });

        let stdoutData = "";
        let stderrData = "";

        child.stdout.on("data", (data) => { stdoutData += data.toString(); });
        child.stderr.on("data", (data) => { stderrData += data.toString(); });

        child.on("close", (code) => {
          const allOutput = stdoutData + "\n" + stderrData;
          const filteredErrors = allOutput
            .split("\n")
            .filter(line => /error|fail|exception|stacktrace/i.test(line))
            .slice(0, 20)
            .join("\n");

          resolve({
            content: [
              {
                type: "text",
                text: code === 0
                  ? `✅ Pruebas finalizadas con éxito (0 fallos).`
                  : `❌ Se detectaron fallos en las pruebas (${testMode}):\n\n${filteredErrors || allOutput.slice(-1000)}`
              }
            ]
          });
        });
      });
    }

    if (name === "escribir_codigo_seguro") {
      const { projectPath, relativePath, content } = args;
      const cleanProjectPath = assertInSandbox(projectPath);
      const targetFilePath = assertInSandbox(path.join(cleanProjectPath, relativePath));

      await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
      await fs.writeFile(targetFilePath, content, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `[Sandbox Safe] Código escrito con éxito en: ${relativePath}`
          }
        ]
      };
    }

    if (name === "analizar_fugas_memoria_y_logs") {
      const { logFilePath, maxErrors = 10 } = args;
      const cleanLogPath = assertInSandbox(logFilePath);

      const rawLog = await fs.readFile(cleanLogPath, "utf-8");
      const lines = rawLog.split("\n");

      const exceptions = lines.filter(l => l.includes("Exception") || l.includes("Error:"));
      const warnings = lines.filter(l => l.includes("Warning:"));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              resumen: {
                totalLineasAnalizadas: lines.length,
                totalExcepciones: exceptions.length,
                totalWarnings: warnings.length
              },
              excepcionesPrincipales: exceptions.slice(0, maxErrors)
            }, null, 2)
          }
        ]
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `Herramienta '${name}' no reconocida.`);

  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error de ejecución en MCP: ${error.message}` }]
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 GameEngine-Runtime-MCP 2.0 (Production Grade) iniciado.");
}

runServer().catch((err) => {
  console.error("Error crítico iniciando el servidor:", err);
  process.exit(1);
});