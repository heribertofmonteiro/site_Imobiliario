import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import type { ImovelComExtras } from "@/types/imovel";

/**
 * Flexible interface for API response that may have nullable fields
 */
interface ApiImovel {
    id: number;
    titulo: string;
    descricao: string;
    valorAluguel: string | number;
    tipoImovelId: number;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
    status: string;
    desconto: number | null;
    dataPublicacao: Date | string | null;
    seoSlug: string;
    imagemPrincipal: string | null;
    quartos: number | null;
    banheiros: number | null;
    areaTotal: number | null;
    ativo: boolean | null;
    visualizacoes: number | null;
    distancia?: number;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    suggestions?: ApiImovel[];
}

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export default function SmartAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Olá! Sou seu assistente Aura. Como posso te ajudar a encontrar o imóvel perfeito hoje? Você pode me dizer o que procura, como 'apartamento moderno com piscina no Itaim'.",
        },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const aiMutation = trpc.search.aiSearch.useMutation();

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = async () => {
        if (!input.trim() || aiMutation.isPending) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        try {
            const response = await aiMutation.mutateAsync({ prompt: userMessage });
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.message,
                    suggestions: response.imoveis as ApiImovel[],
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Desculpe, tive um problema ao processar sua solicitação. Pode tentar novamente?",
                },
            ]);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center relative group overflow-hidden"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="w-8 h-8" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sparkle"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                            >
                                <Sparkles className="w-8 h-8" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-28 right-8 z-50 w-[400px] h-[600px] glass rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-none"
                    >
                        {/* Header */}
                        <div className="p-6 bg-primary text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">Assistente Aura</h3>
                                <p className="text-[10px] text-white/60 uppercase tracking-widest font-black">
                                    Inteligência Artificial
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl ${msg.role === "user"
                                            ? "bg-accent text-white rounded-tr-none"
                                            : "bg-white/50 text-primary rounded-tl-none"
                                            }`}
                                    >
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>

                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                                                    Sugestões encontradas:
                                                </p>
                                                {msg.suggestions.map((imovel: ApiImovel) => (
                                                    <Link key={imovel.id} href={`/imovel/${imovel.id}`}>
                                                        <div className="bg-white p-2 rounded-xl flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                                                            <img
                                                                src={imovel.imagemPrincipal || DEFAULT_IMAGE}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                                alt={imovel.titulo}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-primary truncate">
                                                                    {imovel.titulo}
                                                                </p>
                                                                <p className="text-[10px] text-accent font-black">
                                                                    {formatPrice(imovel.valorAluguel)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {aiMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-white/50 p-4 rounded-2xl rounded-tl-none">
                                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white/30 backdrop-blur-md border-t border-white/20">
                            {messages.length === 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                                    {[
                                        "Apartamento em Tokyo",
                                        "Casa em Osaka",
                                        "Até ¥ 150.000",
                                        "Próximo ao metrô",
                                    ].map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => {
                                                setInput(prompt);
                                                // Automatic send or just set input? Let's just set input
                                            }}
                                            className="whitespace-nowrap bg-white text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-gray-100 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="relative">
                                <Input
                                    placeholder="Como posso ajudar?"
                                    className="pr-12 py-6 rounded-2xl bg-white border-none shadow-inner"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "enter" && handleSend()}
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary hover:bg-primary/90"
                                    onClick={handleSend}
                                    disabled={aiMutation.isPending}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
