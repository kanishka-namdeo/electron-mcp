import { describe, it, expect } from 'vitest';
import {
  LaunchElectronAppSchema,
  ConnectToElectronCDPSchema,
  NavigateSchema,
  ClickSchema,
  FillSchema,
  SelectSchema,
  GetTextSchema,
  ScreenshotSchema,
  WaitForSelectorSchema,
  ExecuteSchema,
  GetPageInfoSchema,
} from '../../src/tools/validation.js';

describe('Validation Schemas', () => {
  describe('LaunchElectronAppSchema', () => {
    it('should validate valid input', () => {
      const input = {
        executablePath: '/path/to/electron',
        args: ['--test'],
        headless: true,
        slowMo: 100,
      };
      expect(() => LaunchElectronAppSchema.parse(input)).not.toThrow();
    });

    it('should require executablePath', () => {
      const input = { args: ['--test'] };
      expect(() => LaunchElectronAppSchema.parse(input)).toThrow();
    });
  });

  describe('ConnectToElectronCDPSchema', () => {
    it('should validate valid input', () => {
      const input = {
        port: 9222,
        host: 'localhost',
        timeout: 10000,
      };
      expect(() => ConnectToElectronCDPSchema.parse(input)).not.toThrow();
    });

    it('should use default host', () => {
      const input = { port: 9222 };
      const result = ConnectToElectronCDPSchema.parse(input);
      expect(result.host).toBe('localhost');
    });
  });

  describe('NavigateSchema', () => {
    it('should validate valid URL', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://example.com',
      };
      expect(() => NavigateSchema.parse(input)).not.toThrow();
    });

    it('should reject invalid URL', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        url: 'not-a-url',
      };
      expect(() => NavigateSchema.parse(input)).toThrow();
    });
  });

  describe('ClickSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        selector: '#button',
      };
      expect(() => ClickSchema.parse(input)).not.toThrow();
    });

    it('should require selector', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => ClickSchema.parse(input)).toThrow();
    });
  });

  describe('FillSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        selector: '#input',
        value: 'test value',
      };
      expect(() => FillSchema.parse(input)).not.toThrow();
    });
  });

  describe('SelectSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        selector: '#select',
        value: 'option1',
      };
      expect(() => SelectSchema.parse(input)).not.toThrow();
    });
  });

  describe('GetTextSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        selector: '#text',
      };
      expect(() => GetTextSchema.parse(input)).not.toThrow();
    });
  });

  describe('ScreenshotSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        path: '/path/to/screenshot.png',
        fullPage: true,
      };
      expect(() => ScreenshotSchema.parse(input)).not.toThrow();
    });

    it('should allow all optional fields', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => ScreenshotSchema.parse(input)).not.toThrow();
    });
  });

  describe('WaitForSelectorSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        selector: '#element',
        timeout: 5000,
        state: 'visible' as const,
      };
      expect(() => WaitForSelectorSchema.parse(input)).not.toThrow();
    });

    it('should accept valid state values', () => {
      const states = ['attached', 'detached', 'visible', 'hidden'] as const;
      states.forEach(state => {
        const input = {
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          selector: '#element',
          state,
        };
        expect(() => WaitForSelectorSchema.parse(input)).not.toThrow();
      });
    });
  });

  describe('ExecuteSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        script: 'document.title',
      };
      expect(() => ExecuteSchema.parse(input)).not.toThrow();
    });

    it('should require script', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => ExecuteSchema.parse(input)).toThrow();
    });
  });

  describe('GetPageInfoSchema', () => {
    it('should validate valid input', () => {
      const input = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      expect(() => GetPageInfoSchema.parse(input)).not.toThrow();
    });
  });
});
