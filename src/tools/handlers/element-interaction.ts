import { SessionManager } from '../../session/index.js';
import { createLogger } from '../../core/logger.js';
import {
  NavigateInput,
  ClickInput,
  FillInput,
  SelectInput,
  GetTextInput,
  ScreenshotInput,
  WaitForSelectorInput,
  ExecuteInput,
  GetPageInfoInput,
} from '../validation.js';
import {
  ElementNotFoundError,
  TimeoutError,
} from '../../core/errors.js';

const logger = createLogger('ElementInteractionHandler');

export class ElementInteractionHandler {
  constructor(private sessionManager: SessionManager) {}

  async navigate(input: NavigateInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];
    
    try {
      await page.goto(input.url, {
        timeout: input.timeout || 30000,
      });

      logger.info({ sessionId: input.sessionId, url: input.url }, 'Navigated to URL');

      return {
        success: true,
        url: page.url(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new TimeoutError('navigate', input.timeout || 30000);
      }
      throw error;
    }
  }

  async click(input: ClickInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    try {
      await page.click(input.selector, {
        timeout: input.timeout || 10000,
      });

      logger.info({ sessionId: input.sessionId, selector: input.selector }, 'Clicked element');

      return {
        success: true,
        selector: input.selector,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new TimeoutError('click', input.timeout || 10000);
        }
        throw new ElementNotFoundError(input.selector, { error: error.message });
      }
      throw error;
    }
  }

  async fill(input: FillInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    try {
      await page.fill(input.selector, input.value, {
        timeout: input.timeout || 10000,
      });

      logger.info({ sessionId: input.sessionId, selector: input.selector }, 'Filled element');

      return {
        success: true,
        selector: input.selector,
        value: input.value,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new TimeoutError('fill', input.timeout || 10000);
        }
        throw new ElementNotFoundError(input.selector, { error: error.message });
      }
      throw error;
    }
  }

  async select(input: SelectInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    try {
      await page.selectOption(input.selector, input.value, {
        timeout: input.timeout || 10000,
      });

      logger.info({ sessionId: input.sessionId, selector: input.selector }, 'Selected option');

      return {
        success: true,
        selector: input.selector,
        value: input.value,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new TimeoutError('select', input.timeout || 10000);
        }
        throw new ElementNotFoundError(input.selector, { error: error.message });
      }
      throw error;
    }
  }

  async getText(input: GetTextInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    try {
      const text = await page.textContent(input.selector, {
        timeout: input.timeout || 10000,
      });

      logger.info({ sessionId: input.sessionId, selector: input.selector }, 'Got element text');

      return {
        success: true,
        selector: input.selector,
        text,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new TimeoutError('getText', input.timeout || 10000);
        }
        throw new ElementNotFoundError(input.selector, { error: error.message });
      }
      throw error;
    }
  }

  async screenshot(input: ScreenshotInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const screenshot = await page.screenshot({
      path: input.path,
      fullPage: input.fullPage,
    });

    logger.info({ sessionId: input.sessionId, path: input.path }, 'Took screenshot');

    return {
      success: true,
      path: input.path,
      size: screenshot.length,
    };
  }

  async waitForSelector(input: WaitForSelectorInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    try {
      await page.waitForSelector(input.selector, {
        timeout: input.timeout || 30000,
        state: input.state || 'visible',
      });

      logger.info({ sessionId: input.sessionId, selector: input.selector }, 'Waited for selector');

      return {
        success: true,
        selector: input.selector,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new TimeoutError('waitForSelector', input.timeout || 30000);
      }
      throw error;
    }
  }

  async execute(input: ExecuteInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const result = await page.evaluate(input.script);

    logger.info({ sessionId: input.sessionId }, 'Executed script');

    return {
      success: true,
      result,
    };
  }

  async getPageInfo(input: GetPageInfoInput) {
    const session = await this.sessionManager.getSession(input.sessionId);
    const pages = session.context.pages();
    
    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    const page = pages[0];

    const info = {
      url: page.url(),
      title: await page.title(),
    };

    logger.info({ sessionId: input.sessionId }, 'Got page info');

    return {
      success: true,
      ...info,
    };
  }
}
