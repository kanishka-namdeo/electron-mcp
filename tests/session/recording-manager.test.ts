import { describe, it, expect, beforeEach } from 'vitest';
import { recordingManager } from '../../src/session/recording-manager.js';

describe('RecordingManager', () => {
  const sessionId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    recordingManager.clear(sessionId);
  });

  describe('start', () => {
    it('should start a recording session', () => {
      recordingManager.start(sessionId);

      expect(recordingManager.isRecording(sessionId)).toBe(true);
    });

    it('should overwrite existing recording session', () => {
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, { type: 'navigate', url: 'https://example.com' });

      recordingManager.start(sessionId);

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(0);
    });
  });

  describe('stop', () => {
    it('should stop an active recording session', () => {
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, { type: 'navigate', url: 'https://example.com' });

      const steps = recordingManager.stop(sessionId);

      expect(steps).toHaveLength(1);
      expect(recordingManager.isRecording(sessionId)).toBe(false);
    });

    it('should return empty array for non-existent session', () => {
      const steps = recordingManager.stop(sessionId);

      expect(steps).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should clear a recording session', () => {
      recordingManager.start(sessionId);
      recordingManager.recordStep(sessionId, { type: 'navigate', url: 'https://example.com' });

      recordingManager.clear(sessionId);

      expect(recordingManager.isRecording(sessionId)).toBe(false);
      expect(recordingManager.getSteps(sessionId)).toHaveLength(0);
    });
  });

  describe('isRecording', () => {
    it('should return false for non-existent session', () => {
      expect(recordingManager.isRecording(sessionId)).toBe(false);
    });

    it('should return true for active recording', () => {
      recordingManager.start(sessionId);

      expect(recordingManager.isRecording(sessionId)).toBe(true);
    });

    it('should return false after stopping', () => {
      recordingManager.start(sessionId);
      recordingManager.stop(sessionId);

      expect(recordingManager.isRecording(sessionId)).toBe(false);
    });
  });

  describe('recordStep', () => {
    it('should record a navigate step', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, {
        type: 'navigate',
        url: 'https://example.com',
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({
        type: 'navigate',
        url: 'https://example.com',
      });
    });

    it('should record a click step', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, {
        type: 'click',
        selector: '#button',
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({
        type: 'click',
        selector: '#button',
      });
    });

    it('should record a fill step', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, {
        type: 'fill',
        selector: '#input',
        value: 'test value',
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({
        type: 'fill',
        selector: '#input',
        value: 'test value',
      });
    });

    it('should record a select step', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, {
        type: 'select',
        selector: '#dropdown',
        value: 'option1',
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({
        type: 'select',
        selector: '#dropdown',
        value: 'option1',
      });
    });

    it('should record a wait_for_selector step', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, {
        type: 'wait_for_selector',
        selector: '.async-content',
        state: 'visible',
        timeout: 5000,
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({
        type: 'wait_for_selector',
        selector: '.async-content',
        state: 'visible',
        timeout: 5000,
      });
    });

    it('should record an execute step', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, {
        type: 'execute',
        script: 'document.title = "New Title"',
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(1);
      expect(steps[0]).toEqual({
        type: 'execute',
        script: 'document.title = "New Title"',
      });
    });

    it('() should ignore steps when not recording', () => {
      recordingManager.recordStep(sessionId, {
        type: 'navigate',
        url: 'https://example.com',
      });

      const steps = recordingManager.getSteps(sessionId);
      expect(steps).toHaveLength(0);
    });
  });

  describe('getSteps', () => {
    it('should return a copy of steps', () => {
      recordingManager.start(sessionId);

      recordingManager.recordStep(sessionId, { type: 'navigate', url: 'https://example.com' });

      const steps = recordingManager.getSteps(sessionId);
      const steps2 = recordingManager.getSteps(sessionId);

      steps.push({ type: 'navigate', url: 'https://another.com' });

      expect(steps2).toHaveLength(1);
    });
  });
});
