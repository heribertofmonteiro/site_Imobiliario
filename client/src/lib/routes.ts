/**
 * Centralized route definitions for the application.
 * This acts as a single source of truth for all links and page paths.
 */
export const ROUTES = {
    home: "/",
    imoveis: "/imoveis",
    imovelDetalhes: (id: string | number) => `/imovel/${id}`,
    comparar: "/comparar",
    admin: "/admin",
    analytics: "/analytics",
    blog: "/blog",
    login: "/login",
    notFound: "/404",
} as const;

export type AppRoutes = keyof typeof ROUTES;
