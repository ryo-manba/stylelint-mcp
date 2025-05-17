import childProcess from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import type { ChildProcess } from "node:child_process";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const forkedProcesses = new Set<ChildProcess>();
const EXECUTABLE_PATH = path.resolve(dirname, "../dist/mcp-cli.js");

/**
 * Forks the process to run an instance of Stylelint MCP.
 * @param {object} options - Options for child_process.fork
 * @returns {ChildProcess} The resulting child process
 */
function runServer(options = {}): ChildProcess {
  const newProcess = childProcess.fork(
    EXECUTABLE_PATH,
    [],
    Object.assign(
      {
        silent: true,
      },
      options
    )
  );

  forkedProcesses.add(newProcess);
  return newProcess;
}

describe("MCP CLI", () => {
  it("should start the MCP server", () => {
    return new Promise<void>((resolve) => {
      const child = runServer();

      // should not have anything on std out
      child.stdout?.on("data", (data) => {
        expect.fail(`Unexpected stdout data: ${data}`);
      });

      child.stderr?.on("data", (data) => {
        expect(data.toString()).toMatch(/Stylelint MCP server is running/);
        resolve();
      });
    });
  });

  afterEach(() => {
    // Clean up all the processes after every test.
    forkedProcesses.forEach((child: ChildProcess) => child.kill());
    forkedProcesses.clear();
  });
});
