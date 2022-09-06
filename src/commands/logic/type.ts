export type FindByPCKeyResponse = {
    MetalUsed: number;
    NutrientHeadUsed: number;
    NutrientChestUsed: number;
    NutrientLegUsed: number;
    PowerUsed: number;
    SpecialItemUsed: number;
    IsSpecial: boolean;
    count: number;
};

export type FindByRecipeResponse = {
    PCKeyString: string;
    count: number;
    ratio: number;
    total: number;
};
