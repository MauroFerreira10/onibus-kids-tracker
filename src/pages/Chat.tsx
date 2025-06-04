import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.svg';

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
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});

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
        toast({
          title: "Erro",
          description: "Não foi possível carregar as conversas.",
          variant: "destructive"
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
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens.",
          variant: "destructive"
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
        toast({
          title: "Erro",
          description: "Não foi possível carregar os participantes.",
          variant: "destructive"
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
    const channel = supabase.channel('user_status_changes');

    channel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_status'
      }, (payload) => {
        const status = payload.new as UserStatus;
        setUserStatuses(current => ({
          ...current,
          [status.user_id]: status
        }));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Carregar status iniciais dos usuários
  useEffect(() => {
    const fetchUserStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('user_status')
          .select('*');

        if (error) throw error;

        const statusMap = (data || []).reduce((acc, status) => ({
          ...acc,
          [status.user_id]: status
        }), {});

        setUserStatuses(statusMap);
      } catch (error) {
        console.error('Erro ao carregar status dos usuários:', error);
      }
    };

    fetchUserStatuses();
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
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const messageData = {
        conversation_id: selectedConversation,
        content: newMessage.trim(),
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
        sender_role: user.user_metadata?.role || 'user'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Adicionar a mensagem localmente imediatamente
      if (data) {
        setMessages(current => [...current, data]);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive"
      });
    }
  };

  const startNewConversation = async (participantId: string) => {
    if (!user) return;

    try {
      // Verificar se já existe uma conversa com este participante
      const { data: existingConversations, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id, participantId]);

      if (searchError) throw searchError;

      // Se já existe uma conversa, seleciona ela
      if (existingConversations && existingConversations.length > 0) {
        setSelectedConversation(existingConversations[0].id);
        return;
      }

      // Criar nova conversa
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participants: [user.id, participantId],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      if (newConversation) {
        setConversations(current => [...current, newConversation as Conversation]);
        setSelectedConversation(newConversation.id);
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa.",
        variant: "destructive"
      });
    }
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.user_metadata.full_name || participant?.user_metadata.name || 'Usuário Desconhecido';
  };

  const getParticipantRole = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.user_metadata.role || 'Papel Desconhecido';
  };

  // Adicionar um indicador visual de que as mensagens são do dia atual
  const renderMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const isToday = 
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    return (
      <span className="text-xs opacity-70 mt-1 block">
        {isToday ? 'Hoje' : messageDate.toLocaleDateString()} às {messageDate.toLocaleTimeString()}
      </span>
    );
  };

  // Atualizar o renderizador de status nas conversas
  const renderUserStatus = (userId: string) => {
    const isOnline = isUserOnline(userId);
    const status = userStatuses[userId];

    return (
      <div className="flex items-center gap-2">
        <span className={`inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
          isOnline ? 'bg-green-400' : 'bg-gray-400'
        }`}></span>
        <span className="text-xs text-gray-600">
          {isOnline ? 'Online' : `Visto por último ${formatLastSeen(status?.last_seen || '')}`}
        </span>
      </div>
    );
  };

  return (
    <Layout title="Chat">
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Lista de conversas - Escondida em mobile quando chat está aberto */}
        <div className={`w-full md:w-1/4 border-r border-blue-100 bg-white/80 backdrop-filter backdrop-blur-lg flex flex-col shadow-2xl ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Cabeçalho */}
          <div className="p-4 md:p-6 border-b border-blue-100 bg-white/90 flex items-center gap-3 md:gap-4 shadow-sm">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <img src={logo} alt="SafeBus" className="h-8 w-8 md:h-10 md:w-10 animate-pulse" />
                <div className="absolute -top-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#1877f2] via-[#33C3F0] to-[#6366f1] bg-clip-text text-transparent">SafeBus Chat</h2>
                <p className="text-xs text-gray-500">Comunicação em tempo real</p>
              </div>
            </div>
          </div>

          {/* Lista de conversas */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
            {conversations.map((conversation) => {
              const otherParticipantId = conversation.participants.find(id => id !== user?.id);
              const isSelected = selectedConversation === conversation.id;
              return (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#e7f3ff] to-blue-50 border-[#1877f2] shadow-lg scale-[1.02]' 
                      : 'bg-white/80 hover:bg-blue-50/80 border-blue-100 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative">
                        <Avatar className={`h-10 w-10 md:h-14 md:w-14 border-2 ${isSelected ? 'border-[#1877f2] ring-2 ring-[#1877f2]/20' : 'border-blue-100'}`}>
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${getParticipantName(otherParticipantId || '').replace(/ /g, '+')}&background=1877f2&color=fff`} />
                          <AvatarFallback className={`bg-gradient-to-br from-[#1877f2] to-[#33C3F0] text-white text-base md:text-lg ${isSelected ? 'ring-2 ring-[#1877f2]' : ''}`}>
                            {getParticipantName(otherParticipantId || '').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-white ${
                          isUserOnline(otherParticipantId || '') ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm md:text-base">
                          {getParticipantName(otherParticipantId || '')}
                        </p>
                        {renderUserStatus(otherParticipantId || '')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Lista de participantes para nova conversa */}
          <div className="border-t border-blue-100 bg-white/90 p-4 md:p-6 shadow-inner">
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-[#1877f2] via-[#33C3F0] to-[#6366f1] bg-clip-text text-transparent mb-3 md:mb-4">Iniciar nova conversa</h3>
            <div className="space-y-2 md:space-y-3 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-2">
              {participants.map((participant) => (
                <Card
                  key={participant.id}
                  className="cursor-pointer bg-white/80 hover:bg-blue-50/80 transition-all duration-200 border border-blue-100 shadow-sm hover:shadow-md hover:scale-[1.02]"
                  onClick={() => startNewConversation(participant.id)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-blue-100">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${(participant.user_metadata.full_name || participant.user_metadata.name || '').replace(/ /g, '+')}&background=1877f2&color=fff&size=40`} />
                          <AvatarFallback className="bg-gradient-to-br from-[#1877f2] to-[#33C3F0] text-white text-base">
                            {(participant.user_metadata.full_name?.charAt(0) || participant.user_metadata.name?.charAt(0))}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm md:text-base">
                          {participant.user_metadata.full_name || participant.user_metadata.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 truncate flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400"></span>
                          {participant.user_metadata.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col bg-gradient-to-tl from-blue-50 via-indigo-50 to-purple-50">
          {selectedConversation ? (
            <>
              {/* Cabeçalho do chat */}
              <div className="p-4 md:p-6 border-b border-blue-100 bg-white/90 flex items-center gap-3 md:gap-4 shadow-md backdrop-filter backdrop-blur-lg">
                {/* Botão voltar (apenas mobile) */}
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="relative">
                  <Avatar className="h-10 w-10 md:h-14 md:w-14 border-2 border-[#1877f2] ring-2 ring-[#1877f2]/20">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${getParticipantName(conversations.find(conv => conv.id === selectedConversation)?.participants.find(id => id !== user?.id) || '').replace(/ /g, '+')}&background=1877f2&color=fff&size=40`} />
                    <AvatarFallback className="bg-gradient-to-br from-[#1877f2] to-[#33C3F0] text-white ring-2 ring-[#1877f2]">
                      {getParticipantName(conversations.find(conv => conv.id === selectedConversation)?.participants.find(id => id !== user?.id) || '').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 md:h-4 md:w-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-base md:text-lg">
                    {getParticipantName(conversations.find(conv => conv.id === selectedConversation)?.participants.find(id => id !== user?.id) || '')}
                  </p>
                  {renderUserStatus(conversations.find(conv => conv.id === selectedConversation)?.participants.find(id => id !== user?.id) || '')}
                </div>
              </div>

              {/* Área de mensagens */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <div className="text-center">
                    <img 
                      src={logo} 
                      alt="SafeBus Logo" 
                      className="w-48 h-48 md:w-64 md:h-64 mb-2 object-contain"
                    />
                  </div>
                </div>
                <ScrollArea className="h-full pr-3 md:pr-4">
                  <div className="space-y-4 md:space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-lg transition-all duration-200 ${
                            message.sender_id === user?.id
                              ? 'bg-gradient-to-tr from-[#0084ff] to-[#1877f2] text-white rounded-br-none'
                              : 'bg-white rounded-bl-none border border-blue-100 backdrop-filter backdrop-blur-lg bg-opacity-90'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <span className="font-semibold text-xs md:text-sm">
                              {message.sender_name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full ${
                              message.sender_id === user?.id
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {message.sender_role}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm leading-relaxed">{message.content}</p>
                          <div className={`mt-1 md:mt-2 text-xs ${message.sender_id === user?.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {renderMessageDate(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Área de input */}
              <div className="border-t border-blue-100 bg-white/90 p-4 md:p-6 shadow-lg backdrop-filter backdrop-blur-lg">
                <form onSubmit={handleSendMessage} className="flex gap-3 md:gap-4">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 rounded-full bg-gray-50/80 border-blue-100 focus:border-[#1877f2] focus:ring-[#1877f2] transition-all duration-200 pl-4 md:pl-6 pr-4 md:pr-6 text-sm md:text-base"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-gradient-to-r from-[#1877f2] to-[#33C3F0] hover:from-[#166fe5] hover:to-[#2eaae0] text-white shadow-md transition-all duration-200 h-10 w-10 md:h-12 md:w-12 p-0"
                  >
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center opacity-80">
                <img src={logo} alt="SafeBus" className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 md:mb-6 object-contain animate-pulse" />
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-[#1877f2] via-[#33C3F0] to-[#6366f1] bg-clip-text text-transparent">Bem-vindo ao Chat SafeBus</h2>
                <p className="text-sm md:text-base text-gray-500">Selecione uma conversa para começar a interagir</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat; 