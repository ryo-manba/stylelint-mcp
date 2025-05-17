import { mcpServer } from "./mcp-server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Disconnects the server and sets exit code to 0.
 * @returns {void}
 */
function disconnect() {
  mcpServer.close();
  process.exitCode = 0;
}

await mcpServer.connect(new StdioServerTransport());

// Note: do not use console.log() because stdout is part of the server transport
// eslint-disable-next-line no-console -- Needed to output information
console.error(`Stylelint MCP server is running. cwd: ${process.cwd()}`);

process.on("SIGINT", disconnect);
process.on("SIGTERM", disconnect);
