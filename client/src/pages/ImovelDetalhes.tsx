import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Home as HomeIcon,
  Calendar,
  Ruler,
  BedDouble,
  Bath,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ImovelComExtras } from "@/types/imovel";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600607687940-47a0f9259d47?w=1200&q=80";

interface QuickFeature {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}

const quickFeatures: QuickFeature[] = [
  { icon: BedDouble, label: "Quartos", value: 0 },
  { icon: Bath, label: "Banheiros", value: 0 },
  { icon: Ruler, label: "Área Total", value: "0m²" },
  { icon: Calendar, label: "Disponível", value: "Imediato" },
];

const amenities = [
  "Ar condicionado",
  "Varanda Gourmet",
  "Mobiliado",
  "Segurança 24h",
  "Academia",
  "Piscina",
];

interface NeighborhoodScore {
  label: string;
  score: number;
  color: string;
}

const neighborhoodScores: NeighborhoodScore[] = [
  { label: "Segurança", score: 4.8, color: "bg-green-500" },
  { label: "Comério", score: 4.5, color: "bg-accent" },
  { label: "Transporte", score: 4.2, color: "bg-blue-500" },
];

export default function ImovelDetalhes() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const imovelId = params?.id ? parseInt(params.id, 10) : null;

  const { data: imovel, isLoading } = trpc.imoveis.porId.useQuery(
    imovelId ? { id: imovelId } : { id: 0 },
    { enabled: !!imovelId }
  );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copiado para a área de transferência!");
  };

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  if (!imovelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Imóvel não encontrado
          </h2>
          <Button
            onClick={() => navigate("/")}
            className="bg-accent text-white rounded-full px-8"
          >
            Voltar para o Início
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-primary font-medium animate-pulse">
            Carregando santuário...
          </p>
        </div>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HomeIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-4">
            Ops! Não encontramos.
          </h2>
          <p className="text-gray-500 mb-8">
            Este imóvel pode ter sido alugado ou não está mais disponível no
            momento.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary text-white rounded-full px-10 py-6 text-lg font-bold"
          >
            Explorar outros imóveis
          </Button>
        </div>
      </div>
    );
  }

  const rentalValue =
    typeof imovel.valorAluguel === "string"
      ? parseFloat(imovel.valorAluguel)
      : imovel.valorAluguel;

  const featuresWithValues: QuickFeature[] = [
    { icon: BedDouble, label: "Quartos", value: imovel.quartos || 0 },
    { icon: Bath, label: "Banheiros", value: imovel.banheiros || 0 },
    { icon: Ruler, label: "Área Total", value: `${imovel.areaTotal || 0}m²` },
    { icon: Calendar, label: "Disponível", value: "Imediato" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      {/* Navbar Premium (Sticky Glass) */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-primary hover:bg-primary/5 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <HomeIcon className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter text-primary hidden sm:block">
                AURA<span className="text-accent">PROPS</span>
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="rounded-full w-10 h-10 p-0 text-primary hover:bg-primary/5"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full w-10 h-10 p-0 transition-colors ${isFavorite
                ? "text-red-500 hover:bg-red-50"
                : "text-primary hover:bg-primary/5"
                }`}
              onClick={handleFavoriteToggle}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header do Imóvel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex gap-2 mb-4">
                  <span className="bg-accent/10 text-accent px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Disponível
                  </span>
                  {imovel.status === "promocao" && (
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Destaque
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-4">
                  {imovel.titulo}
                </h1>
                <div className="flex items-center text-gray-500 font-medium">
                  <MapPin className="w-5 h-5 mr-2 text-accent" />
                  <span className="text-lg">
                    {imovel.endereco}, {imovel.bairro}, {imovel.cidade}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">
                  Valor Mensal
                </p>
                <p className="text-5xl font-black text-accent">
                  {formatPrice(imovel.valorAluguel)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Galeria e Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Imagem Principal com Efeito */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-12 aspect-[16/9]"
              >
                <img
                  src={imovel.imagemPrincipal || DEFAULT_IMAGE}
                  alt={imovel.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <Button
                  className="absolute bottom-8 left-8 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border border-white/30 rounded-full px-8 py-6 font-black flex items-center gap-3 transition-all group"
                  onClick={() => alert("Iniciando Tour Virtual 360°...")}
                >
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  Tour Virtual 360°
                </Button>
              </motion.div>

              {/* Características Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
                {featuresWithValues.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-accent/30 transition-colors"
                  >
                    <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all">
                      <item.icon className="w-6 h-6 text-accent group-hover:text-white" />
                    </div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                      {item.label}
                    </span>
                    <span className="text-lg font-black text-primary">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Descrição */}
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    Sobre o Imóvel
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed font-medium">
                    {imovel.descricao}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    Destaques e Comodidades
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {amenities.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-accent/10 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span className="font-bold text-primary/80">{feat}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    Simulador de Custos
                  </h2>
                  <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                              Entrada / Caução (R$)
                            </label>
                            <input
                              type="number"
                              defaultValue={rentalValue * 3}
                              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-primary focus:ring-accent"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                              Período (Meses)
                            </label>
                            <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-primary focus:ring-accent">
                              <option>12 meses</option>
                              <option selected>30 meses</option>
                              <option>48 meses</option>
                            </select>
                          </div>
                        </div>
                        <div className="bg-primary rounded-2xl p-6 text-white flex flex-col justify-center">
                          <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-2">
                            Estimativa Mensal Total
                          </p>
                          <p className="text-4xl font-black text-accent mb-4">
                            {formatPrice(rentalValue * 1.15)}
                          </p>
                          <p className="text-[10px] text-white/40 leading-tight">
                            *Inclui estimativa de condomínio, IPTU e seguro
                            incêndio. Valores podem variar.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    Avaliação do Bairro
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {neighborhoodScores.map((item, i) => (
                      <div
                        key={i}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-end mb-4">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            {item.label}
                          </span>
                          <span className="text-xl font-black text-primary">
                            {item.score}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(item.score / 5) * 100}%` }}
                            className={`h-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                    <div className="w-2 h-8 bg-accent rounded-full" />
                    Histórico de Preços
                  </h2>
                  <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary">Tendência de Valorização</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">+5.2% nos últimos 12 meses</p>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: 'Jan', price: rentalValue * 0.95 },
                          { month: 'Mar', price: rentalValue * 0.97 },
                          { month: 'Jun', price: rentalValue * 0.98 },
                          { month: 'Set', price: rentalValue * 1.02 },
                          { month: 'Dez', price: rentalValue },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#999' }} />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                          />
                          <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </section>
              </div>
            </div>

            {/* Sidebar de Contato (Sticky) */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-28"
              >
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-primary text-white">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-black mb-8">Agende uma visita</h3>

                    <div className="space-y-6 mb-10">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 font-bold uppercase tracking-widest">
                            Telefone
                          </p>
                          <p className="text-lg font-black">(11) 99999-9999</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 rounded-2xl">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 font-bold uppercase tracking-widest">
                            Email
                          </p>
                          <p className="text-lg font-black">
                            contato@auraprops.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <form className="space-y-4 mb-8">
                      <input
                        type="text"
                        placeholder="Seu Nome"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors"
                      />
                      <textarea
                        placeholder="Em que podemos ajudar?"
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                      <Button className="w-full bg-accent hover:bg-accent/90 text-white rounded-2xl py-8 text-lg font-black shadow-xl shadow-accent/20">
                        Enviar Mensagem
                      </Button>
                    </form>

                    <p className="text-center text-white/40 text-xs font-bold uppercase tracking-tighter">
                      Resposta média em menos de 30 minutos
                    </p>
                  </CardContent>
                </Card>

                {/* Badge de Confiança */}
                <div className="mt-8 flex items-center justify-center gap-3 text-gray-400 font-bold text-sm uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Imóvel Verificado AuraProps
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer (Simples para Detalhes) */}
      <footer className="border-t border-gray-100 py-12 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <HomeIcon className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tighter text-primary">
            AURA<span className="text-accent">PROPS</span>
          </span>
        </div>
        <p className="text-gray-400 text-sm font-medium">
          &copy; 2026 AuraProps Real Estate. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
