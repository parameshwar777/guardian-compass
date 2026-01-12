import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FadeIn } from '@/components/animations/MotionWrapper';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuthStore } from '@/store/useStore';
import { assistantApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your SafeTravel AI assistant. I can help you with travel safety tips, location recommendations, and emergency guidance. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuthStore();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (token) {
        const response = await assistantApi.chat(userMessage.content, token);
        // Handle string response
        const responseText = typeof response === 'string' ? response : JSON.stringify(response);
        addAssistantMessage(responseText);
      } else {
        // Demo response
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const demoResponses = [
          "That's a great question! Based on current safety data, I recommend staying in well-lit areas and using verified transportation services.",
          "I can help you with that! For travel safety, always share your location with trusted contacts and keep emergency numbers handy.",
          "Safety first! Make sure to research your destination beforehand and register with your embassy if traveling internationally.",
        ];
        addAssistantMessage(demoResponses[Math.floor(Math.random() * demoResponses.length)]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Speak the response if not muted
    if (!isMuted && 'speechSynthesis' in window) {
      speakText(content);
    }
  };

  const speakText = (text: string) => {
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Not supported',
        description: 'Speech recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: 'Error',
        description: 'Failed to recognize speech. Please try again.',
        variant: 'destructive',
      });
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const suggestions = [
    'Is this area safe?',
    'Find nearby hospitals',
    'Travel safety tips',
    'Emergency contacts',
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="px-4 lg:px-8 py-4 border-b border-border">
          <FadeIn>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center">
                  <Bot className="w-5 h-5 text-success-foreground" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg">AI Assistant</h1>
                  <p className="text-xs text-muted-foreground">Your personal safety guide</p>
                </div>
              </div>
              <motion.button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl transition-colors ${
                  isMuted ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
            </div>
          </FadeIn>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl gradient-success flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-success-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'gradient-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl gradient-success flex items-center justify-center">
                <Bot className="w-4 h-4 text-success-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 lg:px-8 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Quick suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 lg:px-8 py-4 border-t border-border bg-card/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            {/* Voice Button */}
            <motion.button
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-colors ${
                isListening
                  ? 'gradient-accent text-accent-foreground animate-pulse'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </motion.button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="input-field pr-12"
              />
              {isSpeaking && (
                <motion.button
                  onClick={stopSpeaking}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Send Button */}
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl gradient-primary text-primary-foreground disabled:opacity-50"
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assistant;
