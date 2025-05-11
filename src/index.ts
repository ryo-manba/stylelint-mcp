import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mcpServer } from "./mcp-server.js";

mcpServer
  .connect(new StdioServerTransport())
  .then(() => {
    // NOTE: Use console.error for logging since stdout is part of the server transport
    console.error("Stylelint MCP server is running. cwd:", process.cwd());

    process.on("SIGINT", () => {
      mcpServer.close();
      process.exitCode = 0;
    });
  })
  .catch((error) => {
    console.error("Failed to start MCP server:", error);
    process.exitCode = 1;
  });
