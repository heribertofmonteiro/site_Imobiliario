import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const FAVORITES_STORAGE_KEY = "favorites";

interface FavoritesContextType {
    favorites: number[];
    toggleFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
    clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on client side
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        setFavorites(parsed);
                    }
                } catch {
                    console.error("Failed to parse favorites from localStorage");
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever favorites change (after initial load)
    useEffect(() => {
        if (isLoaded && typeof window !== "undefined") {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        }
    }, [favorites, isLoaded]);

    const toggleFavorite = useCallback((id: number) => {
        setFavorites((prev) => {
            const isFav = prev.includes(id);
            const next = isFav ? prev.filter((fid) => fid !== id) : [...prev, id];
            return next;
        });
    }, []);

    const isFavorite = useCallback(
        (id: number) => favorites.includes(id),
        [favorites]
    );

    const clearFavorites = useCallback(() => {
        setFavorites([]);
    }, []);

    return (
        <FavoritesContext.Provider
            value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
    return context;
};
