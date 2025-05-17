# stylelint-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for Stylelint that enables AI models to interact with Stylelint directly.

## Installation

```shell
npm -D install stylelint-mcp
```

Note: You must have stylelint installed either globally or locally in your project.

## Usage

The server is started automatically by your editor’s MCP client, but you can run it manually for testing:

```shell
npx stylelint-mcp-server
```

## Editor setup examples

### VS Code

Add `.vscode/mcp.json`:

```json
{
  "servers": {
    "Stylelint": {
      "type": "stdio",
      "command": "npx",
      "args": ["stylelint-mcp-server@latest"]
    }
  }
}
```

### Cursor

Add `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stylelint": {
      "command": "npx",
      "args": ["stylelint-mcp-server@latest"],
      "env": {}
    }
  }
}
```

## Example prompts

```text
Run Stylelint on the current file and explain the warnings

Lint #file:index.css and fix
```

## License

[MIT](./LICENSE)
