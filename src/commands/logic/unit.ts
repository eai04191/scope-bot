import { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { supabase } from "../../db";
import { createRecipeString } from "../../util/createRecipeString";
import { getUnit } from "../../util/getUnit";
import emoji from "../../data/emoji.json" assert { type: "json" };
import { FindByPCKeyResponse, FindByRecipeResponse } from "./type";

export async function unit({ pckey }: { pckey: string }) {
    const unit = getUnit(pckey);
    const { data: recipes, error } = await supabase
        .rpc<FindByPCKeyResponse>("find_recipe_by_pckey", { pckey })
        .limit(5);
    if (error) {
        console.error(error);
        throw new Error(":warning: エラーが発生しました");
    }

    if (recipes.length === 0) {
        throw new Error(
            `:thinking: ${unit.name}はまだ一度も製造されていないようです`
        );
    }

    const ratios = await Promise.all(
        recipes.map(async (recipe) => {
            const { data, error } = await supabase.rpc<FindByRecipeResponse>(
                "find_pckey_by_recipe",
                {
                    metal: recipe.MetalUsed,
                    nutrient_head: recipe.NutrientHeadUsed,
                    nutrient_chest: recipe.NutrientChestUsed,
                    nutrient_leg: recipe.NutrientLegUsed,
                    power: recipe.PowerUsed,
                    special_item: recipe.SpecialItemUsed,
                }
            );
            if (data === null || error) {
                console.error(error);
                throw new Error(":warning: エラーが発生しました");
            }

            const found = data.find((v) => v.PCKeyString === pckey);
            if (found) {
                return Math.round(found.ratio * 100 * 100) / 100;
            }

            return null;
        })
    );

    const icon = `https://cdn.laoplus.net/formationicon/FormationIcon_${pckey.replace(
        /^Char_/,
        ""
    )}.webp`;
    const numWithComma = new Intl.NumberFormat();
    const embed = new EmbedBuilder();
    embed
        .setThumbnail(icon)
        .setTitle(`${emoji.tactics_manual} ${unit.name}`)
        .setURL(`https://lo.swaytwig.com/units/${unit.key2}`)
        .setDescription("を排出したレシピ一覧")
        .addFields(
            recipes.map((recipe, index) => {
                const figureSpace = String.fromCodePoint(0x2007);
                const count = numWithComma.format(recipe.count);

                return {
                    name: [
                        `__${index + 1}.__`, //
                        `${count} 回排出`,
                        `${ratios[index] ? `(${ratios[index]}%)` : ""}`,
                    ].join(figureSpace),
                    value: createRecipeString(recipe, "markdown"),
                };
            })
        )
        .setFooter({ text: `最終データ更新日時` })
        .setTimestamp(new Date(1669532400000));

    const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
            .setCustomId("select_search_by_recipe")
            .setPlaceholder("それらのレシピでよく出る戦闘員を検索する")
            .addOptions(
                recipes.map((recipe) => {
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
