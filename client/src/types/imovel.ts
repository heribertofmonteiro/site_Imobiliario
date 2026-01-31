/**
 * Client-side type definitions
 * Re-exports shared types and adds frontend-specific interfaces
 */

export type { Imovel, InsertImovel } from "../../../drizzle/schema";
export type { TipoImovel } from "../../../drizzle/schema";

/**
 * Status types for properties
 */
export type ImovelStatus = "disponivel" | "alugado" | "promocao" | "imperdivel";

/**
 * Caracteristica type for amenities/features
 */
export interface Caracteristica {
    id: number;
    nome: string;
    slug: string;
    icone: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Extended Imovel type with computed fields for UI
 * All fields are optional to accommodate API responses
 */
export interface ImovelComExtras {
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
    status: ImovelStatus;
    desconto: number | null;
    dataPublicacao: Date | string | null;
    seoSlug: string;
    imagemPrincipal: string | null;
    quartos: number | null;
    banheiros: number | null;
    areaTotal: number | null;
    tipologia: string | null;
    ativo: boolean | null;
    visualizacoes: number | null;
    distancia?: number;
}

/**
 * Search filters interface
 */
export interface SearchFilters {
    bairro?: string;
    cidade?: string;
    precoMin?: number;
    precoMax?: number;
    quartos?: number;
    tipologia?: string;
    status?: ImovelStatus;
    caracteristicas?: number[];
    latitude?: number;
    longitude?: number;
    raioKm?: number;
    pagina?: number;
    limite?: number;
}

/**
 * Search results interface
 */
export interface SearchResults {
    resultados: ImovelComExtras[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
}

/**
 * Available filters for the filter panel
 */
export interface AvailableFilters {
    bairros: string[];
    cidades: string[];
    status: ImovelStatus[];
    precoMin: number;
    precoMax: number;
    distribuicaoPrecos: number[];
    quartos: number[];
    banheiros: number[];
    caracteristicas: Caracteristica[];
}

/**
 * AI Search result
 */
export interface AISearchResult {
    message: string;
    imoveis: ImovelComExtras[];
    params?: {
        bairro?: string;
        cidade?: string;
        precoMin?: number;
        precoMax?: number;
        quartos?: number;
        tipo?: string;
        extras?: string[];
    };
}
