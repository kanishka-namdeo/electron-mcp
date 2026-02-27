import { z } from 'zod';

export const GetProtocolInfoSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const EmulateNetworkConditionsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  offline: z.boolean().optional().default(false),
  downloadThroughput: z.number().min(0).optional(),
  uploadThroughput: z.number().min(0).optional(),
  latency: z.number().min(0).optional(),
});

export const ResetNetworkConditionsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const SetGeolocationSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(100).optional(),
});

export const ClearGeolocationSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const SetDeviceMetricsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  deviceScaleFactor: z.number().min(0.1).max(10).optional().default(1),
  mobile: z.boolean().optional().default(false),
});

export const GetConsoleMessagesSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const GetPerformanceMetricsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const ClearBrowserCacheSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const GetUserAgentSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const ConnectToCDPEnhancedSchema = z.object({
  port: z.number().int().positive(),
  host: z.string().default('localhost'),
  timeout: z.number().int().positive().optional(),
  retries: z.number().int().min(0).max(10).optional(),
  retryDelay: z.number().int().min(100).optional(),
});

export type GetProtocolInfoInput = z.infer<typeof GetProtocolInfoSchema>;
export type EmulateNetworkConditionsInput = z.infer<typeof EmulateNetworkConditionsSchema>;
export type ResetNetworkConditionsInput = z.infer<typeof ResetNetworkConditionsSchema>;
export type SetGeolocationInput = z.infer<typeof SetGeolocationSchema>;
export type ClearGeolocationInput = z.infer<typeof ClearGeolocationSchema>;
export type SetDeviceMetricsInput = z.infer<typeof SetDeviceMetricsSchema>;
export type GetConsoleMessagesInput = z.infer<typeof GetConsoleMessagesSchema>;
export type GetPerformanceMetricsInput = z.infer<typeof GetPerformanceMetricsSchema>;
export type ClearBrowserCacheInput = z.infer<typeof ClearBrowserCacheSchema>;
export type GetUserAgentInput = z.infer<typeof GetUserAgentSchema>;
export type ConnectToCDPEnhancedInput = z.infer<typeof ConnectToCDPEnhancedSchema>;
