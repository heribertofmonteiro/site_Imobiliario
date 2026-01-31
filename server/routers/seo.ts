import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { imoveis } from "../../drizzle/schema";

/**
 * Router para funcionalidades de SEO (Sitemap, Robots.txt, etc)
 */
export const seoRouter = router({
  /**
   * Gerar Sitemap XML dinâmico
   */
  gerarSitemap: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const todosImoveis = await db.select().from(imoveis);

      // URLs estáticas
      const baseUrl = process.env.VITE_APP_URL || "https://portal-aluguel.com";
      const staticUrls = [
        { url: baseUrl, priority: "1.0", changefreq: "daily" },
        { url: `${baseUrl}/imoveis`, priority: "0.9", changefreq: "daily" },
        { url: `${baseUrl}/admin`, priority: "0.5", changefreq: "weekly" },
      ];

      // URLs dinâmicas de imóveis
      const imovelUrls = todosImoveis.map((imovel) => ({
        url: `${baseUrl}/imovel/${imovel.id}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: imovel.updatedAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      }));

      // Combinar todas as URLs
      const allUrls = [...staticUrls, ...imovelUrls];

      // Gerar XML
      let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      allUrls.forEach((item) => {
        sitemapXml += "  <url>\n";
        sitemapXml += `    <loc>${item.url}</loc>\n`;
        if ("lastmod" in item) {
          sitemapXml += `    <lastmod>${item.lastmod}</lastmod>\n`;
        }
        sitemapXml += `    <changefreq>${item.changefreq}</changefreq>\n`;
        sitemapXml += `    <priority>${item.priority}</priority>\n`;
        sitemapXml += "  </url>\n";
      });

      sitemapXml += "</urlset>";

      return {
        xml: sitemapXml,
        urlCount: allUrls.length,
      };
    } catch (error) {
      console.error("[SEO] Erro ao gerar sitemap:", error);
      throw error;
    }
  }),

  /**
   * Obter conteúdo de Robots.txt
   */
  obterRobotsTxt: publicProcedure.query(async () => {
    const robotsTxt = `# Robots.txt para Portal de Aluguéis

User-agent: *
Allow: /
Allow: /imovel/
Allow: /imoveis
Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /*.json$
Disallow: /*.xml$

# Google
User-agent: Googlebot
Allow: /

# Bing
User-agent: Bingbot
Allow: /

# Sitemap
Sitemap: https://portal-aluguel.com/sitemap.xml

# Crawl delay
Crawl-delay: 1
Request-rate: 1/10s
`;

    return { content: robotsTxt };
  }),

  /**
   * Obter meta tags dinâmicas para uma página
   */
  obterMetaTags: publicProcedure.query(async () => {
    return {
      title: "Portal de Aluguéis Imobiliários - Encontre seu Imóvel Perfeito",
      description:
        "Descubra os melhores imóveis para aluguel próximos a você. Promoções, ofertas imperdíveis e aluguéis normais. Busca por geolocalização automática.",
      keywords:
        "aluguel, imóvel, apartamento, casa, kitnet, imobiliária, aluguel de imóvel, busca de imóvel",
      ogTitle: "Portal de Aluguéis Imobiliários",
      ogDescription: "Encontre o imóvel perfeito para aluguel com nossa plataforma inteligente",
      ogImage: "https://portal-aluguel.com/og-image.jpg",
      ogUrl: "https://portal-aluguel.com",
      twitterCard: "summary_large_image",
      twitterTitle: "Portal de Aluguéis Imobiliários",
      twitterDescription: "Encontre o imóvel perfeito para aluguel",
      twitterImage: "https://portal-aluguel.com/og-image.jpg",
    };
  }),

  /**
   * Gerar meta tags dinâmicas para um imóvel específico
   */
  obterMetaTagsImovel: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Exemplo: pegar primeiro imóvel
      const imovel = await db.select().from(imoveis).limit(1);

      if (!imovel || imovel.length === 0) {
        return null;
      }

      const im = imovel[0];

      return {
        title: `${im.titulo} - Aluguel ${im.valorAluguel}/mês`,
        description: im.descricao?.substring(0, 160) || `Aluguel em ${im.bairro}, ${im.cidade}`,
        keywords: `aluguel, ${im.bairro}, ${im.cidade}, ${im.valorAluguel}`,
        ogTitle: im.titulo,
        ogDescription: `Aluguel em ${im.bairro}, ${im.cidade} - R$ ${im.valorAluguel}/mês`,
        ogImage: "https://portal-aluguel.com/imovel-image.jpg",
        ogUrl: `https://portal-aluguel.com/imovel/${im.id}`,
        ogType: "product",
        twitterCard: "summary_large_image",
        twitterTitle: im.titulo,
        twitterDescription: `Aluguel em ${im.bairro}, ${im.cidade} - R$ ${im.valorAluguel}/mês`,
      };
    } catch (error) {
      console.error("[SEO] Erro ao obter meta tags do imóvel:", error);
      throw error;
    }
  }),

  /**
   * Obter dados estruturados (Schema.org JSON-LD)
   */
  obterSchemaMarkup: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const todosImoveis = await db.select().from(imoveis);

      // Schema LocalBusiness
      const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: "Portal de Aluguéis Imobiliários",
        url: "https://portal-aluguel.com",
        telephone: "+55 11 99999-9999",
        email: "contato@portal-aluguel.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rua Principal, 123",
          addressLocality: "São Paulo",
          addressRegion: "SP",
          postalCode: "01000-000",
          addressCountry: "BR",
        },
        sameAs: [
          "https://www.facebook.com/portal-aluguel",
          "https://www.instagram.com/portal-aluguel",
        ],
      };

      // Schema Product para cada imóvel
      const productSchemas = todosImoveis.map((imovel) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: imovel.titulo,
        description: imovel.descricao,
        url: `https://portal-aluguel.com/imovel/${imovel.id}`,
        image: "https://portal-aluguel.com/imovel-image.jpg",
        offers: {
          "@type": "Offer",
          price: imovel.valorAluguel,
          priceCurrency: "BRL",
          availability: imovel.status === "disponivel" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.5",
          reviewCount: "10",
        },
      }));

      return {
        localBusiness: localBusinessSchema,
        products: productSchemas,
      };
    } catch (error) {
      console.error("[SEO] Erro ao obter schema markup:", error);
      throw error;
    }
  }),
});
