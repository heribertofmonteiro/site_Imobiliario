import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, Search, Home as HomeIcon, Phone, Info, Bell, Sparkles, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ImovelCard from "@/components/ImovelCard";
import type { ImovelComExtras } from "@/types/imovel";

interface Localizacao {
  latitude: number;
  longitude: number;
}

const DEFAULT_COORDS: Localizacao = {
  latitude: 35.6895,
  longitude: 139.6917,
};

function getMarkerPosition(lat: string | number | null, lng: string | number | null): [number, number] {
  const parsedLat = typeof lat === "string" ? parseFloat(lat) : (lat ?? 35.6895);
  const parsedLng = typeof lng === "string" ? parseFloat(lng) : (lng ?? 139.6917);
  return [parsedLat, parsedLng];
}

export default function Home() {
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [erroGeo, setErroGeo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, navigate] = useLocation();
  const { toggleFavorite, isFavorite } = useFavorites();

  const { data: suggestions } = trpc.search.obterSugestoes.useQuery(
    { termo: searchTerm },
    { enabled: searchTerm.length > 1 }
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacao({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Erro ao obter geolocalização:", error);
          setErroGeo("Não foi possível obter sua localização");
          setLocalizacao(DEFAULT_COORDS);
        }
      );
    } else {
      setLocalizacao(DEFAULT_COORDS);
    }
  }, []);

  const { data: proximosDe, isLoading: loadingProximos } = trpc.imoveis.proximosDe.useQuery(
    localizacao
      ? { latitude: localizacao.latitude, longitude: localizacao.longitude, raioKm: 10 }
      : { latitude: 0, longitude: 0 },
    { enabled: !!localizacao }
  );

  const { data: ofertasImpediveis } = trpc.imoveis.ofertasImpediveis.useQuery({ limite: 2 });

  const handleFavoriteToggle = (id: number) => {
    toggleFavorite(id);
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-accent/30">
      {/* Navbar Premium */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <HomeIcon className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">
              AURA<span className="text-accent">PROPS</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <Link
              href="/"
              className="text-sm font-semibold text-primary hover:text-accent transition-colors"
            >
              Início
            </Link>
            <Link
              href="/imoveis"
              className="text-sm font-semibold text-gray-500 hover:text-accent transition-colors"
            >
              Imóveis
            </Link>
            <Link
              href="/sobre"
              className="text-sm font-semibold text-gray-500 hover:text-accent transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/blog"
              className="text-sm font-semibold text-gray-500 hover:text-accent transition-colors"
            >
              Blog
            </Link>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-primary relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
              </Button>
            </div>
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-black uppercase tracking-widest text-primary hover:text-accent">
                Gestão
              </Button>
            </Link>
            <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6">
              Anunciar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            className="w-full h-full object-cover"
            alt="Luxury Home"
          />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Encontre o seu <span className="text-accent">santuário</span> ideal.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-12 font-medium"
          >
            Curadoria exclusiva de imóveis no Japão para quem busca estilo e conforto.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative glass p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 shadow-2xl"
          >
            <div className="flex-1 flex items-center px-6 py-3 gap-3">
              <Search className="text-white/60 w-5 h-5" />
              <input
                id="home-search-input"
                name="search"
                type="text"
                placeholder="Onde você quer morar?"
                className="bg-transparent border-none outline-none text-white placeholder:text-white/60 w-full font-medium"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
              />
            </div>
            <Button
              className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-accent/20"
              onClick={() => navigate(`/imoveis?q=${searchTerm}`)}
            >
              Buscar Agora
            </Button>

            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchTerm.length > 1 && suggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl overflow-hidden z-[100] p-4"
                >
                  {suggestions.bairros.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-4">Bairros</p>
                      {suggestions.bairros.map(b => (
                        <div
                          key={b}
                          className="px-4 py-2 hover:bg-gray-50 rounded-xl cursor-pointer font-bold text-primary text-sm flex items-center gap-2"
                          onClick={() => {
                            setSearchTerm(b);
                            setShowSuggestions(false);
                            navigate(`/imoveis?bairro=${b}`);
                          }}
                        >
                          <MapPin className="w-3 h-3 text-accent" /> {b}
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestions.titulos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-4">Imóveis</p>
                      {suggestions.titulos.map(t => (
                        <div
                          key={t}
                          className="px-4 py-2 hover:bg-gray-50 rounded-xl cursor-pointer font-bold text-primary text-sm"
                          onClick={() => {
                            setSearchTerm(t);
                            setShowSuggestions(false);
                            navigate(`/imoveis?q=${t}`);
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Featured Neighborhoods */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-bold tracking-widest uppercase text-sm">Localizações Premium</span>
            <h2 className="text-4xl font-black text-primary mt-2">Bairros em Destaque</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Shinjuku", count: 12, image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80" },
              { name: "Shibuya", count: 8, image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80" },
              { name: "Minato", count: 15, image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80" },
              { name: "Ginza", count: 10, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" }
            ].map((bairro, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="relative h-64 rounded-[2rem] overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/imoveis?bairro=${bairro.name}`)}
              >
                <img src={bairro.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={bairro.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-xl font-black text-white">{bairro.name}</h3>
                  <p className="text-accent text-xs font-bold uppercase tracking-widest">{bairro.count} Imóveis</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Ofertas Próximas */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-accent font-bold tracking-widest uppercase text-sm">
                Explorar
              </span>
              <h2 className="text-4xl font-black text-primary mt-2">Próximos de você</h2>
            </div>
            <Link href="/imoveis">
              <Button variant="ghost" className="text-accent font-bold hover:bg-accent/10">
                Ver todos
              </Button>
            </Link>
          </div>

          {erroGeo && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{erroGeo}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {loadingProximos ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
              ))
            ) : (
              proximosDe?.slice(0, 3).map((imovel, idx) => (
                <ImovelCard
                  key={`home-proximo-${imovel.id || idx}`}
                  imovel={imovel as ImovelComExtras}
                  isFavorite={isFavorite(imovel.id)}
                  onToggleFavorite={handleFavoriteToggle}
                  priority
                />
              ))
            )}
          </div>

          {/* Mapa Interativo na Home */}
          <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white relative group">
            <div className="absolute top-6 left-6 z-[1000] glass p-4 rounded-2xl shadow-xl">
              <h4 className="font-black text-primary text-sm uppercase tracking-widest">
                Exploração Visual
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Veja os imóveis disponíveis no mapa
              </p>
            </div>
            <Link href="/imoveis">
              <Button className="absolute bottom-6 right-6 z-[1000] bg-accent text-white rounded-full px-8 font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                Ver no Mapa Completo
              </Button>
            </Link>
            <div className="h-full w-full">
              <MapContainer
                center={[localizacao?.latitude || DEFAULT_COORDS.latitude, localizacao?.longitude || DEFAULT_COORDS.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {proximosDe?.map((imovel, idx) => (
                  <Marker
                    key={`home-marker-${imovel.id || idx}`}
                    position={getMarkerPosition(imovel.latitude, imovel.longitude)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-bold text-primary text-xs">{imovel.titulo}</h4>
                        <p className="text-accent font-black text-xs">
                          {formatPrice(imovel.valorAluguel)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Promoções com Gradiente */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 blur-[120px] rounded-full translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-black text-white mb-12">
            Oportunidades <span className="text-accent">Imperdíveis</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {ofertasImpediveis?.map((imovel, idx) => (
              <ImovelCard
                key={`home-oferta-${imovel.id || idx}`}
                imovel={imovel as ImovelComExtras}
                variant="horizontal"
                priority
              />
            ))}
          </div>
        </div>
      </section>
      {/* Blog Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-bold tracking-widest uppercase text-sm">Conteúdo Exclusivo</span>
            <h2 className="text-4xl font-black text-primary mt-2">Dicas & Tendências</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Como decorar seu novo apartamento",
                category: "Decoração",
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
              },
              {
                title: "Onde investir em imóveis em 2026",
                category: "Investimento",
                image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80"
              },
              {
                title: "Vantagens de morar perto do metrô",
                category: "Lifestyle",
                image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&q=80"
              }
            ].map((post, i) => (
              <Link href="/blog" key={i}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-xl group cursor-pointer"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={post.title} />
                  </div>
                  <div className="p-8">
                    <span className="text-accent font-bold text-xs uppercase tracking-widest">{post.category}</span>
                    <h3 className="text-xl font-bold text-primary mt-2 group-hover:text-accent transition-colors">{post.title}</h3>
                    <Button variant="link" className="p-0 text-primary font-bold mt-4">Ler mais →</Button>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-accent font-bold tracking-widest uppercase text-sm">Depoimentos</span>
              <h2 className="text-5xl font-black text-primary mt-4 mb-8 leading-tight">O que nossos clientes dizem sobre a <span className="text-accent">AuraProps</span></h2>
              <p className="text-gray-500 text-lg font-medium mb-12">Milhares de pessoas já encontraram seu lar ideal conosco. Junte-se à nossa comunidade exclusiva.</p>
              <div className="flex gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-primary">
                  <p>+2.500 Clientes Satisfeitos</p>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {[
                {
                  text: "A experiência de busca foi incrível. O agente inteligente realmente entendeu o que eu precisava!",
                  author: "Mariana Silva",
                  role: "Designer de Interiores"
                },
                {
                  text: "Encontrei meu loft em menos de uma semana. O processo foi transparente e muito rápido.",
                  author: "Ricardo Santos",
                  role: "Empreendedor"
                }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 relative"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white text-2xl font-serif">“</div>
                  <p className="text-gray-600 text-lg font-medium italic mb-6">"{t.text}"</p>
                  <div>
                    <p className="font-black text-primary">{t.author}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Notifications Agent Section */}
      <section className="py-24 px-6 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Bell className="w-16 h-16 text-white mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Seja o primeiro a saber</h2>
          <p className="text-white/80 text-xl font-medium mb-12">Ative nosso Agente de Notificações e receba alertas exclusivos de novos imóveis que combinam com seu perfil.</p>
          <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 transition-all"
            />
            <Button className="bg-white text-accent hover:bg-white/90 rounded-full px-10 py-6 font-black shadow-2xl">
              Ativar Alertas
            </Button>
          </div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-8">Prometemos não enviar spam. Apenas oportunidades reais.</p>
        </div>
      </section>
      {/* Rodapé Moderno */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <HomeIcon className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-primary">
                  AURA<span className="text-accent">PROPS</span>
                </span>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed">
                Transformando a busca pelo lar ideal em uma experiência de luxo e
                simplicidade.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-6">Navegação</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li>
                  <Link href="/" className="hover:text-accent transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/imoveis" className="hover:text-accent transition-colors">
                    Imóveis
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Anunciar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-6">Suporte</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-accent transition-colors">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-6">Contato</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <Phone className="w-5 h-5 text-accent" />
                  <span>(11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 font-medium">
                  <Info className="w-5 h-5 text-accent" />
                  <span>contato@auraprops.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm font-medium">
            <p>&copy; 2026 AuraProps Real Estate. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
