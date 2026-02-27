import { SessionManager } from '../../session/index.js';
import { createLogger } from '../../core/logger.js';


const logger = createLogger('MainProcessHandler');

export class MainProcessHandler {
  constructor(private sessionManager: SessionManager) {}

  async executeMainProcessScript(sessionId: string, script: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

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
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

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
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

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
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

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
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

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
}
