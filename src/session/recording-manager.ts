import { createLogger } from '../core/logger.js';

const logger = createLogger('RecordingManager');

export type RecordedStep =
  | { type: 'navigate'; url: string }
  | { type: 'click'; selector: string }
  | { type: 'fill'; selector: string; value: string }
  | { type: 'select'; selector: string; value: string }
  | { type: 'wait_for_selector'; selector: string; state?: string; timeout?: number }
  | { type: 'execute'; script: string }
  | { type: 'get_page_info' };

interface SessionRecording {
  active: boolean;
  startedAt: number;
  steps: RecordedStep[];
}

class RecordingManager {
  private readonly recordings = new Map<string, SessionRecording>();

  start(sessionId: string): void {
    this.recordings.set(sessionId, {
      active: true,
      startedAt: Date.now(),
      steps: [],
    });

    logger.info({ sessionId }, 'Started recording session');
  }

  stop(sessionId: string): RecordedStep[] {
    const recording = this.recordings.get(sessionId);
    if (!recording) {
      return [];
    }

    recording.active = false;
    logger.info({ sessionId, steps: recording.steps.length }, 'Stopped recording session');

    return [...recording.steps];
  }

  clear(sessionId: string): void {
    this.recordings.delete(sessionId);
    logger.info({ sessionId }, 'Cleared recording session');
  }

  isRecording(sessionId: string): boolean {
    const recording = this.recordings.get(sessionId);
    return !!recording && recording.active;
  }

  recordStep(sessionId: string, step: RecordedStep): void {
    const recording = this.recordings.get(sessionId);
    if (!recording || !recording.active) {
      return;
    }

    recording.steps.push(step);
    logger.debug({ sessionId, stepType: step.type }, 'Recorded step');
  }

  getSteps(sessionId: string): RecordedStep[] {
    const recording = this.recordings.get(sessionId);
    return recording ? [...recording.steps] : [];
  }
}

export const recordingManager = new RecordingManager();

