import React, { createContext, useContext, useState } from "react";
import type { ImovelComExtras } from "@/types/imovel";

const MAX_COMPARE_ITEMS = 4;

interface ComparisonContextType {
    compareList: ImovelComExtras[];
    addToCompare: (imovel: ImovelComExtras) => void;
    removeFromCompare: (id: number) => void;
    clearCompare: () => void;
    isInCompare: (id: number) => boolean;
    canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareList, setCompareList] = useState<ImovelComExtras[]>([]);

    const addToCompare = (imovel: ImovelComExtras) => {
        if (compareList.length >= MAX_COMPARE_ITEMS) return;
        if (!compareList.find((i) => i.id === imovel.id)) {
            setCompareList((prev) => [...prev, imovel]);
        }
    };

    const removeFromCompare = (id: number) => {
        setCompareList((prev) => prev.filter((i) => i.id !== id));
    };

    const clearCompare = () => setCompareList([]);

    const isInCompare = (id: number) => compareList.some((i) => i.id === id);

    return (
        <ComparisonContext.Provider
            value={{
                compareList,
                addToCompare,
                removeFromCompare,
                clearCompare,
                isInCompare,
                canAddMore: compareList.length < MAX_COMPARE_ITEMS,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) throw new Error("useComparison must be used within a ComparisonProvider");
    return context;
};
