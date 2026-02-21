import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiSend, FiPaperclip, FiImage, FiSmile, FiX } from 'react-icons/fi';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
  conversation_id: string;
  is_read: boolean;
  file_url?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    name?: string;
    role?: string;
  };
}

interface UserStatus {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar conversas do usuário
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data: userConversations, error } = await supabase
          .from('conversations')
          .select('*')
          .contains('participants', [user.id]);

        if (error) throw error;

        setConversations(userConversations as Conversation[]);
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        toast.error("Não foi possível carregar as conversas.", {
          description: "Ocorreu um erro ao buscar suas conversas. Tente novamente mais tarde."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Carregar mensagens da conversa selecionada
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: conversationMessages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation)
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(conversationMessages as Message[]);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast.error("Não foi possível carregar as mensagens.", {
          description: "Houve um problema ao buscar as mensagens desta conversa."
        });
      }
    };

    fetchMessages();

    // Inscrever-se para novas mensagens em tempo real
    const channel = supabase.channel(`chat:${selectedConversation}`, {
      config: {
        broadcast: { self: true }
      }
    });

    channel
      .on('postgres_changes', {
        event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation}`
      }, async (payload) => {
        console.log('Realtime: Evento recebido para messages:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          console.log('Realtime: Nova mensagem recebida:', newMessage);
          
          // Buscar a mensagem completa do banco para garantir que temos todos os dados
          const { data: messageData, error } = await supabase
            .from('messages')
            .select('*')
            .eq('id', newMessage.id)
            .single();

          if (error) {
            console.error('Erro ao buscar mensagem completa:', error);
            return;
          }

          setMessages(current => {
            const messageExists = current.some(msg => msg.id === messageData.id);
            if (messageExists) {
              return current;
            }
            return [...current, messageData];
          });
        }
      })
      .subscribe((status) => {
        console.log('Status da inscrição do chat:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversation]);

  // Carregar participantes
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;

        const formattedParticipants = (profiles || [])
          .filter(p => p.id !== user?.id)
          .map(p => ({
            id: p.id,
            email: p.email || '',
            user_metadata: {
              full_name: p.full_name || '',
              name: p.name || '',
              role: p.role || p.user_role || ''
            }
          }));

        setParticipants(formattedParticipants);
      } catch (error) {
        console.error('Erro ao carregar participantes:', error);
        toast.error("Não foi possível carregar os participantes.", {
          description: "Não conseguimos obter a lista de usuários para iniciar conversas."
        });
      }
    };

    if (user) {
      fetchParticipants();
    }
  }, [user]);

  // Rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função para atualizar o status do usuário
  const updateUserStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Atualizar status quando o usuário entra/sai
  useEffect(() => {
    if (!user) return;

    // Atualizar status para online quando o componente monta
    updateUserStatus(true);

    // Atualizar status para offline quando o usuário sai
    const handleBeforeUnload = () => {
      updateUserStatus(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateUserStatus(false);
    };
  }, [user]);

  // Inscrever-se para atualizações de status em tempo real
  useEffect(() => {
    const fetchUserStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('user_status')
          .select('*');

        if (error) throw error;

        const statuses: Record<string, UserStatus> = {};
        data.forEach(s => statuses[s.user_id] = s);
        setUserStatuses(statuses);
      } catch (error) {
        console.error('Erro ao buscar status de usuários:', error);
      }
    };

    fetchUserStatuses();

    const channel = supabase.channel('user_status_changes', {
      config: { broadcast: { self: true } }
    });

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_status',
      }, (payload) => {
        const newStatus = payload.new as UserStatus;
        setUserStatuses(prev => ({
          ...prev,
          [newStatus.user_id]: newStatus
        }));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Função para verificar se um usuário está online
  const isUserOnline = (userId: string) => {
    const status = userStatuses[userId];
    if (!status) return false;

    // Considerar offline se não foi visto nos últimos 30 segundos
    const lastSeen = new Date(status.last_seen);
    const now = new Date();
    const diffInSeconds = (now.getTime() - lastSeen.getTime()) / 1000;

    return status.is_online && diffInSeconds < 30;
  };

  // Função para formatar o último visto
  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('chat-files')
          .upload(fileName, selectedFile);

        if (fileError) throw fileError;
        fileUrl = fileData?.path;
      }

      const { error } = await supabase.from('messages').insert([
        {
          conversation_id: selectedConversation,
          content: newMessage,
          sender_id: user?.id,
          sender_name: user?.user_metadata?.name || 'Usuário',
          sender_role: user?.user_metadata?.role || 'user',
          file_url: fileUrl,
        },
      ]).select().single();

      if (error) throw error;

      // Adicionar a mensagem localmente imediatamente
      if (error) throw error;

      setNewMessage('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsTyping(false);
      if (typingTimeout) clearTimeout(typingTimeout);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Não foi possível enviar a mensagem.", {
        description: "Sua mensagem não pôde ser entregue. Verifique sua conexão."
      });
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => setIsTyping(false), 2000));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startNewConversation = async (participantId: string) => {
    if (!user) return;

    if (participantId === 'new') {
      // Permitir que o usuário selecione um participante para iniciar uma nova conversa
      // Por simplicidade, vamos selecionar o primeiro participante disponível que não seja o usuário atual
      const availableParticipant = participants.find(p => p.id !== user.id);
      if (availableParticipant) {
        const existingConversation = conversations.find(conv =>
          conv.participants.includes(user.id) && conv.participants.includes(availableParticipant.id)
        );

        if (existingConversation) {
          setSelectedConversation(existingConversation.id);
        } else {
          try {
            const { data, error } = await supabase
              .from('conversations')
              .insert({
                participants: [user.id, availableParticipant.id]
              })
              .select()
              .single();

            if (error) throw error;

            setConversations(prev => [...prev, data]);
            setSelectedConversation(data.id);
          } catch (error) {
            console.error('Erro ao iniciar nova conversa:', error);
            toast.error("Não foi possível iniciar uma nova conversa.", {
              description: "Ocorreu um problema ao criar a nova conversa. Tente novamente."
            });
          }
        }
      } else {
        toast.info("Não há outros usuários disponíveis para conversar.", {
          description: "Você é o único usuário registrado no momento."
        });
      }
    } else {
      setSelectedConversation(participantId);
    }
  };

  const getParticipantName = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return 'Desconhecido';
    const otherParticipantId = conversation.participants.find(p => p !== user?.id);
    const otherParticipant = participants.find(p => p.id === otherParticipantId);
    return otherParticipant?.user_metadata?.full_name || otherParticipant?.user_metadata?.name || 'Desconhecido';
  };

  const getParticipantRole = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return 'Desconhecido';
    const otherParticipantId = conversation.participants.find(p => p !== user?.id);
    const otherParticipant = participants.find(p => p.id === otherParticipantId);
    return otherParticipant?.user_metadata?.role || 'Desconhecido';
  };

  const renderMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

    if (messageDay.getTime() === today.getTime()) {
      return `Hoje às ${messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (messageDay.getTime() === yesterday.getTime()) {
      return `Ontem às ${messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  const renderUserStatus = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return 'Offline';
    const otherParticipantId = conversation.participants.find(p => p !== user?.id);
    if (!otherParticipantId) return 'Offline';

    const isOnline = isUserOnline(otherParticipantId);
    const lastSeenFormatted = formatLastSeen(userStatuses[otherParticipantId]?.last_seen || '');

    return isOnline ? 'Online' : `Visto ${lastSeenFormatted}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <Layout title="Chat">
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="ml-3 text-lg text-gray-600">Carregando chat...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chat">
      <div className="flex h-[calc(100vh-80px)] bg-gray-50 rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {/* Left Pane: Conversations List - design profissional */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`w-full md:w-1/3 bg-white flex flex-col ${
            selectedConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
            <Button size="sm" onClick={() => startNewConversation('new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Nova Conversa
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500 text-center mt-8">Nenhuma conversa ainda.</p>
            ) : (
              conversations.map(conversation => {
                const otherParticipant = participants.find(p => p.id !== user?.id && conversation.participants.includes(p.id));
                if (!otherParticipant) return null;

                const isOnline = isUserOnline(otherParticipant.id);
                const lastSeenFormatted = formatLastSeen(userStatuses[otherParticipant.id]?.last_seen || '');

                return (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.user_metadata.full_name || otherParticipant.user_metadata.name}`} />
                        <AvatarFallback className="bg-gray-100 text-gray-700">
                          {otherParticipant.user_metadata.full_name?.charAt(0) || otherParticipant.user_metadata.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-800">{otherParticipant.user_metadata.full_name || otherParticipant.user_metadata.name}</p>
                      <p className="text-sm text-gray-500">{otherParticipant.user_metadata.role}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {isOnline ? 'Online' : lastSeenFormatted}
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </motion.div>

        {/* Right Pane: Chat Window - design profissional */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 flex flex-col bg-white ${
            selectedConversation ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center bg-white sticky top-0 z-10 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-9 w-9 ring-2 ring-blue-300">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getParticipantName(selectedConversation)}`} />
                  <AvatarFallback className="bg-gray-100 text-gray-700">
                    {getParticipantName(selectedConversation)?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">{getParticipantName(selectedConversation)}</p>
                  <p className="text-sm text-gray-500">
                    {renderUserStatus(selectedConversation)}
                  </p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4 md:space-y-6">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-sm transition-all ${
                            message.sender_id === user?.id
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white rounded-bl-md border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <span className="font-semibold text-xs md:text-sm">
                              {message.sender_name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full ${
                              message.sender_id === user?.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {message.sender_role}
                            </span>
                          </div>
                          <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                          <div className={`mt-1 md:mt-2 text-xs ${message.sender_id === user?.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {renderMessageDate(message.created_at)}
                          </div>
                          {message.file_url && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/chat-files/${message.file_url}`}
                                alt="Arquivo anexado"
                                className="max-w-full h-auto rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-gray-200 bg-white flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Digite sua mensagem..."
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[60px] max-h-[120px] transition-all"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim() && !selectedFile}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  <FiSend className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-lg p-4">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl font-semibold text-gray-700">Bem-vindo ao Chat!</p>
              <p className="text-md text-gray-500 mt-2 text-center">Selecione uma conversa ao lado ou inicie uma nova para começar a interagir.</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Chat; 