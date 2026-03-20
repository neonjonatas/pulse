import { receiveSearchResultTool } from '@tools'
import { transformResultTool } from '@tools'

/**
 * Emily exposes her tools through the Mastra agent server (mastra dev / mastra start).
 * Chester connects as an MCP client to Emily's Mastra server URL.
 *
 * This module re-exports the tools that should be accessible to external clients.
 */
export const emilyExposedTools = {
  receiveSearchResultTool,
  transformResultTool
}
