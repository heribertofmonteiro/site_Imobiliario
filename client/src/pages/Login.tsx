import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, KeyRound, Mail, LogIn, Sparkles, Building, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { getLoginUrl } from "@/const";
import { APP_TITLE } from "@/const";

export default function Login() {
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleOAuthLogin = () => {
        window.location.href = getLoginUrl();
    };

    const handleDemoLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo purposes, we show a message about the admin user created previously
        alert("Para este ambiente de desenvolvimento, utilize o comando do console fornecido anteriormente para injetar o token de Administrador.");
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")',
                    filter: 'brightness(0.4) saturate(1.2)'
                }}
            />

            {/* Animated Glowing Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 blur-[120px] rounded-full animate-pulse decoration-1000" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl px-6 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Brand & Visuals */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:flex flex-col gap-6 text-white"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <Building2 className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase">{APP_TITLE}</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-6xl font-black leading-none">
                            Gestão <br />
                            <span className="text-accent">Patrimonial</span>
                        </h2>
                        <p className="text-xl text-slate-300 max-w-md font-medium leading-relaxed">
                            Painel de controle exclusivo para administradores. Gerencie o inventário, analise métricas de mercado e otimize resultados.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <Building className="w-5 h-5 text-accent mb-2" />
                            <div className="text-2xl font-bold">Portal</div>
                            <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Controle Administrativo</div>
                        </div>
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <MapPin className="w-5 h-5 text-accent mb-2" />
                            <div className="text-2xl font-bold">Manager</div>
                            <div className="text-xs text-slate-400 uppercase font-black tracking-widest">Acesso Restrito</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl text-white overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

                        <CardHeader className="space-y-1 pb-8 text-center lg:text-left">
                            <CardTitle className="text-3xl font-black flex items-center gap-2 justify-center lg:justify-start uppercase tracking-tighter">
                                Acesso Interno <Sparkles className="w-5 h-5 text-accent" />
                            </CardTitle>
                            <CardDescription className="text-slate-300 font-medium text-lg">
                                Identifique-se para acessar as ferramentas de gestão e monitoramento do portal.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <form onSubmit={handleDemoLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">ID de Funcionário / E-mail</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu.nome@auraprops.com"
                                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-accent/50 focus:ring-accent/20 transition-all h-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Chave de Acesso</Label>
                                        <a href="#" className="text-xs font-bold text-accent hover:underline text-right">Resetar Segurança</a>
                                    </div>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-10 bg-white/5 border-white/10 text-white focus:border-accent/50 focus:ring-accent/20 transition-all h-11"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-black h-12 text-md transition-all group uppercase tracking-widest">
                                    ENTRAR NA GESTÃO
                                    <LogIn className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </form>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-transparent px-2 text-slate-500 font-black italic tracking-widest">Protocolo de Segurança</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleOAuthLogin}
                                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white border hover:border-white/20 transition-all font-black h-11 uppercase tracking-widest text-xs"
                                >
                                    Autenticação Manus ID
                                </Button>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 mt-4 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                                Sistema monitorado. Acessos não autorizados serão registrados.
                            </p>
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider text-slate-700">
                                <a href="#" className="hover:text-slate-400 decoration-accent decoration-2 text-accent underline-offset-4 underline">Suporte TI</a>
                                <a href="#" className="hover:text-slate-400">Logs de Segurança</a>
                                <a href="#" className="hover:text-slate-400">Política de Uso</a>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
