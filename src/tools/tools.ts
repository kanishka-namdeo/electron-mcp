import { z } from 'zod';
import {
  LaunchElectronAppSchema,
  ConnectToElectronCDPSchema,
  CloseSessionSchema,
  ListSessionsSchema,
  NavigateSchema,
  ClickSchema,
  FillSchema,
  SelectSchema,
  GetTextSchema,
  ScreenshotSchema,
  WaitForSelectorSchema,
  ExecuteSchema,
  GetPageInfoSchema,
  ExecuteMainProcessScriptSchema,
  GetMainWindowInfoSchema,
  FocusMainWindowSchema,
  MinimizeMainWindowSchema,
  MaximizeMainWindowSchema,
  TakeScreenshotSchema,
  CaptureElementScreenshotSchema,
  CompareScreenshotsSchema,
  GetViewportSizeSchema,
  SetViewportSizeSchema,
  GetAccessibilityTreeSchema,
} from './validation.js';
import {
  GetProtocolInfoSchema,
  EmulateNetworkConditionsSchema,
  ResetNetworkConditionsSchema,
  SetGeolocationSchema,
  ClearGeolocationSchema,
  SetDeviceMetricsSchema,
  GetConsoleMessagesSchema,
  GetPerformanceMetricsSchema,
  ClearBrowserCacheSchema,
  GetUserAgentSchema,
  GetNavigationHistorySchema,
  RestoreNavigationHistorySchema,
  GetAccessibilitySnapshotSchema,
  FindAccessibleNodeSchema,
  InteractAccessibleNodeSchema,
  StartRecordingSchema,
  StopRecordingSchema,
  ExportRecordingSchema,
} from './validation-enhanced.js';
import {
  EnableDebugSchema,
  ConfigureDebugSchema,
  GetLogsSchema,
} from './debug-tools.js';

function getDefaultValue(zodDef: z.ZodDefault<any>): unknown {
  const def = zodDef._def;
  if (typeof def.defaultValue === 'function') {
    return def.defaultValue();
  }
  if ('defaultValue' in def) {
    return def.defaultValue;
  }
  return undefined;
}

function describeZodType(zodValue: z.ZodTypeAny): Record<string, unknown> | undefined {
  if (zodValue instanceof z.ZodDefault) {
    return describeZodType(zodValue._def.innerType as z.ZodTypeAny);
  }
  if (zodValue instanceof z.ZodOptional) {
    return describeZodType(zodValue._def.innerType as z.ZodTypeAny);
  }
  if (zodValue instanceof z.ZodString) {
    return { type: 'string' };
  }
  if (zodValue instanceof z.ZodNumber) {
    return { type: 'number' };
  }
  if (zodValue instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }
  if (zodValue instanceof z.ZodEnum) {
    return { type: 'string', enum: zodValue.options as string[] };
  }
  if (zodValue instanceof z.ZodArray) {
    return { type: 'array', items: { type: 'string' } };
  }
  return undefined;
}

function zodToJsonSchema(schema: z.ZodTypeAny): object {
  const toJSONSchema = (z as unknown as { toJSONSchema?: (schema: z.ZodTypeAny, options?: Record<string, unknown>) => object }).toJSONSchema;

  if (typeof toJSONSchema === 'function') {
    const converted = toJSONSchema(schema, {
      target: 'openapi-3.0',
      unrepresentable: 'any',
      io: 'input',
    }) as Record<string, unknown>;
    // Ensure required is always an array for object schemas
    if (converted.type === 'object' && !Array.isArray(converted.required)) {
      converted.required = [];
    }
    return converted;
  }

  // Fallback: basic object schema with no additional metadata
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodTypeAny;
      let inner: z.ZodTypeAny = zodValue;
      let defaultVal: unknown;

      if (inner instanceof z.ZodOptional) {
        inner = inner._def.innerType as z.ZodTypeAny;
      }
      if (inner instanceof z.ZodDefault) {
        defaultVal = getDefaultValue(inner);
        inner = inner._def.innerType as z.ZodTypeAny;
      }

      const desc = describeZodType(inner as z.ZodTypeAny);
      if (!desc) continue;

      const prop: Record<string, unknown> = { ...desc };
      if (defaultVal !== undefined) {
        prop.default = defaultVal;
      }
      properties[key] = prop;

      if (!zodValue.isOptional()) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }

  return {};
}

export const tools = [
  {
    name: 'launch_electron_app',
    description: 'Launch an Electron application for testing',
    inputSchema: zodToJsonSchema(LaunchElectronAppSchema),
  },
  {
    name: 'connect_to_electron_cdp',
    description: 'Connect to a running Electron application via Chrome DevTools Protocol',
    inputSchema: zodToJsonSchema(ConnectToElectronCDPSchema),
  },
  {
    name: 'close_session',
    description: 'Close an Electron testing session and release resources',
    inputSchema: zodToJsonSchema(CloseSessionSchema),
  },
  {
    name: 'list_sessions',
    description: 'List all active Electron testing sessions',
    inputSchema: zodToJsonSchema(ListSessionsSchema),
  },
  {
    name: 'navigate',
    description: 'Navigate to a URL in the Electron app',
    inputSchema: zodToJsonSchema(NavigateSchema),
  },
  {
    name: 'click',
    description: 'Click on an element in the Electron app',
    inputSchema: zodToJsonSchema(ClickSchema),
  },
  {
    name: 'fill',
    description: 'Fill an input field with text',
    inputSchema: zodToJsonSchema(FillSchema),
  },
  {
    name: 'select',
    description: 'Select an option from a dropdown',
    inputSchema: zodToJsonSchema(SelectSchema),
  },
  {
    name: 'get_text',
    description: 'Get the text content of an element',
    inputSchema: zodToJsonSchema(GetTextSchema),
  },
  {
    name: 'screenshot',
    description: 'Take a screenshot of current page or an element',
    inputSchema: zodToJsonSchema(ScreenshotSchema),
  },
  {
    name: 'wait_for_selector',
    description: 'Wait for an element to appear on the page',
    inputSchema: zodToJsonSchema(WaitForSelectorSchema),
  },
  {
    name: 'execute',
    description: 'Execute JavaScript in the Electron app context',
    inputSchema: zodToJsonSchema(ExecuteSchema),
  },
  {
    name: 'get_page_info',
    description: 'Get information about the current page (URL, title, etc.)',
    inputSchema: zodToJsonSchema(GetPageInfoSchema),
  },
  {
    name: 'execute_main_process_script',
    description: 'Execute JavaScript in the Electron main process context',
    inputSchema: zodToJsonSchema(ExecuteMainProcessScriptSchema),
  },
  {
    name: 'get_main_window_info',
    description: 'Get information about the Electron main window',
    inputSchema: zodToJsonSchema(GetMainWindowInfoSchema),
  },
  {
    name: 'focus_main_window',
    description: 'Focus Electron main window',
    inputSchema: zodToJsonSchema(FocusMainWindowSchema),
  },
  {
    name: 'minimize_main_window',
    description: 'Minimize Electron main window',
    inputSchema: zodToJsonSchema(MinimizeMainWindowSchema),
  },
  {
    name: 'maximize_main_window',
    description: 'Maximize Electron main window',
    inputSchema: zodToJsonSchema(MaximizeMainWindowSchema),
  },
  {
    name: 'take_screenshot',
    description: 'Take a screenshot of current page',
    inputSchema: zodToJsonSchema(TakeScreenshotSchema),
  },
  {
    name: 'capture_element_screenshot',
    description: 'Take a screenshot of a specific element',
    inputSchema: zodToJsonSchema(CaptureElementScreenshotSchema),
  },
  {
    name: 'compare_screenshots',
    description: 'Compare a screenshot with a baseline image',
    inputSchema: zodToJsonSchema(CompareScreenshotsSchema),
  },
  {
    name: 'get_viewport_size',
    description: 'Get current viewport size',
    inputSchema: zodToJsonSchema(GetViewportSizeSchema),
  },
  {
    name: 'set_viewport_size',
    description: 'Set the viewport size',
    inputSchema: zodToJsonSchema(SetViewportSizeSchema),
  },
  {
    name: 'get_accessibility_tree',
    description: 'Get accessibility tree of current page',
    inputSchema: zodToJsonSchema(GetAccessibilityTreeSchema),
  },
  {
    name: 'get_accessibility_snapshot',
    description: 'Get Playwright accessibility snapshot for the current page',
    inputSchema: zodToJsonSchema(GetAccessibilitySnapshotSchema),
  },
  {
    name: 'find_accessible_node',
    description: 'Find accessible nodes by role and/or name using the accessibility tree',
    inputSchema: zodToJsonSchema(FindAccessibleNodeSchema),
  },
  {
    name: 'interact_accessible_node',
    description: 'Interact with an accessible node by role and name (click or fill)',
    inputSchema: zodToJsonSchema(InteractAccessibleNodeSchema),
  },
  {
    name: 'start_recording',
    description: 'Start recording user interactions for the given session',
    inputSchema: zodToJsonSchema(StartRecordingSchema),
  },
  {
    name: 'stop_recording',
    description: 'Stop recording interactions and return the recorded steps',
    inputSchema: zodToJsonSchema(StopRecordingSchema),
  },
  {
    name: 'export_recording_as_test',
    description: 'Export recorded steps as a Playwright test file snippet',
    inputSchema: zodToJsonSchema(ExportRecordingSchema),
  },
  {
    name: 'get_protocol_info',
    description: 'Get CDP protocol information including browser version and capabilities',
    inputSchema: zodToJsonSchema(GetProtocolInfoSchema),
  },
  {
    name: 'emulate_network_conditions',
    description: 'Emulate network conditions (offline, slow network, latency)',
    inputSchema: zodToJsonSchema(EmulateNetworkConditionsSchema),
  },
  {
    name: 'reset_network_conditions',
    description: 'Reset network conditions to default',
    inputSchema: zodToJsonSchema(ResetNetworkConditionsSchema),
  },
  {
    name: 'set_geolocation',
    description: 'Set or override geolocation for the page',
    inputSchema: zodToJsonSchema(SetGeolocationSchema),
  },
  {
    name: 'clear_geolocation',
    description: 'Clear geolocation override',
    inputSchema: zodToJsonSchema(ClearGeolocationSchema),
  },
  {
    name: 'set_device_metrics',
    description: 'Emulate device metrics (viewport size, device scale factor, mobile)',
    inputSchema: zodToJsonSchema(SetDeviceMetricsSchema),
  },
  {
    name: 'get_console_messages',
    description: 'Capture console messages from the page',
    inputSchema: zodToJsonSchema(GetConsoleMessagesSchema),
  },
  {
    name: 'get_performance_metrics',
    description: 'Get performance metrics from the page',
    inputSchema: zodToJsonSchema(GetPerformanceMetricsSchema),
  },
  {
    name: 'clear_browser_cache',
    description: 'Clear browser cache and cookies',
    inputSchema: zodToJsonSchema(ClearBrowserCacheSchema),
  },
  {
    name: 'get_navigation_history',
    description: 'Get navigation history entries for the current page using CDP Page.getNavigationHistory',
    inputSchema: zodToJsonSchema(GetNavigationHistorySchema),
  },
  {
    name: 'restore_navigation_history',
    description: 'Restore a specific navigation history entry using CDP Page.navigateToHistoryEntry',
    inputSchema: zodToJsonSchema(RestoreNavigationHistorySchema),
  },
  {
    name: 'get_user_agent',
    description: 'Get current user agent string',
    inputSchema: zodToJsonSchema(GetUserAgentSchema),
  },
  {
    name: 'enable_debug',
    description: 'Enable debug mode with granular logging for the MCP server. Logs are stored in .electron-mcp/logs directory within the project.',
    inputSchema: zodToJsonSchema(EnableDebugSchema),
  },
  {
    name: 'disable_debug',
    description: 'Disable debug mode and stop logging.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'configure_debug',
    description: 'Configure debug settings including log levels and categories.',
    inputSchema: zodToJsonSchema(ConfigureDebugSchema),
  },
  {
    name: 'get_debug_status',
    description: 'Get current debug mode status and configuration.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_logs',
    description: 'Retrieve and filter log entries from the project log directory.',
    inputSchema: zodToJsonSchema(GetLogsSchema),
  },
  {
    name: 'clear_logs',
    description: 'Clear all log files from the project log directory.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
] as const;
