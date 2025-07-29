import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './userService';

describe('UserService', () => {
  beforeEach(() => {
    // Reset singleton instance before each test
    (UserService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = UserService.getInstance();
      const instance2 = UserService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
