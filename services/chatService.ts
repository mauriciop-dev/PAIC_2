import { insforge } from './insforgeClient';
import { Message } from '../types';

export const chatService = {
  async runChat(message: string, history: Message[]): Promise<string> {
    const headers = insforge.getHttpClient().getHeaders();
    const token = headers['Authorization']?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No active authenticated session found. Please log in.');
    }

    // Convert frontend Message history format to backend format
    const formattedHistory = history.map(h => ({
      sender: h.sender,
      text: h.text
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        history: formattedHistory,
        mode: 'chat'
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to communicate with the assistant.');
    }

    const data = await response.json();
    return data.message;
  },

  async generateSubject(body: string): Promise<string> {
    const headers = insforge.getHttpClient().getHeaders();
    const token = headers['Authorization']?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No active authenticated session found.');
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: body,
        mode: 'generate-subject'
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to generate subject.');
    }

    const data = await response.json();
    return data.message;
  },

  async improveWriting(body: string): Promise<string> {
    const headers = insforge.getHttpClient().getHeaders();
    const token = headers['Authorization']?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No active authenticated session found.');
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: body,
        mode: 'improve-writing'
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to improve writing.');
    }

    const data = await response.json();
    return data.message;
  }
};
export default chatService;
