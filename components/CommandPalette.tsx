import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tab, UserProfile } from '../types';
import { Icon } from './ui/Icon';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onNavigate: (tab: Tab) => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  userProfile,
  onNavigate,
  onOpenChat,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'chat', label: 'Abrir asistente', description: 'Chat con PAIC IA', icon: 'bot', action: () => { onOpenChat(); onClose(); } },
    { id: 'dashboard', label: 'Ir al Dashboard', description: 'Centro de control', icon: 'dashboard', action: () => { onNavigate(Tab.Dashboard); onClose(); } },
    { id: 'database', label: 'Base de datos', description: 'Residentes, cuentas, proveedores', icon: 'database', action: () => { onNavigate(Tab.Database); onClose(); } },
    { id: 'areas', label: 'Áreas comunes', description: 'Gestionar reservas', icon: 'calendar', action: () => { onNavigate(Tab.CommonAreas); onClose(); } },
    { id: 'comms', label: 'Comunicaciones', description: 'Enviar circulares y emails', icon: 'mail', action: () => { onNavigate(Tab.Comunicaciones); onClose(); } },
    { id: 'finanzas', label: 'Finanzas', description: 'Ingresos y gastos', icon: 'dollarSign', action: () => { onNavigate(Tab.Finanzas); onClose(); } },
    { id: 'seguridad', label: 'Seguridad', description: 'Visitantes y paquetes', icon: 'shield', action: () => { onNavigate(Tab.Seguridad); onClose(); } },
    { id: 'vencimientos', label: 'Vencimientos', description: 'Pagos próximos', icon: 'clock', action: () => { onNavigate(Tab.DueDates); onClose(); } },
    { id: 'tareas', label: 'Tareas', description: 'Pendientes', icon: 'checkSquare', action: () => { onNavigate(Tab.PendingTasks); onClose(); } },
    { id: 'archivos', label: 'Archivos', description: 'Documentos del conjunto', icon: 'file-text', action: () => { onNavigate(Tab.Archivos); onClose(); } },
    { id: 'settings', label: 'Configuración', description: 'Ajustes del perfil y conjunto', icon: 'settings', action: () => { onOpenSettings(); onClose(); } },
  ];

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const executeSelected = useCallback(() => {
    if (filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  }, [filtered, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeSelected();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, executeSelected, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Icon name="key" className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Buscar comandos..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No se encontraron comandos</p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  i === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon name={cmd.icon} className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{cmd.label}</p>
                  <p className="text-xs text-gray-400 truncate">{cmd.description}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
