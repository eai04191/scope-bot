import { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import emoji from "../../data/emoji.json" assert { type: "json" };
import { supabase } from "../../db";
import { getUnit } from "../../util/getUnit";

type Response = {
    PCKeyString: string;
    count: number;
    ratio: number;
    total: number;
};

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

    const { data: units, error } = await supabase.rpc<Response>(
        "find_pckey_by_recipe",
        {
            metal,
            nutrient_head: nutrientHead,
            nutrient_chest: nutrientChest,
            nutrient_leg: nutrientLeg,
            power,
            special_item: specialItem,
        }
    );
    if (error) {
        console.error(error);
        throw new Error(":warning: エラーが発生しました");
    }

    if (units.length === 0) {
        throw new Error(
            ":thinking: このレシピで製造されたユニットが見つかりませんでした"
        );
    }

    const numWithComma = new Intl.NumberFormat();
    const embed = new EmbedBuilder();
    embed
        .setTitle(
            [
                `${emoji.metal} ${metal}`,
                `${emoji.nutrient} (${nutrientHead} / ${nutrientChest} / ${nutrientLeg})`,
                `${emoji.power} ${power}`,
                specialItem !== 0
                    ? `${emoji.advanced_module} ${specialItem}`
                    : null,
            ]
                .filter((a) => a)
                .join(" / ")
        )
        .setDescription(
            `で排出された戦闘員 (全 ${numWithComma.format(units[0].total)}回)`
        )
        .addFields(
            units.slice(0, 6).map((response, index) => {
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
                units.slice(0, 6).map(({ PCKeyString }) => {
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
