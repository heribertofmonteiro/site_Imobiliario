import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    MapPin,
    Search,
    Filter,
    Map as MapIcon,
    List,
    ArrowUpDown,
    Sparkles,
    X,
    TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useComparison } from "@/contexts/ComparisonContext";
import ImovelCard from "@/components/ImovelCard";
import type {
    SearchFilters,
    ImovelComExtras,
    AvailableFilters,
    ImovelStatus,
} from "@/types/imovel";

// Fix for Leaflet marker icons in React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_PRICE_MAX = 120000; // Valor máximo ajustado para 120 mil ienes

function getMarkerPosition(lat: string | number | null, lng: string | number | null): [number, number] {
    const parsedLat = typeof lat === "string" ? parseFloat(lat) : (lat ?? 35.6895);
    const parsedLng = typeof lng === "string" ? parseFloat(lng) : (lng ?? 139.6917);
    return [parsedLat, parsedLng];
}

export default function Imoveis() {
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<SearchFilters>({
        cidade: "",
        bairro: "",
        precoMin: 0,
        precoMax: DEFAULT_PRICE_MAX,
        quartos: undefined,
        tipologia: undefined,
        status: undefined,
        caracteristicas: [],
    });
    const [showFilters, setShowFilters] = useState(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCompare, isInCompare, compareList, removeFromCompare } =
        useComparison();

    // Load filters from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("search_filters");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Cap priceMax at the new limit if it was saved with a higher value before
                    if (parsed.precoMax > DEFAULT_PRICE_MAX) {
                        parsed.precoMax = DEFAULT_PRICE_MAX;
                    }
                    setFilters(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to parse saved filters", e);
                }
            }
        }
    }, []);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("search_filters", JSON.stringify(filters));
        }
    }, [filters]);

    const { data: searchResults, isLoading } = trpc.search.buscarAvancado.useQuery({
        ...filters,
        pagina: 1,
        limite: 20,
    });

    const { data: availableFilters } = trpc.search.obterFiltrosDisponiveis.useQuery();

    const handleFilterChange = useCallback(
        (key: keyof SearchFilters, value: unknown) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const handleFavoriteToggle = useCallback(
        (id: number) => {
            toggleFavorite(id);
        },
        [toggleFavorite]
    );

    const handleCompareToggle = useCallback(
        (imovel: ImovelComExtras) => {
            if (isInCompare(imovel.id)) {
                removeFromCompare(imovel.id);
            } else {
                addToCompare(imovel);
            }
        },
        [isInCompare, addToCompare, removeFromCompare]
    );

    const handleGeoLocation = useCallback(() => {
        if (typeof navigator !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                handleFilterChange("latitude", pos.coords.latitude);
                handleFilterChange("longitude", pos.coords.longitude);
            });
        }
    }, [handleFilterChange]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Search Bar */}
            <header className="fixed top-0 w-full z-50 glass border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-primary hidden sm:block">
                            AURA<span className="text-accent">PROPS</span>
                        </span>
                    </Link>

                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            id="property-search-input"
                            name="property-search"
                            placeholder="Busque por bairro, cidade ou estilo..."
                            className="pl-11 pr-16 py-6 rounded-full bg-white/50 border-none shadow-inner focus-visible:ring-accent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-accent hover:bg-accent/10"
                            onClick={handleGeoLocation}
                        >
                            <MapPin className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            className={`rounded-full px-6 font-bold ${showFilters ? "bg-accent text-white" : "text-primary"
                                }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                        <div className="bg-gray-100 p-1 rounded-full flex">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={() => setViewMode("grid")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === "map" ? "default" : "ghost"}
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={() => setViewMode("map")}
                            >
                                <MapIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 min-h-screen flex">
                {/* Sidebar Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.aside
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className="w-80 border-r border-gray-100 p-6 bg-white sticky top-20 h-[calc(100vh-80px)] overflow-y-auto z-40"
                        >
                            <div className="space-y-8">
                                <div>
                                    <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4">
                                        Localização
                                    </h4>
                                    <div className="space-y-4">
                                        <select
                                            className="w-full p-3 rounded-xl bg-gray-50 border-none text-sm font-bold text-primary focus:ring-accent"
                                            value={filters.cidade}
                                            onChange={(e) => handleFilterChange("cidade", e.target.value)}
                                        >
                                            <option value="">Todas as Cidades</option>
                                            {availableFilters?.cidades.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            id="neighborhood-filter-input"
                                            name="neighborhood"
                                            placeholder="Bairro específico..."
                                            className="rounded-xl bg-gray-50 border-none"
                                            value={filters.bairro || ""}
                                            onChange={(e) => handleFilterChange("bairro", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-black text-primary uppercase text-xs tracking-widest">
                                            Visor de Preço
                                        </h4>
                                        <div className="bg-accent/10 px-2 py-1 rounded text-[10px] font-black text-accent uppercase">
                                            Mensal
                                        </div>
                                    </div>

                                    {/* Histograma de Distribuição */}
                                    <div className="flex items-end gap-[2px] h-12 mb-4 px-1">
                                        {(availableFilters?.distribuicaoPrecos || Array(10).fill(2)).map((count, i) => {
                                            const total = Math.max(...(availableFilters?.distribuicaoPrecos || [5]));
                                            const height = (count / total) * 100;
                                            const bucketMin = (DEFAULT_PRICE_MAX / 10) * i;
                                            const bucketMax = (DEFAULT_PRICE_MAX / 10) * (i + 1);
                                            const isActive = (filters.precoMin || 0) <= bucketMax && (filters.precoMax || DEFAULT_PRICE_MAX) >= bucketMin;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex-1 transition-all duration-500 rounded-t-sm ${isActive ? 'bg-accent' : 'bg-gray-100'}`}
                                                    style={{ height: `${Math.max(height, 10)}%` }}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="px-2">
                                        <Slider
                                            value={[filters.precoMin || 0, filters.precoMax || DEFAULT_PRICE_MAX]}
                                            max={DEFAULT_PRICE_MAX}
                                            step={1000}
                                            onValueChange={([min, max]) => {
                                                handleFilterChange("precoMin", min);
                                                handleFilterChange("precoMax", max);
                                            }}
                                        />

                                        {/* Visor Digital de Preço */}
                                        <div className="mt-6 p-4 rounded-2xl bg-primary shadow-inner relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-2 opacity-20">
                                                <TrendingUp className="w-12 h-12 text-white" />
                                            </div>
                                            <div className="relative z-10 flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                                    <span>Seleção</span>
                                                    <span>Ienes (JPY)</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-accent font-black uppercase tracking-wider mb-1">Mínimo</span>
                                                        <span className="text-xl font-black text-white leading-none">
                                                            {filters.precoMin?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="h-4 w-[2px] bg-white/10 mb-1" />
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[9px] text-accent font-black uppercase tracking-wider mb-1">Máximo</span>
                                                        <span className="text-xl font-black text-white leading-none">
                                                            {filters.precoMax?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Glow Effect */}
                                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/20 blur-3xl rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4">
                                        Tipologia (Plantas)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["1K", "1LDK", "2LDK", "3LDK+"].map((t) => (
                                            <Button
                                                key={t}
                                                variant={filters.tipologia === t ? "default" : "outline"}
                                                className="rounded-xl font-bold text-xs"
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "tipologia",
                                                        filters.tipologia === t ? undefined : t
                                                    )
                                                }
                                            >
                                                {t}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-black text-primary uppercase text-xs tracking-widest mb-4">
                                        Estilo de Vida
                                    </h4>
                                    <div className="space-y-3">
                                        {availableFilters?.caracteristicas.map((char) => (
                                            <div key={char.id} className="flex items-center gap-3">
                                                <Checkbox
                                                    id={`char-${char.id}`}
                                                    className="rounded-md border-gray-200"
                                                    checked={filters.caracteristicas?.includes(char.id)}
                                                    onCheckedChange={(checked) => {
                                                        const newChars = checked
                                                            ? [...(filters.caracteristicas || []), char.id]
                                                            : (filters.caracteristicas || []).filter(
                                                                (id) => id !== char.id
                                                            );
                                                        handleFilterChange("caracteristicas", newChars);
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`char-${char.id}`}
                                                    className="text-sm font-bold text-gray-500 cursor-pointer"
                                                >
                                                    {char.nome}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-primary text-white rounded-xl py-6 font-bold"
                                    onClick={() => setShowFilters(false)}
                                >
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {viewMode === "grid" ? (
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                                    {searchResults?.total || 0} imóveis encontrados
                                </p>
                                <Button
                                    variant="ghost"
                                    className="text-xs font-bold text-primary"
                                >
                                    <ArrowUpDown className="w-3 h-3 mr-2" />
                                    Ordenar por: Relevância
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div
                                            key={i}
                                            className="h-80 bg-gray-100 rounded-[2rem] animate-pulse"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {searchResults?.resultados.map((imovel) => (
                                        <div key={imovel.id} className="relative group">
                                            <ImovelCard
                                                imovel={imovel as ImovelComExtras}
                                                variant="compact"
                                                isFavorite={isFavorite(imovel.id)}
                                                onToggleFavorite={handleFavoriteToggle}
                                            />
                                            <Button
                                                size="sm"
                                                variant={isInCompare(imovel.id) ? "secondary" : "outline"}
                                                className="absolute bottom-5 right-5 text-[10px] h-7 rounded-full z-10"
                                                onClick={() => handleCompareToggle(imovel as ImovelComExtras)}
                                            >
                                                {isInCompare(imovel.id) ? "Comparando" : "+ Comparar"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-[calc(100vh-160px)] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                            <MapContainer
                                center={[35.6895, 139.6917]}
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                {searchResults?.resultados.map((imovel) => (
                                    <Marker
                                        key={imovel.id}
                                        position={getMarkerPosition(imovel.latitude, imovel.longitude)}
                                    >
                                        <Popup className="premium-popup">
                                            <div className="w-48">
                                                <img
                                                    src={imovel.imagemPrincipal || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                    alt={imovel.titulo}
                                                />
                                                <h4 className="font-bold text-primary text-sm">
                                                    {imovel.titulo}
                                                </h4>
                                                <p className="text-accent font-black">
                                                    {formatPrice(imovel.valorAluguel)}
                                                </p>
                                                <Link href={`/imovel/${imovel.id}`}>
                                                    <Button size="sm" className="w-full mt-2 h-7 text-[10px]">
                                                        Ver Detalhes
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    )}
                </div>
            </main>

            {/* Comparison Tray */}
            <AnimatePresence>
                {compareList.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass p-4 rounded-[2rem] shadow-2xl flex items-center gap-6 border-none"
                    >
                        <div className="flex -space-x-4">
                            {compareList.map((i) => (
                                <div key={i.id} className="relative group">
                                    <img
                                        src={i.imagemPrincipal || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                                        className="w-12 h-12 rounded-full border-4 border-white object-cover"
                                        alt={i.titulo}
                                    />
                                    <button
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeFromCompare(i.id)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Comparação
                            </span>
                            <span className="text-sm font-bold text-primary">
                                {compareList.length} selecionados
                            </span>
                        </div>
                        <Link href="/comparar">
                            <Button className="bg-accent text-white rounded-full px-8 font-bold">
                                Comparar Agora
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
