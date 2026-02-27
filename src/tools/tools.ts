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
} from './validation-enhanced.js';

function getDefaultValue(zodDef: z.ZodDefault<any>): any {
  const def = zodDef._def;
  if ('defaultValue' in def && typeof def.defaultValue === 'function') {
    return def.defaultValue();
  }
  if ('defaultValue' in def) {
    return def.defaultValue;
  }
  return undefined;
}

function zodToJsonSchema(schema: z.ZodTypeAny): object {
  const shape = schema instanceof z.ZodObject ? schema.shape : undefined;
  const properties: Record<string, any> = {};
  const required: string[] = [];

  if (shape) {
    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodTypeAny;
      
      if (zodValue instanceof z.ZodString) {
        properties[key] = { type: 'string' };
        if (!zodValue.isOptional()) required.push(key);
      } else if (zodValue instanceof z.ZodNumber) {
        properties[key] = { type: 'number' };
        if (!zodValue.isOptional()) required.push(key);
      } else if (zodValue instanceof z.ZodBoolean) {
        properties[key] = { type: 'boolean' };
        if (!zodValue.isOptional()) required.push(key);
      } else if (zodValue instanceof z.ZodArray) {
        properties[key] = { type: 'array', items: { type: 'string' } };
        if (!zodValue.isOptional()) required.push(key);
      } else if (zodValue instanceof z.ZodDefault) {
        const innerSchema = zodValue._def.innerType;
        const defaultValue = getDefaultValue(zodValue);
        
        if (innerSchema instanceof z.ZodString) {
          properties[key] = { type: 'string', default: defaultValue };
        } else if (innerSchema instanceof z.ZodNumber) {
          properties[key] = { type: 'number', default: defaultValue };
        } else if (innerSchema instanceof z.ZodBoolean) {
          properties[key] = { type: 'boolean', default: defaultValue };
        } else if (innerSchema instanceof z.ZodArray) {
          properties[key] = { type: 'array', items: { type: 'string' }, default: defaultValue };
        } else {
          properties[key] = { type: 'string', default: defaultValue };
        }
      } else if (zodValue instanceof z.ZodEnum) {
        properties[key] = { type: 'string', enum: zodValue.options };
        if (!zodValue.isOptional()) required.push(key);
      } else if (zodValue instanceof z.ZodOptional) {
        const innerSchema = zodValue.unwrap();
        if (innerSchema instanceof z.ZodString) {
          properties[key] = { type: 'string' };
        } else if (innerSchema instanceof z.ZodNumber) {
          properties[key] = { type: 'number' };
        } else if (innerSchema instanceof z.ZodBoolean) {
          properties[key] = { type: 'boolean' };
        } else if (innerSchema instanceof z.ZodEnum) {
          properties[key] = { type: 'string', enum: innerSchema.options };
        } else if (innerSchema instanceof z.ZodArray) {
          properties[key] = { type: 'array', items: { type: 'string' } };
        }
      }
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  };
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
    name: 'get_user_agent',
    description: 'Get current user agent string',
    inputSchema: zodToJsonSchema(GetUserAgentSchema),
  },
] as const;
