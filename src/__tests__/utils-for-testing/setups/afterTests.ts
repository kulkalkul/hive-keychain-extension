import { cleanup } from '@testing-library/react';

const clean = () => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
  jest.clearAllMocks();
};
/**
 * afterAll already defined.
 */
const resetGlobalImage = () => {
  const originalImage = globalThis.Image;
  afterAll(() => {
    globalThis.Image = originalImage;
  });
};

export default { clean, resetGlobalImage };
