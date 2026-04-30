import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Loader2, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  name: string;
  role: string;
}

const roleLabel: Record<string, string> = {
  manager: 'Gestor',
  driver: 'Motorista',
  parent: 'Pai/Mãe',
  student: 'Aluno',
};

const roleColor: Record<string, string> = {
  manager: 'bg-purple-100 text-purple-700',
  driver: 'bg-blue-100 text-blue-700',
  parent: 'bg-green-100 text-green-700',
  student: 'bg-orange-100 text-orange-700',
};

const avatarColor: Record<string, string> = {
  manager: 'bg-purple-500',
  driver: 'bg-blue-500',
  parent: 'bg-green-500',
  student: 'bg-orange-500',
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

const Chat = () => {
  const { user, profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carregar todos os profiles (exceto o próprio)
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('id, name, role').neq('id', user.id)
      .then(({ data }) => setProfiles(data as Profile[] ?? []));
  }, [user]);

  // Carregar conversas
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('updated_at', { ascending: false });
      if (!error) setConversations(data as Conversation[] ?? []);
      setLoading(false);
    };
    load();

    const channel = supabase.channel('conversations_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, load)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [user]);

  // Carregar mensagens da conversa selecionada
  useEffect(() => {
    if (!selectedConv) return;
    setMessages([]);

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConv)
        .order('created_at', { ascending: true });
      if (!error) setMessages(data as Message[] ?? []);
    };
    load();

    const channel = supabase.channel(`messages:${selectedConv}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [selectedConv]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [newMessage]);

  const getOtherParticipantId = useCallback((conv: Conversation) =>
    conv.participants.find(p => p !== user?.id), [user]);

  const getProfile = useCallback((id: string) =>
    profiles.find(p => p.id === id), [profiles]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user || !profile) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const { data: inserted, error } = await supabase.from('messages').insert({
      conversation_id: selectedConv,
      content,
      sender_id: user.id,
      sender_name: profile.name,
      sender_role: profile.role,
    }).select().single();

    if (error) {
      toast.error('Erro ao enviar mensagem.');
    } else {
      // Adicionar localmente com o ID real — o realtime vai ignorar pois já existe
      setMessages(prev => prev.some(m => m.id === inserted.id) ? prev : [...prev, inserted as Message]);
      await supabase.from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConv);
    }
    setSending(false);
  };

  const startConversation = async (participantId: string) => {
    if (!user) return;
    setShowNewChat(false);

    // Verificar se já existe conversa
    const existing = conversations.find(c =>
      c.participants.includes(participantId) && c.participants.includes(user.id)
    );
    if (existing) {
      setSelectedConv(existing.id);
      return;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({ participants: [user.id, participantId] })
      .select().single();

    if (error) { toast.error('Erro ao criar conversa.'); return; }
    setConversations(prev => [data as Conversation, ...prev]);
    setSelectedConv(data.id);
  };

  const selectedConvObj = conversations.find(c => c.id === selectedConv);
  const otherParticipantId = selectedConvObj ? getOtherParticipantId(selectedConvObj) : null;
  const otherProfile = otherParticipantId ? getProfile(otherParticipantId) : null;

  if (loading) {
    return (
      <Layout title="Chat">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chat">
      <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

        {/* Sidebar — lista de conversas */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Mensagens</h2>
              <p className="text-xs text-gray-400">{conversations.length} conversa{conversations.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setShowNewChat(v => !v)}
              className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              title="Nova conversa"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Painel nova conversa */}
          <AnimatePresence>
            {showNewChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-gray-100 bg-white overflow-hidden"
              >
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Iniciar conversa com</p>
                {profiles.length === 0 ? (
                  <p className="px-4 pb-3 text-sm text-gray-400">Nenhum utilizador disponível.</p>
                ) : (
                  profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => startConversation(p.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${avatarColor[p.role] ?? 'bg-gray-400'}`}>
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{roleLabel[p.role] ?? p.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de conversas */}
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                <MessageSquare className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Nenhuma conversa ainda.<br />Clica em + para começar.</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherId = getOtherParticipantId(conv);
                const other = otherId ? getProfile(otherId) : null;
                const isSelected = selectedConv === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-colors text-left ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-white'}`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${avatarColor[other?.role ?? ''] ?? 'bg-gray-300'}`}>
                      {other ? getInitials(other.name) : '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {other?.name ?? 'Desconhecido'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{roleLabel[other?.role ?? ''] ?? '—'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Área principal de chat */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv && otherProfile ? (
            <>
              {/* Header da conversa */}
              <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-shrink-0">
                <button
                  className="md:hidden text-gray-500 hover:text-gray-700 mr-1"
                  onClick={() => setSelectedConv(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${avatarColor[otherProfile.role] ?? 'bg-gray-400'}`}>
                  {getInitials(otherProfile.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{otherProfile.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[otherProfile.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {roleLabel[otherProfile.role] ?? otherProfile.role}
                  </span>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto bg-[#f0f4f8] px-4 py-4" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Nenhuma mensagem ainda. Começa a conversa!
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                              {!isOwn && (
                                <span className="text-xs text-gray-400 mb-1 ml-1">{msg.sender_name}</span>
                              )}
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isOwn
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                              }`}>
                                {msg.content}
                              </div>
                              <span className="text-[11px] text-gray-400 mt-1 mx-1">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <form
                onSubmit={handleSend}
                className="px-4 py-3 bg-white border-t border-gray-100 flex items-end gap-2 flex-shrink-0"
              >
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as any);
                    }
                  }}
                  placeholder="Escreve uma mensagem..."
                  rows={1}
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all overflow-hidden"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          ) : (
            /* Estado vazio — nenhuma conversa selecionada */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-[#f0f4f8]">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-base font-semibold text-gray-700">Bem-vindo ao Chat</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">Seleciona uma conversa ou clica em + para iniciar uma nova.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
