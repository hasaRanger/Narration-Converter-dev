/**
 * Simple logger utility
 * Uses named export so it works with:
 * import { log } from "../utils/logger.js";
 */

export const log = {
  info: (message) => {
    console.log(`[INFO] ${message}`);
  },

  warn: (message) => {
    console.warn(`[WARN] ${message}`);
  },

  error: (message) => {
    console.error(`[ERROR] ${message}`);
  }
};
