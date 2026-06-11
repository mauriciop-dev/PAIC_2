import { chatService } from '../chatService';
import { Message } from '../../types';

console.warn(
  '[DEPRECATED] services/ai/gemini-legacy.ts will be removed in v2.0. ' +
  'Import from services/chatService.ts instead.'
);

async function runChat(
  prompt: string,
  history: Message[] = []
): Promise<string> {
  return chatService.runChat(prompt, history);
}

async function generateSubject(body: string): Promise<string> {
  return chatService.generateSubject(body);
}

async function improveWriting(body: string): Promise<string> {
  return chatService.improveWriting(body);
}

export const geminiLegacy = {
  runChat,
  generateSubject,
  improveWriting,
};

export default geminiLegacy;
