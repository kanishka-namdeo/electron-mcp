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

export const GetNavigationHistorySchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const RestoreNavigationHistorySchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  index: z.number().int().min(0).optional(),
});

export const StartRecordingSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const StopRecordingSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const ExportRecordingSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  testName: z.string().min(1).optional(),
});

export const GetAccessibilitySnapshotSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  includeHidden: z.boolean().optional().default(false),
});

export const FindAccessibleNodeSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  role: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  exact: z.boolean().optional().default(true),
  limit: z.number().int().positive().max(10).optional().default(1),
}).refine(
  (value) => Boolean(value.role || value.name),
  {
    message: 'At least one of role or name must be provided',
  }
);

export const InteractAccessibleNodeSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  role: z.string().min(1, 'Role is required'),
  name: z.string().min(1, 'Name is required'),
  action: z.enum(['click', 'fill']),
  value: z.string().optional(),
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
export type GetNavigationHistoryInput = z.infer<typeof GetNavigationHistorySchema>;
export type RestoreNavigationHistoryInput = z.infer<typeof RestoreNavigationHistorySchema>;
export type GetAccessibilitySnapshotInput = z.infer<typeof GetAccessibilitySnapshotSchema>;
export type FindAccessibleNodeInput = z.infer<typeof FindAccessibleNodeSchema>;
export type InteractAccessibleNodeInput = z.infer<typeof InteractAccessibleNodeSchema>;
export type StartRecordingInput = z.infer<typeof StartRecordingSchema>;
export type StopRecordingInput = z.infer<typeof StopRecordingSchema>;
export type ExportRecordingInput = z.infer<typeof ExportRecordingSchema>;
