import { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { supabase } from "../../db";
import { createRecipeString } from "../../util/createRecipeString";
import { getUnit } from "../../util/getUnit";
import emoji from "../../data/emoji.json" assert { type: "json" };

type Recipe = {
    MetalUsed: number;
    NutrientHeadUsed: number;
    NutrientChestUsed: number;
    NutrientLegUsed: number;
    PowerUsed: number;
    SpecialItemUsed: number;
    IsSpecial: boolean;
    count: number;
};

export async function unit({ pckey }: { pckey: string }) {
    const { data: recipes, error } = await supabase.rpc<Recipe>(
        "find_recipe_by_pckey",
        { pckey }
    );
    if (error) {
        console.error(error);
        throw new Error(":warning: エラーが発生しました");
    }

    if (recipes.length === 0) {
        throw new Error(
            ":thinking: このレシピで製造されたユニットが見つかりませんでした"
        );
    }

    const icon = `https://cdn.laoplus.net/formationicon/FormationIcon_${pckey.replace(
        /^Char_/,
        ""
    )}.webp`;
    const unit = getUnit(pckey);
    const numWithComma = new Intl.NumberFormat();
    const embed = new EmbedBuilder();
    embed
        .setThumbnail(icon)
        .setTitle(`${emoji.tactics_manual} ${unit.name}`)
        .setURL(`https://lo.swaytwig.com/units/${unit.key2}`)
        .setDescription("を排出したレシピ一覧")
        .addFields(
            recipes.slice(0, 5).map((recipe, index) => {
                const figureSpace = String.fromCodePoint(0x2007);
                const count = numWithComma.format(recipe.count);

                return {
                    name: [
                        `__${index + 1}.__`, //
                        `${count} 回排出`,
                    ].join(figureSpace),
                    value: createRecipeString(recipe, "markdown"),
                };
            })
        );

    const textEncoder = new TextEncoder();

    const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
            .setCustomId("select_search_by_recipe")
            .setPlaceholder("それらのレシピでよく出る戦闘員を検索する")
            .addOptions(
                recipes.slice(0, 5).map((recipe) => {
                    return {
                        label: createRecipeString(recipe, "plain"),
                        value: JSON.stringify([
                            recipe.MetalUsed,
                            recipe.NutrientHeadUsed,
                            recipe.NutrientChestUsed,
                            recipe.NutrientLegUsed,
                            recipe.PowerUsed,
                            recipe.SpecialItemUsed,
                        ]),
                    };
                })
            )
    );

    return {
        embeds: [embed],
        components: [row],
    };
}
