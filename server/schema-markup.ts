/**
 * Gerador de Schema Markup (JSON-LD) para SEO
 * Implementa LocalBusiness, Product, AggregateRating e BreadcrumbList
 */

/**
 * Schema LocalBusiness - Informações da imobiliária
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Portal de Aluguéis Imobiliários",
    "description": "Encontre o imóvel perfeito para alugar com ofertas próximas a você",
    "url": process.env.VITE_APP_URL || "https://portal-aluguel.com",
    "telephone": "+55 11 98765-4321",
    "email": "contato@portal-aluguel.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Paulista, 1000",
      "addressLocality": "São Paulo",
      "addressRegion": "SP",
      "postalCode": "01311-100",
      "addressCountry": "BR"
    },
    "image": process.env.VITE_APP_LOGO || "https://via.placeholder.com/600x400?text=Logo",
    "sameAs": [
      "https://www.facebook.com/portal-aluguel",
      "https://www.instagram.com/portal-aluguel",
      "https://www.linkedin.com/company/portal-aluguel"
    ],
    "areaServed": {
      "@type": "City",
      "name": "São Paulo"
    }
  };
}

/**
 * Schema Product - Informações de um imóvel
 */
export function generateProductSchema(imovel: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": imovel.titulo,
    "description": imovel.descricao,
    "image": imovel.imagemPrincipal || "https://via.placeholder.com/600x400?text=Imóvel",
    "url": `${process.env.VITE_APP_URL || "https://portal-aluguel.com"}/imovel/${imovel.id}`,
    "offers": {
      "@type": "Offer",
      "url": `${process.env.VITE_APP_URL || "https://portal-aluguel.com"}/imovel/${imovel.id}`,
      "priceCurrency": "BRL",
      "price": imovel.valorAluguel,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": imovel.status === "disponivel" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Portal de Aluguéis Imobiliários"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "128",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "João Silva"
        },
        "datePublished": "2025-01-10",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Excelente imóvel, localização perfeita e atendimento impecável!"
      }
    ],
    "potentialAction": {
      "@type": "BuyAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.VITE_APP_URL || "https://portal-aluguel.com"}/imovel/${imovel.id}`
      }
    }
  };
}

/**
 * Schema BreadcrumbList - Navegação estruturada
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Schema AggregateRating - Avaliações agregadas
 */
export function generateAggregateRatingSchema(
  ratingValue: number = 4.5,
  reviewCount: number = 128
) {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": ratingValue.toString(),
    "reviewCount": reviewCount.toString(),
    "bestRating": "5",
    "worstRating": "1"
  };
}

/**
 * Schema FAQPage - Perguntas frequentes
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Gerar meta tags para SEO
 */
export function generateMetaTags(
  title: string,
  description: string,
  url: string,
  imageUrl?: string,
  type: string = "website"
) {
  return {
    title,
    description,
    canonical: url,
    og: {
      title,
      description,
      url,
      type,
      image: imageUrl || process.env.VITE_APP_LOGO || "https://via.placeholder.com/1200x630?text=Portal"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image: imageUrl || process.env.VITE_APP_LOGO || "https://via.placeholder.com/1200x630?text=Portal"
    }
  };
}

/**
 * Gerar sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastmod: string,
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "weekly",
  priority: number = 0.8
) {
  return {
    url,
    lastmod,
    changefreq,
    priority
  };
}
