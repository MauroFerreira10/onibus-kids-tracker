import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Paperclip,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
  file_url?: string | null;
}

interface ChatProps {
  conversationId: string;
  onClose: () => void;
}

export default function Chat({ conversationId, onClose }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError('Erro ao carregar mensagens');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user) return;

    setIsSending(true);
    try {
      let fileUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('message-files')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        fileUrl = data?.path;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: newMessage.trim(),
          sender_id: user.id,
          sender_name: user.user_metadata?.name || 'Usuário',
          sender_role: user.user_metadata?.role || 'user',
          file_url: fileUrl
        });

      if (error) throw error;

      setNewMessage('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError('Erro ao enviar mensagem');
      console.error('Erro:', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white font-semibold">C</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Conversa</h2>
              <p className="text-sm text-gray-500">ID: {conversationId}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/logo.png" alt="Logo" className="w-64 h-64 object-contain" />
        </div>

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex flex-col max-w-[80%]",
                message.sender_id === user?.id ? "ml-auto" : "mr-auto"
              )}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-gray-500">
                  {message.sender_name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 shadow-sm",
                  message.sender_id === user?.id
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                    : "bg-white/80 backdrop-blur-lg border border-gray-200/50"
                )}
              >
                {message.file_url && (
                  <div className="mb-2">
                    <img
                      src={`${supabase.storage.from('message-files').getPublicUrl(message.file_url).data.publicUrl}`}
                      alt="Imagem"
                      className="rounded-lg max-w-full h-auto shadow-md"
                    />
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-4 shadow-lg">
        {previewUrl && (
          <div className="relative mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-lg max-h-32 object-cover shadow-md"
            />
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-gray-100 rounded-full transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-2 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={isSending || (!newMessage.trim() && !selectedFile)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:opacity-90 transition-all disabled:opacity-50 shadow-md"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 right-4 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
} 