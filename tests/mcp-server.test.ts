import { mcpServer } from "../src/mcp-server.js";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeEach, assert } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const validFilePath = path.join(dirname, "fixtures", "valid.css");
const invalidFilePath = path.join(dirname, "fixtures", "invalid.css");
const syntaxErrorFilePath = path.join(dirname, "fixtures", "syntax-error.css");

const filePathsJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  additionalProperties: false,
  properties: {
    filePaths: {
      items: {
        type: "string",
        minLength: 1,
      },
      minItems: 1,
      type: "array",
    },
  },
  required: ["filePaths"],
  type: "object",
};

describe("MCP Server", () => {
  let client, clientTransport, serverTransport;

  beforeEach(async () => {
    client = new Client({
      name: "test client",
      version: "1.0",
    });

    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Note: must connect server first or else client hangs
    await mcpServer.connect(serverTransport);
    await client.connect(clientTransport);
  });

  describe("Tools", () => {
    it.skip("should list tools", async () => {
      const { tools } = await client.listTools();

      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe("lint-files");
      expect(tools[0].inputSchema).toEqual(filePathsJsonSchema);
    });

    describe("lint-files", () => {
      it("should return zero lint messages for a valid CSS file", async () => {
        const { content: rawResults } = await client.callTool({
          name: "lint-files",
          arguments: {
            filePaths: [validFilePath],
          },
        });

        const results = rawResults
          .slice(1, rawResults.length - 1)
          .map(({ type, text }) => ({
            type,
            text: JSON.parse(text),
          }));

        expect(results.length).toBe(1);
        expect(results[0].type).toBe("text");
        expect(results[0].text.source).toBe(validFilePath);
        expect(results[0].text.warnings.length).toBe(0);
      });

      it("should return errors for a CSS file with syntax errors", async () => {
        const { content: rawResults } = await client.callTool({
          name: "lint-files",
          arguments: {
            filePaths: [invalidFilePath],
          },
        });

        const results = rawResults
          .slice(1, rawResults.length - 1)
          .map(({ type, text }) => ({
            type,
            text: JSON.parse(text),
          }));

        expect(results.length).toBe(1);
        expect(results[0].type).toBe("text");
        expect(results[0].text.source).toBe(invalidFilePath);
        expect(Array.isArray(results[0].text.warnings)).toBe(true);
        expect(results[0].text.warnings.length).toBeGreaterThan(0);
        expect(results[0].text.warnings).toEqual([
          {
            column: 3,
            endColumn: 2,
            endLine: 8,
            line: 7,
            rule: "block-no-empty",
            severity: "error",
            text: "Unexpected empty block (block-no-empty)",
          },
          {
            column: 9,
            endColumn: 11,
            endLine: 3,
            line: 3,
            rule: "length-zero-no-unit",
            severity: "error",
            text: "Unexpected unit (length-zero-no-unit)",
          },
        ]);
      });

      it("should handle multiple files, including valid and invalid CSS", async () => {
        const { content: rawResults } = await client.callTool({
          name: "lint-files",
          arguments: {
            filePaths: [validFilePath, invalidFilePath],
          },
        });

        const results = rawResults
          .slice(1, rawResults.length - 1)
          .map(({ type, text }) => ({
            type,
            text: JSON.parse(text),
          }));

        expect(results.length).toBe(2);

        expect(results[0].text.source).toBe(validFilePath);
        expect(results[0].text.warnings.length).toBe(0);

        expect(results[1].text.source).toBe(invalidFilePath);
        expect(results[1].text.warnings.length).toBeGreaterThan(0);
      });

      it("should handle error when invalid file paths are provided", async () => {
        const nonExistentFilePath = path.join(
          dirname,
          "fixtures",
          "non-existent.css"
        );
        const { content: rawResults } = await client.callTool({
          name: "lint-files",
          arguments: {
            filePaths: [nonExistentFilePath],
          },
        });

        const results = rawResults
          .slice(1, rawResults.length - 1)
          .map(({ type, text }) => ({
            type,
            text: JSON.parse(text),
          }));

        expect(rawResults.length).toBe(1);
        expect(rawResults[0].type).toBe("text");
        expect(rawResults[0].text).toContain("Error running Stylelint");
      });
    });

    it("should handle syntax errors", async () => {
      const { content: rawResults } = await client.callTool({
        name: "lint-files",
        arguments: {
          filePaths: [syntaxErrorFilePath],
        },
      });

      const results = rawResults
        .slice(1, rawResults.length - 1)
        .map(({ type, text }) => ({
          type,
          text: JSON.parse(text),
        }));

      expect(results[0].type).toBe("text");
      expect(results[0].text.warnings.length).toBe(1);
      expect(results[0].text.warnings).toEqual([
        {
          column: 3,
          endColumn: 4,
          endLine: 1,
          line: 1,
          rule: "CssSyntaxError",
          severity: "error",
          text: "Unexpected } (CssSyntaxError)",
        },
      ]);
    });
  });
});
