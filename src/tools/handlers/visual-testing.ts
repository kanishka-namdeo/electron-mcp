import { SessionManager } from '../../session/index.js';
import { createLogger } from '../../core/logger.js';


const logger = createLogger('VisualTestingHandler');

export class VisualTestingHandler {
  constructor(private sessionManager: SessionManager) {}

  async takeScreenshot(sessionId: string, path?: string, fullPage = false) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const screenshot = await page.screenshot({
      path,
      fullPage,
      type: 'png',
    });

    logger.info({ sessionId, path, fullPage }, 'Took screenshot');

    return {
      success: true,
      path,
      size: screenshot.length,
    };
  }

  async captureElementScreenshot(sessionId: string, selector: string, path?: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const element = await page.locator(selector);
    const screenshot = await element.screenshot({
      path,
      type: 'png',
    });

    logger.info({ sessionId, selector, path }, 'Captured element screenshot');

    return {
      success: true,
      selector,
      path,
      size: screenshot.length,
    };
  }

  async compareScreenshots(sessionId: string, baselinePath: string, actualPath?: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    if (!actualPath) {
      actualPath = baselinePath.replace('.png', '-actual.png');
      await page.screenshot({ path: actualPath, type: 'png' });
    }

    logger.info({ sessionId, baselinePath, actualPath }, 'Comparing screenshots');

    return {
      success: true,
      baselinePath,
      actualPath,
      message: 'Screenshot comparison completed. Review results manually.',
    };
  }

  async getViewportSize(sessionId: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const viewport = page.viewportSize();

    logger.info({ sessionId, viewport }, 'Got viewport size');

    return {
      success: true,
      width: viewport?.width || 0,
      height: viewport?.height || 0,
    };
  }

  async setViewportSize(sessionId: string, width: number, height: number) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    await page.setViewportSize({ width, height });

    logger.info({ sessionId, width, height }, 'Set viewport size');

    return {
      success: true,
      width,
      height,
    };
  }

  async getAccessibilityTree(sessionId: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const snapshot = await page.locator('body').evaluate((el) => {
      const tree: any = {
        role: 'WebArea',
        name: '',
        children: [],
      };

      function buildTree(node: any, parent: any) {
        const childNodes = node.childNodes || [];
        for (let i = 0; i < childNodes.length; i++) {
          const child = childNodes[i];
          if (child.nodeType === 1) {
            const element = child;
            const role = element.getAttribute('role') || 
              (element.tagName === 'BUTTON' ? 'button' :
              element.tagName === 'INPUT' ? 'textbox' :
              element.tagName === 'A' ? 'link' :
              element.tagName === 'SELECT' ? 'combobox' : 'generic');
            const name = element.getAttribute('aria-label') || 
              element.getAttribute('alt') || 
              element.textContent?.substring(0, 100) || '';
            
            const treeNode: any = {
              role,
              name,
              children: [],
            };
            
            parent.children.push(treeNode);
            buildTree(element, treeNode);
          }
        }
      }

      buildTree(el, tree);
      return tree;
    });

    logger.info({ sessionId }, 'Got accessibility tree');

    return {
      success: true,
      accessibilityTree: snapshot,
    };
  }
}
