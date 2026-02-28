import { describe, it, expect, beforeEach } from 'vitest';
import { CodegenHandler } from '../../../src/tools/handlers/codegen.js';
import { recordingManager } from '../../../src/session/recording-manager.js';

describe('CodegenHandler', () => {
  let handler: CodegenHandler;
  const sessionId = '550e8400-e29b-41d4-a716-446655440000';
  const nonExistentSessionId = '660e8400-e29b-41d4-a716-446655440001';

  beforeEach(() => {
    handler = new CodegenHandler();
    recordingManager.clear(sessionId);
    recordingManager.clear(nonExistentSessionId);
  });

  describe('startRecording', () => {
    it('should start recording for a session', () => {
      const result = handler.startRecording({ sessionId });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(recordingManager.isRecording(sessionId)).toBe(true);
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return steps', () => {
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, { type: 'navigate', url: 'https://example.com' });
      recordingManager.recordStep(sessionId, { type: 'click', selector: '#button' });

      const result = handler.stopRecording({ sessionId });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(result.steps).toHaveLength(2);
      expect(recordingManager.isRecording(sessionId)).toBe(false);
    });

    it('should return empty steps for non-existent session', () => {
      const result = handler.stopRecording({ sessionId });

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(0);
    });
  });

  describe('exportRecordingAsTest', () => {
    beforeEach(() => {
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, {
        type: 'navigate',
        url: 'https://example.com',
      });
      recordingManager.recordStep(sessionId, {
        type: 'click',
        selector: '#submit-button',
      });
      recordingManager.recordStep(sessionId, {
        type: 'fill',
        selector: '#username',
        value: 'testuser',
      });
    });

    it('should export recording as test code', () => {
      const result = handler.exportRecordingAsTest({ sessionId });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe(sessionId);
      expect(result.testName).toBe(`recorded flow for ${sessionId}`);
      expect(result.testCode).toContain('import { test } from');
      expect(result.testCode).toContain('await page.goto(');
      expect(result.testCode).toContain('await page.click(');
      expect(result.testCode).toContain('await page.fill(');
    });

    it('should use custom test name when provided', () => {
      const customTestName = 'my custom test';
      const result = handler.exportRecordingAsTest({
        sessionId,
        testName: customTestName,
      });

      expect(result.testName).toBe(customTestName);
      expect(result.testCode).toContain(`test(${JSON.stringify(customTestName)},`);
    });

    it('should generate test with select step', () => {
      recordingManager.stop(sessionId);
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, {
        type: 'select',
        selector: '#country',
        value: 'US',
      });

      const result = handler.exportRecordingAsTest({ sessionId });

      expect(result.testCode).toContain("await page.selectOption(");
      expect(result.testCode).toContain('#country');
      expect(result.testCode).toContain('US');
    });

    it('should generate test with wait_for_selector step', () => {
      recordingManager.stop(sessionId);
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, {
        type: 'wait_for_selector',
        selector: '.async-content',
        state: 'visible',
        timeout: 5000,
      });

      const result = handler.exportRecordingAsTest({ sessionId });

      expect(result.testCode).toContain('await page.waitForSelector(');
      expect(result.testCode).toContain('.async-content');
      expect(result.testCode).toContain('state');
      expect(result.testCode).toContain('timeout');
    });

    it('should generate test with execute step', () => {
      recordingManager.stop(sessionId);
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, {
        type: 'execute',
        script: 'document.title = "New Title"',
      });

      const result = handler.exportRecordingAsTest({ sessionId });

      expect(result.testCode).toContain('await page.evaluate(');
      expect(result.testCode).toContain('\\\"New Title\\\"');
    });

    it('should skip get_page_info step with comment', () => {
      recordingManager.stop(sessionId);
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, {
        type: 'get_page_info',
      });

      const result = handler.exportRecordingAsTest({ sessionId });

      expect(result.testCode).toContain('get_page_info step (page URL and title already implicit)');
    });
  });
});
