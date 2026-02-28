import { SessionManager } from '../../session/index.js';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('MainProcessHandler');

export class MainProcessHandler {
  constructor(private sessionManager: SessionManager) {}

  private async getPage(sessionId: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    return { session, page: pages[0] };
  }

  async executeMainProcessScript(sessionId: string, script: string) {
    const { page } = await this.getPage(sessionId);

    const result = await page.evaluate(async (scriptToExecute) => {
      if (typeof (globalThis as any).require === 'function') {
        const electron = (globalThis as any).require('electron');
        const { ipcRenderer } = electron;
        
        return new Promise((resolve, reject) => {
          const channel = `mcp-main-process-${Date.now()}`;
          
          ipcRenderer.once(channel, (_event: any, response: any) => {
            resolve(response);
          });
          
          ipcRenderer.send('mcp-execute-main', {
            script: scriptToExecute,
            channel,
          });
          
          setTimeout(() => reject(new Error('Main process script timeout')), 10000);
        });
      }
      
      throw new Error('Not running in Electron context');
    }, script);

    logger.info({ sessionId }, 'Executed main process script');

    return {
      success: true,
      result,
    };
  }

  async getMainWindowInfo(sessionId: string) {
    const { page } = await this.getPage(sessionId);

    const windowInfo = await page.evaluate(() => {
      const win = typeof (globalThis as any).require === 'function' 
        ? (globalThis as any).require('@electron/remote').getCurrentWindow()
        : null;
      
      if (!win) {
        return { available: false };
      }

      return {
        available: true,
        title: win.getTitle(),
        bounds: win.getBounds(),
        isMinimized: win.isMinimized(),
        isMaximized: win.isMaximized(),
        isFullScreen: win.isFullScreen(),
        isResizable: win.isResizable(),
        isMovable: win.isMovable(),
      };
    });

    logger.info({ sessionId }, 'Got main window info');

    return {
      success: true,
      ...windowInfo,
    };
  }

  async focusMainWindow(sessionId: string) {
    const { page } = await this.getPage(sessionId);

    await page.evaluate(() => {
      if (typeof (globalThis as any).require === 'function') {
        const win = (globalThis as any).require('@electron/remote').getCurrentWindow();
        win.focus();
      }
    });

    logger.info({ sessionId }, 'Focused main window');

    return {
      success: true,
    };
  }

  async minimizeMainWindow(sessionId: string) {
    const { page } = await this.getPage(sessionId);

    await page.evaluate(() => {
      if (typeof (globalThis as any).require === 'function') {
        const win = (globalThis as any).require('@electron/remote').getCurrentWindow();
        win.minimize();
      }
    });

    logger.info({ sessionId }, 'Minimized main window');

    return {
      success: true,
    };
  }

  async maximizeMainWindow(sessionId: string) {
    const { page } = await this.getPage(sessionId);

    await page.evaluate(() => {
      if (typeof (globalThis as any).require === 'function') {
        const win = (globalThis as any).require('@electron/remote').getCurrentWindow();
        win.maximize();
      }
    });

    logger.info({ sessionId }, 'Maximized main window');

    return {
      success: true,
    };
  }

  async getUnresponsiveCallstack(sessionId: string) {
    const { session, page } = await this.getPage(sessionId);

    if (session.browserType !== 'electron') {
      return {
        success: false,
        supported: false,
        reason: 'NOT_ELECTRON',
        message: 'Unresponsive renderer callstack is only available for Electron sessions.',
      };
    }

    const info = await page.evaluate(() => {
      const electronVersion =
        typeof process !== 'undefined' && (process as any).versions?.electron
          ? (process as any).versions.electron
          : null;
      return { electronVersion };
    });

    logger.info({ sessionId, electronVersion: info.electronVersion }, 'Checked callstack capability');

    return {
      success: false,
      supported: false,
      electronVersion: info.electronVersion,
      message:
        'WebFrameMain.collectJavaScriptCallStack is not wired for this app. ' +
        'Configure main-process integration in your Electron app to enable real unresponsive callstack capture.',
    };
  }

  async getSharedDictionaryInfo(sessionId: string) {
    const { session, page } = await this.getPage(sessionId);

    if (session.browserType !== 'electron') {
      return {
        success: false,
        supported: false,
        reason: 'NOT_ELECTRON',
        message:
          'Shared dictionary cache information is only available for Electron sessions using HTTP/3 compression.',
      };
    }

    const info = await page.evaluate(() => {
      const electronVersion =
        typeof process !== 'undefined' && (process as any).versions?.electron
          ? (process as any).versions.electron
          : null;
      return { electronVersion };
    });

    logger.info({ sessionId, electronVersion: info.electronVersion }, 'Checked shared dictionary capability');

    return {
      success: false,
      supported: false,
      electronVersion: info.electronVersion,
      message:
        'Shared dictionary APIs are not wired in this sample app. ' +
        'In a real Electron 34+ app, connect these tools to session.getSharedDictionaryUsageInfo().',
    };
  }

  async clearSharedDictionaryCache(sessionId: string) {
    const { session } = await this.getPage(sessionId);

    if (session.browserType !== 'electron') {
      return {
        success: false,
        supported: false,
        reason: 'NOT_ELECTRON',
        message:
          'Shared dictionary cache clearing is only available for Electron sessions using HTTP/3 compression.',
      };
    }

    logger.info({ sessionId }, 'Shared dictionary cache clearing requested but not wired');

    return {
      success: false,
      supported: false,
      message:
        'Shared dictionary cache clearing is not wired in this sample app. ' +
        'In a real Electron 34+ app, connect these tools to session.clearSharedDictionaryCache().',
    };
  }
}
