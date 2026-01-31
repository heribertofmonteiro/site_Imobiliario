import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin, Heart } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import type { ImovelComExtras } from "@/types/imovel";

interface ImovelCardProps {
    imovel: ImovelComExtras;
    isFavorite?: boolean;
    onToggleFavorite?: (id: number) => void;
    showStatus?: boolean;
    variant?: "default" | "compact" | "horizontal";
    priority?: boolean;
}

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export const ImovelCard: React.FC<ImovelCardProps> = ({
    imovel,
    isFavorite = false,
    onToggleFavorite,
    showStatus = true,
    variant = "default",
    priority = false,
}) => {
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleFavorite?.(imovel.id);
    };

    if (variant === "horizontal") {
        return (
            <motion.div
                key={imovel.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="glass border-none rounded-3xl overflow-hidden flex flex-col md:flex-row"
            >
                <Link href={`/imovel/${imovel.id}`}>
                    <img
                        src={imovel.imagemPrincipal || DEFAULT_IMAGE}
                        alt={imovel.titulo}
                        className="w-full md:w-64 h-64 object-cover cursor-pointer"
                        loading={priority ? "eager" : "lazy"}
                    />
                </Link>
                <div className="p-8 flex flex-col justify-between flex-1">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{imovel.titulo}</h3>
                        <p className="text-3xl font-black text-accent mb-4">
                            {formatPrice(imovel.valorAluguel)}
                        </p>
                    </div>
                    <Link href={`/imovel/${imovel.id}`}>
                        <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl w-full md:w-auto">
                            Garantir Oferta
                        </Button>
                    </Link>
                </div>
            </motion.div>
        );
    }

    if (variant === "compact") {
        return (
            <motion.div
                key={imovel.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
            >
                <Link href={`/imovel/${imovel.id}`}>
                    <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all bg-white/80 backdrop-blur-sm">
                        <div className="relative h-48 overflow-hidden cursor-pointer">
                            <img
                                src={imovel.imagemPrincipal || DEFAULT_IMAGE}
                                alt={imovel.titulo}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading={priority ? "eager" : "lazy"}
                            />
                            {showStatus && (
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                        {imovel.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>
                </Link>

                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors ${isFavorite ? "text-red-500" : "text-white"
                            }`}
                        onClick={handleFavoriteClick}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>
                </div>

                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-primary line-clamp-1 flex-1">
                            {imovel.titulo}
                        </h3>
                    </div>
                    <p className="text-xl font-black text-accent mb-3">
                        {formatPrice(imovel.valorAluguel)}
                    </p>
                    <div className="flex items-center text-gray-400 text-xs mb-4">
                        <MapPin className="w-3 h-3 mr-1 text-accent" />
                        <span className="truncate">
                            {imovel.bairro}, {imovel.cidade}
                        </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase">
                            <span>{imovel.tipologia || `${imovel.quartos || 0}Q`}</span>
                            <span>{imovel.areaTotal || 0}m²</span>
                        </div>
                    </div>
                </CardContent>
            </motion.div>
        );
    }

    // Default variant (full card)
    return (
        <motion.div
            key={imovel.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/imovel/${imovel.id}`}>
                <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer h-full bg-white/80 backdrop-blur-sm group">
                    <div className="relative overflow-hidden">
                        <img
                            src={imovel.imagemPrincipal || DEFAULT_IMAGE}
                            alt={imovel.titulo}
                            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                            loading={priority ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <Button
                                size="sm"
                                className="w-full bg-white text-primary hover:bg-white/90"
                            >
                                Ver Detalhes
                            </Button>
                        </div>
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {onToggleFavorite && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors ${isFavorite ? "text-red-500" : "text-white"
                                        }`}
                                    onClick={handleFavoriteClick}
                                >
                                    <Heart
                                        className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                                    />
                                </Button>
                            )}
                            {showStatus && priority && (
                                <div className="bg-accent text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                    {imovel.status === "promocao" && imovel.desconto
                                        ? `-${imovel.desconto}% OFF`
                                        : "OFERTA"}
                                </div>
                            )}
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl text-primary line-clamp-1">
                                {imovel.titulo}
                            </h3>
                        </div>
                        <p className="text-2xl font-black text-accent mb-4">
                            {formatPrice(imovel.valorAluguel)}{" "}
                            <span className="text-sm font-normal text-gray-500">/mês</span>
                        </p>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-2 text-accent" />
                            <span className="truncate">
                                {imovel.bairro}, {imovel.cidade}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400 uppercase">Planta</span>
                                <span className="font-bold text-primary">
                                    {imovel.tipologia || `${imovel.quartos || 0} Quartos`}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400 uppercase">Área</span>
                                <span className="font-bold text-primary">
                                    {imovel.areaTotal || 0}m²
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
};

export default ImovelCard;
