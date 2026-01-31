import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

const BLOG_POSTS = [
    {
        id: 1,
        title: "Dicas para Alugar em Tokyo: Guia de Bairros",
        excerpt: "Descubra os melhores bairros de Tokyo para estrangeiros e entenda o custo de vida em cada região.",
        author: "Sato Kenji",
        date: "20 Jan 2026",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
        category: "Guia"
    },
    {
        id: 2,
        title: "Como Funciona o Reishin e Shikikin no Japão",
        excerpt: "Entenda as taxas iniciais do mercado imobiliário japonês e como economizar na mudança.",
        author: "Tanaka Yuki",
        date: "18 Jan 2026",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
        category: "Dicas"
    },
    {
        id: 3,
        title: "Tendências para Apartamentos 'Smart' em 2026",
        excerpt: "A tecnologia nos J-Danchi e nos novos empreendimentos em Osaka e Kyoto.",
        author: "Carlos Santos",
        date: "15 Jan 2026",
        image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80",
        category: "Tecnologia"
    }
];

export default function Blog() {
    const [, navigate] = useLocation();

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="glass sticky top-0 z-50 border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-black text-primary flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-accent" />
                            Blog AuraProps
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-primary mb-4">
                        Conteúdo Especializado
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Fique por dentro das últimas notícias, dicas e tendências do mercado imobiliário.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-sm h-full hover:shadow-2xl transition-all cursor-pointer group">
                                <div className="relative overflow-hidden h-48">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {post.author}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl text-primary mb-3 group-hover:text-accent transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        {post.excerpt}
                                    </p>
                                    <Button variant="link" className="p-0 text-accent font-bold group-hover:translate-x-2 transition-transform">
                                        Ler Artigo Completo →
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
