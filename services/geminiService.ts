import { chatService } from './chatService';
import { UserProfile, ConjuntoInfo, Message } from '../types';

// Deprecate warning helper
export function deprecationWarning() {
  console.warn(
    '[DEPRECATED] geminiService.ts is deprecated and will be removed in a future release. ' +
    'Please import and use chatService.ts instead.'
  );
}

const runChat = async (
  prompt: string,
  userProfile: UserProfile | null,
  conjuntoInfo: ConjuntoInfo | null,
  initialAiMessage?: string
): Promise<string> => {
  deprecationWarning();
  
  // Construct a temporary history with the initial welcome message if provided
  const history: Message[] = initialAiMessage ? [{ sender: 'ai', text: initialAiMessage }] : [];
  return chatService.runChat(prompt, history);
};

const generateSubject = async (body: string): Promise<string> => {
  deprecationWarning();
  return chatService.generateSubject(body);
};

const improveWriting = async (body: string): Promise<string> => {
  deprecationWarning();
  return chatService.improveWriting(body);
};

export const geminiService = {
  runChat,
  generateSubject,
  improveWriting,
};
export default geminiService;
