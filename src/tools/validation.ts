import { z } from 'zod';

export const LaunchElectronAppSchema = z.object({
  executablePath: z.string().min(1, 'Executable path is required'),
  args: z.array(z.string()).optional(),
  headless: z.boolean().optional(),
  slowMo: z.number().min(0).optional(),
});

export const ConnectToElectronCDPSchema = z.object({
  port: z.number().int().positive(),
  host: z.string().default('localhost'),
  timeout: z.number().int().positive().optional(),
});

export const CloseSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const ListSessionsSchema = z.object({});

export const NavigateSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  url: z.string().url('Invalid URL'),
  timeout: z.number().int().positive().optional(),
});

export const ClickSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  selector: z.string().min(1, 'Selector is required'),
  timeout: z.number().int().positive().optional(),
});

export const FillSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  selector: z.string().min(1, 'Selector is required'),
  value: z.string(),
  timeout: z.number().int().positive().optional(),
});

export const SelectSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  selector: z.string().min(1, 'Selector is required'),
  value: z.string(),
  timeout: z.number().int().positive().optional(),
});

export const GetTextSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  selector: z.string().min(1, 'Selector is required'),
  timeout: z.number().int().positive().optional(),
});

export const ScreenshotSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  path: z.string().optional(),
  fullPage: z.boolean().optional(),
});

export const WaitForSelectorSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  selector: z.string().min(1, 'Selector is required'),
  timeout: z.number().int().positive().optional(),
  state: z.enum(['attached', 'detached', 'visible', 'hidden']).optional(),
});

export const ExecuteSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  script: z.string().min(1, 'Script is required'),
});

export const GetPageInfoSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const ExecuteMainProcessScriptSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  script: z.string().min(1, 'Script is required'),
});

export const GetMainWindowInfoSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const FocusMainWindowSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const MinimizeMainWindowSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const MaximizeMainWindowSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const TakeScreenshotSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  path: z.string().optional(),
  fullPage: z.boolean().optional(),
});

export const CaptureElementScreenshotSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  selector: z.string().min(1, 'Selector is required'),
  path: z.string().optional(),
});

export const CompareScreenshotsSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  baselinePath: z.string().min(1, 'Baseline path is required'),
  actualPath: z.string().optional(),
});

export const GetViewportSizeSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export const SetViewportSizeSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const GetAccessibilityTreeSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export type LaunchElectronAppInput = z.infer<typeof LaunchElectronAppSchema>;
export type ConnectToElectronCDPInput = z.infer<typeof ConnectToElectronCDPSchema>;
export type CloseSessionInput = z.infer<typeof CloseSessionSchema>;
export type ListSessionsInput = z.infer<typeof ListSessionsSchema>;
export type NavigateInput = z.infer<typeof NavigateSchema>;
export type ClickInput = z.infer<typeof ClickSchema>;
export type FillInput = z.infer<typeof FillSchema>;
export type SelectInput = z.infer<typeof SelectSchema>;
export type GetTextInput = z.infer<typeof GetTextSchema>;
export type ScreenshotInput = z.infer<typeof ScreenshotSchema>;
export type WaitForSelectorInput = z.infer<typeof WaitForSelectorSchema>;
export type ExecuteInput = z.infer<typeof ExecuteSchema>;
export type GetPageInfoInput = z.infer<typeof GetPageInfoSchema>;
export type ExecuteMainProcessScriptInput = z.infer<typeof ExecuteMainProcessScriptSchema>;
export type GetMainWindowInfoInput = z.infer<typeof GetMainWindowInfoSchema>;
export type FocusMainWindowInput = z.infer<typeof FocusMainWindowSchema>;
export type MinimizeMainWindowInput = z.infer<typeof MinimizeMainWindowSchema>;
export type MaximizeMainWindowInput = z.infer<typeof MaximizeMainWindowSchema>;
export type TakeScreenshotInput = z.infer<typeof TakeScreenshotSchema>;
export type CaptureElementScreenshotInput = z.infer<typeof CaptureElementScreenshotSchema>;
export type CompareScreenshotsInput = z.infer<typeof CompareScreenshotsSchema>;
export type GetViewportSizeInput = z.infer<typeof GetViewportSizeSchema>;
export type SetViewportSizeInput = z.infer<typeof SetViewportSizeSchema>;
export type GetAccessibilityTreeInput = z.infer<typeof GetAccessibilityTreeSchema>;
