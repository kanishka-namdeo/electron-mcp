export interface ElectronLaunchOptions {
  executablePath: string;
  args?: string[];
  env?: Record<string, string>;
  headless?: boolean;
  slowMo?: number;
}

export interface ElectronCDPOptions {
  port: number;
  host?: string;
  timeout?: number;
}

export type ElectronConnectionOptions = ElectronLaunchOptions | ElectronCDPOptions;

export interface SessionConfig {
  id: string;
  connectionOptions: ElectronConnectionOptions;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface SessionMetadata {
  id: string;
  status: 'active' | 'paused' | 'closed';
  createdAt: Date;
  lastActivityAt: Date;
  appInfo?: {
    name?: string;
    version?: string;
  };
}

export interface ToolExecutionContext {
  sessionId: string;
  timestamp: Date;
}
