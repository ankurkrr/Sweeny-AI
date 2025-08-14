import { sendMessageToBot } from './n8n-api';

declare global {
  interface Window {
    sendMessageToBot: typeof sendMessageToBot;
  }
}

// Make the API function available globally
if (typeof window !== 'undefined') {
  window.sendMessageToBot = sendMessageToBot;
}

export {};
