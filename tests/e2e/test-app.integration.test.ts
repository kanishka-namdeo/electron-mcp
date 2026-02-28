import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { E2ETestHelper } from './e2e-helper.js';

describe('Test App Integration Tests', () => {
  let helper: E2ETestHelper;
  let sessionId: string;

  beforeAll(async () => {
    helper = new E2ETestHelper({
      serverPath: join(process.cwd(), 'dist', 'index.js'),
      env: {
        LOG_LEVEL: 'info',
        NODE_ENV: 'test',
      },
    });

    await helper.setup();
    await helper.createTestDirectory();
  }, 60000);

  afterAll(async () => {
    await helper.teardown();
  }, 30000);

  beforeEach(async () => {
    sessionId = await helper.connectToCDP(9222);
    await helper.callTool('navigate', {
      sessionId,
      url: `file://${join(helper.getTestAppPath(), 'index.html')}`,
    });
  });

  afterEach(async () => {
    try {
      await helper.closeSession(sessionId);
    } catch (error) {
    }
  });

  describe('Application Info', () => {
    it('should get app info via IPC', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#getInfoBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#appInfo .info-item',
        timeout: 5000,
      });

      const appInfo = await helper.callTool('get_text', {
        sessionId,
        selector: '#appInfo',
      });

      expect(appInfo.success).toBe(true);
      expect(appInfo.text).toContain('App Name');
      expect(appInfo.text).toContain('Version');
      expect(appInfo.text).toContain('Platform');
    });

    it('should send and receive test message', async () => {
      const testMessage = 'Hello from E2E test!';
      
      await helper.callTool('fill', {
        sessionId,
        selector: '#messageInput',
        value: testMessage,
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#sendMessageBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#output',
        timeout: 5000,
      });

      const output = await helper.callTool('get_text', {
        sessionId,
        selector: '#output',
      });

      expect(output.success).toBe(true);
      expect(output.text).toContain('received');
      expect(output.text).toContain(testMessage);
    });
  });

  describe('Element Interaction Tests', () => {
    it('should interact with text input', async () => {
      const testText = 'Test input value';

      await helper.callTool('fill', {
        sessionId,
        selector: '#textInput',
        value: testText,
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('Text Input');
      expect(result.text).toContain(testText);
    });

    it('should interact with number input', async () => {
      const testValue = '42';

      await helper.callTool('fill', {
        sessionId,
        selector: '#numberInput',
        value: testValue,
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('Number Input');
      expect(result.text).toContain(testValue);
    });

    it('should interact with textarea', async () => {
      const testText = 'Multi-line\ntext\ncontent';

      await helper.callTool('fill', {
        sessionId,
        selector: '#textarea',
        value: testText,
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('Textarea');
    });

    it('should select dropdown option', async () => {
      await helper.callTool('select', {
        sessionId,
        selector: '#selectDropdown',
        value: 'option1',
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('Select Dropdown');
      expect(result.text).toContain('option1');
    });

    it('should click checkboxes', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#checkbox1',
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#checkbox2',
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('Checkbox');
      expect(result.text).toContain('check1');
      expect(result.text).toContain('check2');
    });

    it('should click radio buttons', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: 'input[name="radioGroup"][value="radio1"]',
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('Radio');
      expect(result.text).toContain('radio1');
    });
  });

  describe('Button Interactions', () => {
    const buttons = [
      { id: 'primaryBtn', text: 'Primary Button' },
      { id: 'secondaryBtn', text: 'Secondary Button' },
      { id: 'successBtn', text: 'Success Button' },
      { id: 'warningBtn', text: 'Warning Button' },
      { id: 'dangerBtn', text: 'Danger Button' },
    ];

    buttons.forEach(({ id, text }) => {
      it(`should click ${text}`, async () => {
        await helper.callTool('click', {
          sessionId,
          selector: `#${id}`,
        });

        const result = await helper.callTool('get_text', {
          sessionId,
          selector: '#elementOutput',
        });

        expect(result.text).toContain('Button Click');
        expect(result.text).toContain(text);
      });
    });
  });

  describe('Dynamic Content', () => {
    it('should increment counter', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });

      const counterText = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(counterText.text).toBe('1');
    });

    it('should decrement counter', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });
      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });
      await helper.callTool('click', {
        sessionId,
        selector: '#decrementBtn',
      });

      const counterText = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(counterText.text).toBe('1');
    });

    it('should reset counter', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });
      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });
      await helper.callTool('click', {
        sessionId,
        selector: '#resetBtn',
      });

      const counterText = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(counterText.text).toBe('0');
    });

    it('should update dynamic text area', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });

      const dynamicText = await helper.callTool('get_text', {
        sessionId,
        selector: '#dynamicText',
      });

      expect(dynamicText.text).toContain('Counter incremented to 1');
    });
  });

  describe('Hidden/Visible Elements', () => {
    it('should toggle hidden element visibility', async () => {
      const beforeClick = await helper.callTool('execute', {
        sessionId,
        script: `document.querySelector('#hiddenElement').classList.contains('hidden')`,
      });

      expect(beforeClick.result).toBe(true);

      await helper.callTool('click', {
        sessionId,
        selector: '#toggleHiddenBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#hiddenElement:not(.hidden)',
        timeout: 5000,
      });

      const afterClick = await helper.callTool('execute', {
        sessionId,
        script: `document.querySelector('#hiddenElement').classList.contains('hidden')`,
      });

      expect(afterClick.result).toBe(false);
    });
  });

  describe('Viewport Management', () => {
    it('should update viewport info', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#updateViewportBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#viewportWidth',
        timeout: 5000,
      });

      const width = await helper.callTool('get_text', {
        sessionId,
        selector: '#viewportWidth',
      });

      const height = await helper.callTool('get_text', {
        sessionId,
        selector: '#viewportHeight',
      });

      expect(width.text).not.toBe('-');
      expect(height.text).not.toBe('-');
    });

    it('should change viewport size', async () => {
      const newWidth = 800;
      const newHeight = 600;

      await helper.callTool('set_viewport_size', {
        sessionId,
        width: newWidth,
        height: newHeight,
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#updateViewportBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#viewportWidth',
        timeout: 5000,
      });

      const width = await helper.callTool('get_text', {
        sessionId,
        selector: '#viewportWidth',
      });

      expect(width.text).toContain(newWidth.toString());
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility tree with button', async () => {
      const result = await helper.callTool('get_accessibility_tree', {
        sessionId,
      });

      expect(result.success).toBe(true);
      expect(result.accessibilityTree).toBeDefined();
    });

    it('should click accessibility button', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#a11yBtn',
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#a11yOutput',
      });

      expect(result.text).toContain('Status');
      expect(result.text).toContain('Active');
    });

    it('should get accessibility snapshot via role-based tool', async () => {
      const result = await helper.callTool('get_accessibility_snapshot', {
        sessionId,
      });

      expect(result.success).toBe(true);
      expect(result.snapshot).toBeDefined();
    });

    it('should find accessibility node by role and name', async () => {
      const result = await helper.callTool('find_accessible_node', {
        sessionId,
        role: 'button',
        name: 'Click to perform accessibility action',
        limit: 1,
      });

      expect(result.success).toBe(true);
      expect(result.matches).toBeGreaterThan(0);
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes[0].role).toBe('button');
    });

    it('should interact with accessibility node using role-based tool', async () => {
      const result = await helper.callTool('interact_accessible_node', {
        sessionId,
        role: 'button',
        name: 'Click to perform accessibility action',
        action: 'click',
      });

      expect(result.success).toBe(true);

      const output = await helper.callTool('get_text', {
        sessionId,
        selector: '#a11yOutput',
      });

      expect(output.text).toContain('Status');
      expect(output.text).toContain('Active');
    });
  });

  describe('Window Controls', () => {
    it('should get window info', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#getWindowInfoBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#windowInfo .info-item',
        timeout: 5000,
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#windowInfo',
      });

      expect(result.text).toContain('Available');
    });

    it('should minimize window', async () => {
      const result = await helper.callTool('click', {
        sessionId,
        selector: '#minimizeBtn',
      });

      expect(result).toBeDefined();
    });

    it('should maximize window', async () => {
      const result = await helper.callTool('click', {
        sessionId,
        selector: '#maximizeBtn',
      });

      expect(result).toBeDefined();
    });

    it('should restore window', async () => {
      await helper.callTool('click', {
        sessionId,
        selector: '#maximizeBtn',
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#restoreBtn',
      });

      expect(result).toBeDefined();
    });
  });

  describe('Page Navigation', () => {
    it('should navigate to example.com', async () => {
      await helper.callTool('fill', {
        sessionId,
        selector: '#urlInput',
        value: 'https://example.com',
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#navigateBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: 'h1',
        timeout: 10000,
      });

      const pageInfo = await helper.callTool('get_page_info', {
        sessionId,
      });

      expect(pageInfo.url).toContain('example.com');
    });

    it('should get page info after navigation', async () => {
      await helper.callTool('navigate', {
        sessionId,
        url: 'https://example.com',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: 'h1',
        timeout: 10000,
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#getPageInfoBtn',
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#pageInfoOutput',
      });

      expect(result.text).toContain('URL');
      expect(result.text).toContain('example.com');
    });
  });

  describe('Script Execution', () => {
    it('should execute custom JavaScript', async () => {
      const script = `document.getElementById('dynamicText').textContent = 'Script executed successfully'`;

      await helper.callTool('fill', {
        sessionId,
        selector: '#scriptInput',
        value: script,
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#executeBtn',
      });

      await helper.callTool('wait_for_selector', {
        sessionId,
        selector: '#scriptOutput .info-item',
        timeout: 5000,
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#dynamicText',
      });

      expect(result.text).toBe('Script executed successfully');
    });
  });

  describe('Visual Testing', () => {
    it('should take screenshot of the test app', async () => {
      const screenshotPath = helper.getScreenshotPath('test-app-full.png');
      
      const result = await helper.callTool('take_screenshot', {
        sessionId,
        path: screenshotPath,
        fullPage: true,
      });

      expect(result.success).toBe(true);
      expect(result.path).toBe(screenshotPath);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should take viewport screenshot', async () => {
      const screenshotPath = helper.getScreenshotPath('test-app-viewport.png');
      
      const result = await helper.callTool('take_screenshot', {
        sessionId,
        path: screenshotPath,
        fullPage: false,
      });

      expect(result.success).toBe(true);
    });

    it('should capture element screenshot', async () => {
      const screenshotPath = helper.getScreenshotPath('test-app-element.png');
      
      const result = await helper.callTool('capture_element_screenshot', {
        sessionId,
        selector: '.container',
        path: screenshotPath,
      });

      expect(result.success).toBe(true);
      expect(result.path).toBe(screenshotPath);
    });
  });

  describe('Complex Workflows', () => {
    it('should complete a form fill and submission workflow', async () => {
      await helper.callTool('fill', {
        sessionId,
        selector: '#textInput',
        value: 'John Doe',
      });

      await helper.callTool('fill', {
        sessionId,
        selector: '#numberInput',
        value: '42',
      });

      await helper.callTool('fill', {
        sessionId,
        selector: '#textarea',
        value: 'This is a test message',
      });

      await helper.callTool('select', {
        sessionId,
        selector: '#selectDropdown',
        value: 'option2',
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#checkbox1',
      });

      await helper.callTool('click', {
        sessionId,
        selector: 'input[name="radioGroup"][value="radio2"]',
      });

      const result = await helper.callTool('get_text', {
        sessionId,
        selector: '#elementOutput',
      });

      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('42');
    });

    it('should perform counter workflow', async () => {
      const initialCounter = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(initialCounter.text).toBe('0');

      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });

      await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });

      const afterIncrement = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(afterIncrement.text).toBe('3');

      await helper.callTool('click', {
        sessionId,
        selector: '#decrementBtn',
      });

      const afterDecrement = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(afterDecrement.text).toBe('2');

      await helper.callTool('click', {
        sessionId,
        selector: '#resetBtn',
      });

      const afterReset = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(afterReset.text).toBe('0');
    });
  });

  describe('Error Recovery', () => {
    it('should handle clicking non-existent element gracefully', async () => {
      await expect(
        helper.callTool('click', {
          sessionId,
          selector: '#non-existent-element',
        })
      ).rejects.toThrow();
    });

    it('should handle filling non-existent element gracefully', async () => {
      await expect(
        helper.callTool('fill', {
          sessionId,
          selector: '#non-existent-input',
          value: 'test',
        })
      ).rejects.toThrow();
    });

    it('should recover after error and continue testing', async () => {
      try {
        await helper.callTool('click', {
          sessionId,
          selector: '#non-existent-element',
        });
      } catch (error) {
      }

      const result = await helper.callTool('click', {
        sessionId,
        selector: '#incrementBtn',
      });

      expect(result).toBeDefined();

      const counter = await helper.callTool('get_text', {
        sessionId,
        selector: '#counter',
      });

      expect(counter.text).toBe('1');
    });
  });
});
