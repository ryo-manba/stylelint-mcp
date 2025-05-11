import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import pkg from "../package.json" with { type: "json" };
import stylelint from "stylelint";
import { z } from "zod";

export const mcpServer = new McpServer({
  name: "stylelint-mcp",
  version: pkg.version,
});

// Important: Cursor throws an error when `describe()` is used in the schema.
const filePathsSchema = {
  filePaths: z.array(z.string().min(1)).nonempty(),
};

// Add the lint-files tool
mcpServer.tool(
  "lint-files",
  "Lint files using Stylelint. You must provide a list of absolute file paths to the CSS files you want to lint. The absolute file paths should be in the correct format for your operating system.",
  filePathsSchema,
  async ({ filePaths }) => {
    try {
      const lintResult = await stylelint.lint({
        files: filePaths,
        formatter: "json",
      });

      const content = lintResult.results.map((result) => ({
        type: "text" as const,
        text: JSON.stringify(result),
      }));

      content.unshift({
        type: "text" as const,
        text: "Here are the results of running Stylelint on the provided files:",
      });

      content.push({
        type: "text" as const,
        text: "Do not automatically fix these issues. You must ask the user for confirmation before attempting to fix the issues found.",
      });

      return {
        content,
      };
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error running Stylelint: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);
