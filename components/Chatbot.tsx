import React, { useState, useRef, useEffect } from 'react';
import { Message, UserProfile, ConjuntoInfo } from '../types';
import { Icon } from './ui/Icon';
import { chatService } from '../services/chatService';
import { marked } from 'marked';
import ChatInput from './chat/ChatInput';

// A simple renderer component defined within the Chatbot component file
// It uses the 'marked' library to parse markdown and Tailwind's prose classes for styling.
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (typeof content !== 'string') {
    console.error('MarkdownRenderer received non-string content:', content);
    return null;
  }
  // marked.parse() converts Markdown string to HTML.
  const rawMarkup = marked.parse(content, { gfm: true, breaks: true });
  return (
    <div
      className="prose prose-sm prose-strong:font-semibold max-w-full"
      dangerouslySetInnerHTML={{ __html: rawMarkup as string }}
    />
  );
};


interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userProfile: UserProfile | null;
  conjuntoInfo: ConjuntoInfo | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen, userProfile, conjuntoInfo }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userProfile && conjuntoInfo && messages.length === 0 && isOpen) {
        setMessages([
            { sender: 'ai', text: `Hola **${userProfile.fullName}**, soy PAIC y te ayudaré a administrar **${conjuntoInfo.name}**.\n\n¿En qué te puedo ayudar hoy?\n\n1. Base de datos\n2. Áreas comunes\n3. Comunicaciones\n4. Finanzas\n5. Seguridad\n6. Vencimientos\n7. Tareas\n\nPuedes elegir una opción o escribir tu solicitud.` }
        ]);
    } else if (!isOpen) {
        setMessages([]);
    }
  }, [userProfile, conjuntoInfo, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (isLoading) return;

    const userMessage: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await chatService.runChat(text, messages);
      const aiMessage: Message = { sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMessage]);

      if (aiResponseText.toLowerCase().includes('confirmado') || aiResponseText.toLowerCase().includes('exitosamente')) {
          window.dispatchEvent(new CustomEvent('data-changed'));
      }

    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = { sender: 'ai', text: 'Lo siento, ocurrió un error al procesar tu solicitud.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerClasses = `
    fixed top-0 h-full bg-white shadow-2xl z-30 flex flex-col font-sans border-r border-gray-200
    transition-all duration-300 ease-in-out
    ${isOpen ? 'left-0 w-full md:w-[30%]' : '-left-full md:-left-[30%] w-full md:w-[30%]'}
  `;

  return (
    <aside className={containerClasses}>
      <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3">
            <Icon name="bot" className="w-8 h-8 text-blue-600" />
            <div>
                <h2 className="text-lg font-bold text-gray-800">Asistente PAIC</h2>
                <p className="text-xs text-green-600 font-semibold">● Conectado</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
          <Icon name="x" className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <Icon name="bot" className="w-8 h-8 p-1.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0" />}
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words ${
                msg.sender === 'ai'
                  ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                  : 'bg-blue-600 text-white rounded-br-none'
              }`}
            >
              {msg.sender === 'user' 
                ? <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                : <MarkdownRenderer content={msg.text} />
              }
            </div>
            {/* FIX: Property 'picture' does not exist on type 'UserProfile'. Use 'avatarUrl' instead. */}
            {msg.sender === 'user' && userProfile && userProfile.avatarUrl && <img src={userProfile.avatarUrl} alt="User" className="w-8 h-8 rounded-full flex-shrink-0" />}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <Icon name="bot" className="w-8 h-8 p-1.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0" />
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-none">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </aside>
  );
};

export default Chatbot;