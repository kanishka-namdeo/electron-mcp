import { SessionManager } from '../../session/index.js';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('AccessibilityHandler');

export interface FindAccessibleNodeParams {
  sessionId: string;
  role?: string;
  name?: string;
  exact?: boolean;
  limit?: number;
}

export interface InteractAccessibleNodeParams {
  sessionId: string;
  role: string;
  name: string;
  action: 'click' | 'fill';
  value?: string;
  exact?: boolean;
}

export class AccessibilityHandler {
  constructor(private readonly sessionManager: SessionManager) {}

  private async getPage(sessionId: string) {
    const session = await this.sessionManager.getSession(sessionId);
    const pages = session.context.pages();

    if (pages.length === 0) {
      throw new Error('No pages available in session');
    }

    return pages[0];
  }

  async getAccessibilitySnapshot(sessionId: string, includeHidden = false): Promise<{ success: boolean; snapshot: unknown[] }> {
    const page = await this.getPage(sessionId);

    // Use CDP to get accessibility tree via Accessibility.getFullAXTree
    const client = await page.context().newCDPSession(page);
    const result = await client.send('Accessibility.getFullAXTree');

    let nodes = (result.nodes as unknown[]) || [];

    // Filter out hidden/ignored nodes if includeHidden is false
    if (!includeHidden) {
      nodes = nodes.filter((node: any) => {
        // Skip nodes that are ignored or have no role (often hidden)
        if (node.ignored === true) return false;
        if (node.role?.value === 'none' || node.role?.value === 'presentation') return false;
        return true;
      });
    }

    logger.info({ sessionId, includeHidden, totalNodes: (result.nodes as unknown[])?.length || 0, filteredNodes: nodes.length }, 'Got accessibility snapshot');

    return {
      success: true,
      snapshot: nodes,
    };
  }

  async findAccessibleNode(params: FindAccessibleNodeParams) {
    const { sessionId, role, name, exact = true, limit = 1 } = params;
    const page = await this.getPage(sessionId);

    if (!role && !name) {
      throw new Error('At least one of role or name must be provided');
    }

    const locator = role
      ? page.getByRole(role as any, name ? { name, exact } : { exact })
      : page.getByText(name as string, { exact });

    const count = await locator.count();

    if (count === 0) {
      logger.info({ sessionId, role, name }, 'No accessible nodes found');
      return {
        success: false,
        matches: 0,
        nodes: [],
      };
    }

    const resultLimit = Math.max(1, Math.min(limit, count));
    const nodes: Array<{
      index: number;
      role?: string;
      name?: string;
      boundingBox?: { x: number; y: number; width: number; height: number } | null;
    }> = [];

    for (let i = 0; i < resultLimit; i++) {
      const handle = locator.nth(i);
      const box = await handle.boundingBox();

      nodes.push({
        index: i,
        role,
        name,
        boundingBox: box,
      });
    }

    logger.info({ sessionId, role, name, matches: count }, 'Found accessible nodes');

    return {
      success: true,
      matches: count,
      nodes,
    };
  }

  async interactAccessibleNode(params: InteractAccessibleNodeParams) {
    const { sessionId, role, name, action, value, exact = true } = params;
    const page = await this.getPage(sessionId);

    const locator = page.getByRole(role as any, { name, exact });

    if ((await locator.count()) === 0) {
      throw new Error(`No accessible node found for role="${role}" and name="${name}"`);
    }

    const target = locator.first();

    if (action === 'click') {
      await target.click();
    } else if (action === 'fill') {
      if (value === undefined) {
        throw new Error('value is required when action is "fill"');
      }
      await target.fill(value);
    } else {
      throw new Error(`Unsupported action: ${action}`);
    }

    logger.info({ sessionId, role, name, action }, 'Interacted with accessible node');

    return {
      success: true,
      action,
      role,
      name,
    };
  }
}

