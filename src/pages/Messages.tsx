import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageSquare, ArrowLeft, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  lastMessage?: string;
  lastMessageTime?: string;
}

const Messages = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatWithId = searchParams.get('chatWith');

  // Fetch chat partners (users who have exchanged messages with current user)
  useEffect(() => {
    if (!user) return;

    const fetchChatPartners = async () => {
      // Get all messages involving the current user
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('receiver_id, content, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id, content, created_at')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      // Get unique partner IDs
      const partnerIds = new Set<string>();
      sentMessages?.forEach(m => partnerIds.add(m.receiver_id));
      receivedMessages?.forEach(m => partnerIds.add(m.sender_id));

      if (partnerIds.size === 0) {
        setLoading(false);
        return;
      }

      // Fetch partner profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(partnerIds));

      const partners: ChatPartner[] = (profiles || []).map(p => {
        const lastSent = sentMessages?.find(m => m.receiver_id === p.id);
        const lastReceived = receivedMessages?.find(m => m.sender_id === p.id);
        
        let lastMessage = '';
        let lastMessageTime = '';
        
        if (lastSent && lastReceived) {
          if (new Date(lastSent.created_at) > new Date(lastReceived.created_at)) {
            lastMessage = lastSent.content;
            lastMessageTime = lastSent.created_at;
          } else {
            lastMessage = lastReceived.content;
            lastMessageTime = lastReceived.created_at;
          }
        } else if (lastSent) {
          lastMessage = lastSent.content;
          lastMessageTime = lastSent.created_at;
        } else if (lastReceived) {
          lastMessage = lastReceived.content;
          lastMessageTime = lastReceived.created_at;
        }

        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          lastMessage,
          lastMessageTime
        };
      });

      // Sort by last message time
      partners.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setChatPartners(partners);
      setLoading(false);
    };

    fetchChatPartners();
  }, [user]);

  // Handle chatWith parameter
  useEffect(() => {
    if (!user || !chatWithId || chatWithId === user.id) return;

    const startChat = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', chatWithId)
        .single();

      if (profile) {
        setActivePartner({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        });
      }
    };

    startChat();
  }, [user, chatWithId]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!user || !activePartner) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activePartner.id}),and(sender_id.eq.${activePartner.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      scrollToBottom();
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === activePartner.id) ||
            (newMsg.sender_id === activePartner.id && newMsg.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activePartner]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activePartner || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: activePartner.id,
        content: messageText,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="py-24 bg-background min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[140px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -z-10" />

      <div className="h-[80vh] flex gap-8 max-w-screen-2xl mx-auto px-6 relative z-10">
        {/* Chat List */}
        <Card className={`w-full md:w-96 rounded-[3rem] border-none shadow-2xl shadow-black/5 overflow-hidden flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur">
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              Chats
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/10">
            {chatPartners.length === 0 && !loading ? (
              <div className="text-center py-20 px-6 space-y-4">
                <div className="h-20 w-20 rounded-[2rem] bg-card flex items-center justify-center mx-auto shadow-xl">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">No chats found</p>
              </div>
            ) : (
              chatPartners.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => setActivePartner(partner)}
                  className={`w-full p-5 rounded-[2rem] flex items-center gap-4 transition-all duration-300 group ${
                    activePartner?.id === partner.id 
                      ? 'bg-background shadow-xl scale-[1.02] ring-1 ring-primary/10' 
                      : 'hover:bg-background/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
                      <AvatarImage src={partner.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">
                        {(partner.full_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                  </div>
                  <div className="flex-1 text-left overflow-hidden space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black tracking-tight truncate">
                        {partner.full_name || 'User'}
                      </p>
                      {partner.lastMessageTime && (
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          {format(new Date(partner.lastMessageTime), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate opacity-70 group-hover:opacity-100 transition-opacity">
                      {partner.lastMessage || 'No messages'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className={`flex-1 rounded-[3rem] border-none shadow-2xl shadow-black/5 overflow-hidden flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
          {activePartner ? (
            <>
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden rounded-2xl" onClick={() => setActivePartner(null)}>
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-lg">
                      <AvatarImage src={activePartner.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/5 text-primary font-black">
                        {(activePartner.full_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black tracking-tight">
                      {activePartner.full_name || 'User'}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-90 shadow-sm border border-border/50">
                    <Phone className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-secondary/5">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-5 rounded-[2rem] text-sm shadow-sm transition-all hover:shadow-md ${
                      msg.sender_id === user?.id 
                        ? 'bg-primary text-primary-foreground rounded-tr-none font-medium' 
                        : 'bg-background border border-border/50 rounded-tl-none font-medium'
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-2 text-right font-black uppercase tracking-widest opacity-50 ${msg.sender_id === user?.id ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t border-border/50 bg-card/50 backdrop-blur">
                <form onSubmit={handleSendMessage} className="flex gap-4 items-center max-w-4xl mx-auto">
                  <div className="relative flex-1 group">
                    <Input 
                      placeholder="Type a message..." 
                      className="h-16 rounded-[2rem] border-none bg-secondary/50 px-8 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base font-medium"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="icon" className="h-16 w-16 rounded-[2rem] shrink-0 shadow-2xl shadow-primary/20 transition-all active:scale-90 bg-primary hover:bg-primary/90">
                    <Send className="h-6 w-6" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8">
              <div className="h-32 w-32 rounded-[3rem] bg-secondary/50 flex items-center justify-center text-primary/20 shadow-inner">
                <MessageSquare className="h-16 w-16" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tighter">Select a Chat</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
                  Start a conversation with a cargo owner or carrier to discuss details
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
