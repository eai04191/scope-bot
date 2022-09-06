import { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { supabase } from "../../db";
import { createRecipeString } from "../../util/createRecipeString";
import { getUnit } from "../../util/getUnit";
import { FindByRecipeResponse } from "./type";

export async function recipe({
    metal,
    nutrientHead,
    nutrientChest,
    nutrientLeg,
    power,
    specialItem,
}: {
    metal: number;
    nutrientHead: number;
    nutrientChest: number;
    nutrientLeg: number;
    power: number;
    specialItem: number;
}) {
    if (
        metal % 10 !== 0 ||
        nutrientHead % 10 !== 0 ||
        nutrientChest % 10 !== 0 ||
        nutrientLeg % 10 !== 0 ||
        power % 10 !== 0 ||
        specialItem % 10 !== 0
    ) {
        throw new Error("入力値は10の倍数である必要があります");
    }

    if ([0, 10, 20, 50, 100].some((v) => v === specialItem) === false) {
        throw new Error(
            "高級モジュールの数は`0`, `10`, `20`, `50`, `100`のいずれかでなければなりません"
        );
    }

    const { data: units, error } = await supabase
        .rpc<FindByRecipeResponse>("find_pckey_by_recipe", {
            metal,
            nutrient_head: nutrientHead,
            nutrient_chest: nutrientChest,
            nutrient_leg: nutrientLeg,
            power,
            special_item: specialItem,
        })
        .limit(6);
    if (error) {
        console.error(error);
        throw new Error(":warning: エラーが発生しました");
    }

    if (units.length === 0) {
        throw new Error(
            `:thinking: ${createRecipeString({
                MetalUsed: metal,
                NutrientHeadUsed: nutrientHead,
                NutrientChestUsed: nutrientChest,
                NutrientLegUsed: nutrientLeg,
                PowerUsed: power,
                SpecialItemUsed: specialItem,
            })}で製造された戦闘員は見つかりませんでした`
        );
    }

    const numWithComma = new Intl.NumberFormat();
    const embed = new EmbedBuilder();
    embed
        .setTitle(
            createRecipeString(
                {
                    MetalUsed: metal,
                    NutrientHeadUsed: nutrientHead,
                    NutrientChestUsed: nutrientChest,
                    NutrientLegUsed: nutrientLeg,
                    PowerUsed: power,
                    SpecialItemUsed: specialItem,
                },
                "markdown"
            )
        )
        .setDescription(
            `で排出された戦闘員 (全 ${numWithComma.format(units[0].total)}回)`
        )
        .addFields(
            units.map((response, index) => {
                const unit = getUnit(response.PCKeyString);
                const ratio = Math.round(response.ratio * 100 * 100) / 100;
                const count = numWithComma.format(response.count);

                return {
                    name: `__${index + 1}.__ ${count} 回排出 (${ratio}%)`,
                    value: `${unit.emoji} ${unit.name}`,
                    inline: true,
                };
            })
        );

    const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
            .setCustomId("select_search_by_unit")
            .setPlaceholder("それらの戦闘員がよく出るレシピを検索する")
            .addOptions(
                units.map(({ PCKeyString }) => {
                    const unit = getUnit(PCKeyString);
                    return {
                        label: unit.name,
                        value: unit.key,
                        emoji: unit.emoji,
                    };
                })
            )
    );

    return {
        embeds: [embed],
        components: [row],
    };
}
