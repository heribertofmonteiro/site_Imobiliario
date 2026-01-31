import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Sparkles, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import type { ImovelComExtras } from "@/types/imovel";

interface FeatureConfig {
    label: string;
    key: keyof ImovelComExtras;
    format?: (value: unknown) => string;
}

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

const features: FeatureConfig[] = [
    { label: "Preço", key: "valorAluguel", format: (v: unknown) => `R$ ${Number(v).toLocaleString("pt-BR")}` },
    { label: "Quartos", key: "quartos" },
    { label: "Banheiros", key: "banheiros" },
    { label: "Área Total", key: "areaTotal", format: (v: unknown) => `${v}m²` },
    { label: "Bairro", key: "bairro" },
    { label: "Cidade", key: "cidade" },
    { label: "Status", key: "status" },
];

const formatFeatureValue = (value: unknown, format?: (v: unknown) => string): string => {
    if (format) return format(value);
    if (value === null || value === undefined) return "N/A";
    return String(value);
};

export default function Comparar() {
    const { compareList, removeFromCompare, clearCompare } = useComparison();
    const [, navigate] = useLocation();

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                    <Sparkles className="text-gray-400 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-primary mb-2">
                    Nenhum imóvel para comparar
                </h2>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Adicione até 4 imóveis da nossa lista para comparar suas características
                    lado a lado.
                </p>
                <Link href="/imoveis">
                    <Button className="bg-accent text-white rounded-full px-8 py-6 font-bold">
                        Explorar Imóveis
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="glass sticky top-0 z-50 border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => navigate("/imoveis")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-black text-primary">
                            Comparação de Imóveis
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-red-500 font-bold hover:bg-red-50"
                        onClick={clearCompare}
                    >
                        Limpar Tudo
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {compareList.map((imovel, index) => (
                        <motion.div
                            key={imovel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute -top-3 -right-3 z-10 rounded-full w-8 h-8 shadow-lg"
                                onClick={() => removeFromCompare(imovel.id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <Card className="overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-sm h-full">
                                <img
                                    src={imovel.imagemPrincipal || DEFAULT_IMAGE}
                                    className="w-full h-48 object-cover"
                                    alt={imovel.titulo}
                                />
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-primary mb-4 line-clamp-2 h-12">
                                        {imovel.titulo}
                                    </h3>

                                    <div className="space-y-6">
                                        {features.map((feature) => (
                                            <div
                                                key={feature.key as string}
                                                className="border-b border-gray-50 pb-4 last:border-0"
                                            >
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                                    {feature.label}
                                                </span>
                                                <span className="text-sm font-bold text-primary">
                                                    {formatFeatureValue(imovel[feature.key], feature.format)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link href={`/imovel/${imovel.id}`}>
                                        <Button className="w-full mt-8 bg-primary text-white rounded-xl font-bold">
                                            Ver Detalhes
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
