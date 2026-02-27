#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './core/logger.js';
import { SessionManager } from './session/index.js';
import { tools } from './tools/tools.js';
import { AppLifecycleHandler } from './tools/handlers/app-lifecycle.js';
import { ElementInteractionHandler } from './tools/handlers/element-interaction.js';
import { MainProcessHandler } from './tools/handlers/main-process.js';
import { VisualTestingHandler } from './tools/handlers/visual-testing.js';
import { isElectronMCPError } from './core/errors.js';
import { CDPAdvancedHandler } from './tools/handlers/cdp-advanced.js';
import { initializeDebugManager, getDebugManager, closeDebugManager } from './core/debug-manager.js';
import { initializeMCPLogging } from './core/mcp-logging.js';
import * as debugTools from './tools/debug-tools.js';

async function main() {
  // Initialize debug manager early if environment variable is set
  if (process.env.ELECTRON_MCP_DEBUG === 'true' || process.env.ELECTRON_MCP_DEBUG === '1') {
    initializeDebugManager();
    logger.info('Debug mode initialized from environment variable');
  }

  const sessionManager = new SessionManager();
  const appLifecycleHandler = new AppLifecycleHandler(sessionManager);
  const elementInteractionHandler = new ElementInteractionHandler(sessionManager);
  const mainProcessHandler = new MainProcessHandler(sessionManager);
  const visualTestingHandler = new VisualTestingHandler(sessionManager);
  const cdpAdvancedHandler = new CDPAdvancedHandler(sessionManager);

  const server = new Server(
    {
      name: 'electron-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        logging: {},
      },
    }
  );

  // Initialize MCP logging integration
  initializeMCPLogging(server, (level, loggerName, data) => {
    // This sends log messages as MCP notifications to clients
    // Implementation depends on how notifications are sent in the SDK version being used
    // For now, we just log it
    if (getDebugManager()?.getConfig().logToMCP) {
      const debugManager = getDebugManager();
      if (debugManager) {
        const { LogLevel } = require('./core/debug-manager.js');
        debugManager.log(LogLevel.INFO, loggerName as any, 'MCP Notification', data);
      }
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing tools');
    return {
      tools,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info({ tool: name, args }, 'Tool called');

    try {
      switch (name) {
        case 'launch_electron_app':
          return { content: [{ type: 'text', text: JSON.stringify(await appLifecycleHandler.launchApp(args as any), null, 2) }] };

        case 'connect_to_electron_cdp':
          return { content: [{ type: 'text', text: JSON.stringify(await appLifecycleHandler.connectToCDP(args as any), null, 2) }] };

        case 'close_session':
          return { content: [{ type: 'text', text: JSON.stringify(await appLifecycleHandler.closeSession(args as any), null, 2) }] };

        case 'list_sessions':
          return { content: [{ type: 'text', text: JSON.stringify(await appLifecycleHandler.listSessions(args as any), null, 2) }] };

        case 'navigate':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.navigate(args as any), null, 2) }] };

        case 'click':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.click(args as any), null, 2) }] };

        case 'fill':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.fill(args as any), null, 2) }] };

        case 'select':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.select(args as any), null, 2) }] };

        case 'get_text':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.getText(args as any), null, 2) }] };

        case 'screenshot':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.screenshot(args as any), null, 2) }] };

        case 'wait_for_selector':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.waitForSelector(args as any), null, 2) }] };

        case 'execute':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.execute(args as any), null, 2) }] };

        case 'get_page_info':
          return { content: [{ type: 'text', text: JSON.stringify(await elementInteractionHandler.getPageInfo(args as any), null, 2) }] };

        case 'execute_main_process_script':
          return { content: [{ type: 'text', text: JSON.stringify(await mainProcessHandler.executeMainProcessScript((args as any).sessionId, (args as any).script), null, 2) }] };

        case 'get_main_window_info':
          return { content: [{ type: 'text', text: JSON.stringify(await mainProcessHandler.getMainWindowInfo((args as any).sessionId), null, 2) }] };

        case 'focus_main_window':
          return { content: [{ type: 'text', text: JSON.stringify(await mainProcessHandler.focusMainWindow((args as any).sessionId), null, 2) }] };

        case 'minimize_main_window':
          return { content: [{ type: 'text', text: JSON.stringify(await mainProcessHandler.minimizeMainWindow((args as any).sessionId), null, 2) }] };

        case 'maximize_main_window':
          return { content: [{ type: 'text', text: JSON.stringify(await mainProcessHandler.maximizeMainWindow((args as any).sessionId), null, 2) }] };

        case 'take_screenshot':
          return { content: [{ type: 'text', text: JSON.stringify(await visualTestingHandler.takeScreenshot((args as any).sessionId, (args as any).path, (args as any).fullPage), null, 2) }] };

        case 'capture_element_screenshot':
          return { content: [{ type: 'text', text: JSON.stringify(await visualTestingHandler.captureElementScreenshot((args as any).sessionId, (args as any).selector, (args as any).path), null, 2) }] };

        case 'compare_screenshots':
          return { content: [{ type: 'text', text: JSON.stringify(await visualTestingHandler.compareScreenshots((args as any).sessionId, (args as any).baselinePath, (args as any).actualPath), null, 2) }] };

        case 'get_viewport_size':
          return { content: [{ type: 'text', text: JSON.stringify(await visualTestingHandler.getViewportSize((args as any).sessionId), null, 2) }] };

        case 'set_viewport_size':
          return { content: [{ type: 'text', text: JSON.stringify(await visualTestingHandler.setViewportSize((args as any).sessionId, (args as any).width, (args as any).height), null, 2) }] };

        case 'get_accessibility_tree':
          return { content: [{ type: 'text', text: JSON.stringify(await visualTestingHandler.getAccessibilityTree((args as any).sessionId), null, 2) }] };

        case 'get_protocol_info':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.getProtocolInfo((args as any).sessionId), null, 2) }] };

        case 'emulate_network_conditions':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.emulateNetworkConditions((args as any).sessionId, args as any), null, 2) }] };

        case 'reset_network_conditions':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.resetNetworkConditions((args as any).sessionId), null, 2) }] };

        case 'set_geolocation':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.setGeolocation((args as any).sessionId, (args as any).latitude, (args as any).longitude, (args as any).accuracy), null, 2) }] };

        case 'clear_geolocation':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.clearGeolocation((args as any).sessionId), null, 2) }] };

        case 'set_device_metrics':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.setDeviceMetrics((args as any).sessionId, (args as any).width, (args as any).height, (args as any).deviceScaleFactor, (args as any).mobile), null, 2) }] };

        case 'get_console_messages':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.getConsoleMessages((args as any).sessionId), null, 2) }] };

        case 'get_performance_metrics':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.getPerformanceMetrics((args as any).sessionId), null, 2) }] };

        case 'clear_browser_cache':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.clearBrowserCache((args as any).sessionId), null, 2) }] };

        case 'get_user_agent':
          return { content: [{ type: 'text', text: JSON.stringify(await cdpAdvancedHandler.getUserAgent((args as any).sessionId), null, 2) }] };

        // Debug tools
        case 'enable_debug':
          return { content: [{ type: 'text', text: JSON.stringify(await debugTools.enableDebug(args as any), null, 2) }] };

        case 'disable_debug':
          return { content: [{ type: 'text', text: JSON.stringify(await debugTools.disableDebug(), null, 2) }] };

        case 'configure_debug':
          return { content: [{ type: 'text', text: JSON.stringify(await debugTools.configureDebug(args as any), null, 2) }] };

        case 'get_debug_status':
          return { content: [{ type: 'text', text: JSON.stringify(await debugTools.getDebugStatus(), null, 2) }] };

        case 'get_logs':
          return { content: [{ type: 'text', text: JSON.stringify(await debugTools.getLogs(args as any), null, 2) }] };

        case 'clear_logs':
          return { content: [{ type: 'text', text: JSON.stringify(await debugTools.clearLogs(), null, 2) }] };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error({ error, tool: name }, 'Tool execution failed');

      if (isElectronMCPError(error)) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                  },
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: {
                  code: 'INTERNAL_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Electron MCP Server started');

  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    closeDebugManager();
    await sessionManager.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    closeDebugManager();
    await sessionManager.cleanup();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
