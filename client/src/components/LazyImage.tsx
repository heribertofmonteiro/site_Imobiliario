import { useState, useEffect, useRef } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}

/**
 * Componente de imagem com lazy loading
 * Usa Intersection Observer para carregar imagens sob demanda
 */
export function LazyImage({
  src,
  alt,
  className = "",
  width,
  height,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E",
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          img.onerror = () => {
            // Fallback para imagem padrão em caso de erro
            setImageSrc(placeholder);
          };
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "50px", // Começar a carregar 50px antes de entrar na viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, placeholder]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-75"} transition-opacity duration-300`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

/**
 * Componente de imagem com blur-up effect
 * Carrega uma imagem pequena primeiro, depois a imagem completa
 */
export function BlurImage({
  src,
  alt,
  className = "",
  width,
  height,
  blurSrc,
}: LazyImageProps & { blurSrc?: string }) {
  const [imageSrc, setImageSrc] = useState(blurSrc || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? "blur-none" : "blur-sm"} transition-all duration-300`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}

/**
 * Componente de imagem com srcset para responsividade
 */
export function ResponsiveImage({
  src,
  alt,
  srcSet,
  className = "",
  width,
  height,
}: LazyImageProps & { srcSet?: string }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.src = src;
          if (srcSet) {
            img.srcset = srcSet;
          }
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, srcSet]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={srcSet}
      alt={alt}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-75"} transition-opacity duration-300`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
}
