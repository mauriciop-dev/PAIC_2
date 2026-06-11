import fs from 'fs';
import path from 'path';

let defaultPromptTemplate: string | null = null;

const getDefaultPromptTemplate = (): string => {
  if (defaultPromptTemplate) return defaultPromptTemplate;
  try {
    const filePath = path.join(process.cwd(), 'src', 'prompts', 'system_prompt.txt');
    if (fs.existsSync(filePath)) {
      defaultPromptTemplate = fs.readFileSync(filePath, 'utf-8');
    } else {
      throw new Error(`File not found at ${filePath}`);
    }
  } catch (error) {
    console.error('Failed to read default system prompt file, using fallback:', error);
    // Minimal fallback in case of filesystem issues in Vercel Serverless
    defaultPromptTemplate = `--- REGLA DE ORO ---
You are PAIC, an intelligent assistant for managing the residential complex: "{{conjuntoName}}".
Your user is the administrator, {{userName}}. Today's date is {{currentDate}}.
Always be friendly, helpful, and professional.`;
  }
  return defaultPromptTemplate;
};

export function buildSystemPrompt(
  conjuntoName: string,
  userName: string,
  customPrompt: string | null,
  tone: string = 'formal'
): string {
  const template = customPrompt || getDefaultPromptTemplate();
  const formattedDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let prompt = template
    .replace(/{{userName}}/g, userName || 'Usuario')
    .replace(/{{conjuntoName}}/g, conjuntoName || 'Conjunto')
    .replace(/{{currentDate}}/g, formattedDate);

  // Inject tone rules dynamically
  const toneInstruction = `\n\n--- REGLA DE TONO (EJECUCIÓN ESTRICTA) ---\nResponde SIEMPRE en el tono: ${tone} (formal, amigable, técnico). Ajusta tu vocabulario y cortesía según esta directriz.`;
  prompt += toneInstruction;

  return prompt;
}
