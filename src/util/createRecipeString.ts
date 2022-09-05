import e from "../data/emoji.json" assert { type: "json" };

type Recipe = {
    MetalUsed: number;
    NutrientHeadUsed: number;
    NutrientChestUsed: number;
    NutrientLegUsed: number;
    PowerUsed: number;
    SpecialItemUsed: number;
};

const figureSpace = String.fromCodePoint(0x2007);

export function createRecipeString(recipe: Recipe, type: "markdown" | "plain") {
    if (type === "markdown") {
        const advModule =
            recipe.SpecialItemUsed !== 0
                ? `${e.advanced_module} **${recipe.SpecialItemUsed}**`
                : null;

        return [
            `${e.metal} **${recipe.MetalUsed}**`,
            `${e.nutrient} ${[
                `**${recipe.NutrientHeadUsed}**`,
                `**${recipe.NutrientChestUsed}**`,
                `**${recipe.NutrientLegUsed}**`,
            ].join(figureSpace)}`,
            `${e.power} **${recipe.PowerUsed}**`,
            advModule,
        ]
            .filter((a) => a)
            .join(figureSpace);
    }

    if (type === "plain") {
        const advModule =
            recipe.SpecialItemUsed !== 0 ? `🟥${recipe.SpecialItemUsed}` : null;

        return [
            `⚙️${recipe.MetalUsed}`,
            `💊${[
                `${recipe.NutrientHeadUsed}`,
                `${recipe.NutrientChestUsed}`,
                `${recipe.NutrientLegUsed}`,
            ].join(figureSpace)}`,
            `🔋${recipe.PowerUsed}`,
            advModule,
        ]
            .filter((a) => a)
            .join(figureSpace);
    }
}
