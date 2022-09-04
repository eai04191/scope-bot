import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import emoji from "../data/emoji.json" assert { type: "json" };
import { supabase } from "../db";

type Hoge = {
    PCKeyString: string;
    count: number;
    ratio: number;
    total: number;
};

export default {
    data: new SlashCommandBuilder()
        .setName("recipe")
        .setDescription("指定したレシピから作られた戦闘員を検索します")
        .addIntegerOption((option) =>
            option
                .setName("metal")
                .setDescription("投入された部品の量")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("nutrient_head")
                .setDescription("投入された栄養(頭)の量")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option

                .setName("nutrient_chest")
                .setDescription("投入された栄養(上部)の量")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option

                .setName("nutrient_leg")
                .setDescription("投入された栄養(下部)の量")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option

                .setName("power")
                .setDescription("投入された電力の量")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option

                .setName("special_item")
                .setDescription(
                    "投入された高級モジュールの量 0で一般製造 10,20,50,100で特殊製造"
                )
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const metal = interaction.options.getInteger("metal", true);
        const nutrientHead = interaction.options.getInteger(
            "nutrient_head",
            true
        );
        const nutrientChest = interaction.options.getInteger(
            "nutrient_chest",
            true
        );
        const nutrientLeg = interaction.options.getInteger(
            "nutrient_leg",
            true
        );
        const power = interaction.options.getInteger("power", true);
        const specialItem = interaction.options.getInteger(
            "special_item",
            true
        );

        if (
            metal % 10 !== 0 ||
            nutrientHead % 10 !== 0 ||
            nutrientChest % 10 !== 0 ||
            nutrientLeg % 10 !== 0 ||
            power % 10 !== 0 ||
            specialItem % 10 !== 0
        ) {
            await interaction.reply({
                content: "パラメータは10の倍数でなければなりません",
                ephemeral: true,
            });
            return;
        }

        if ([0, 10, 20, 50, 100].some((v) => v === specialItem) === false) {
            await interaction.reply({
                content:
                    "高級モジュールの数は`0`, `10`, `20`, `50`, `100`のいずれかでなければなりません",
                ephemeral: true,
            });
            return;
        }

        const { data: units, error } = await supabase.rpc<Hoge>(
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
            await interaction.reply({
                content: ":warning: エラーが発生しました",
                ephemeral: true,
            });
            return;
        }

        if (units.length === 0) {
            await interaction.reply({
                content:
                    ":thinking: このレシピで製造されたユニットが見つかりませんでした",
                ephemeral: true,
            });
            return;
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
                `で排出された戦闘員 (全 ${numWithComma.format(
                    units[0].total
                )}回)`
            )
            .addFields(
                units.slice(0, 6).map((unit, index) => {
                    const name = unit.PCKeyString.replace(
                        /^Char_.+?_/,
                        ""
                    ).replace("_N", "");
                    const ratio = Math.round(unit.ratio * 100 * 100) / 100;
                    const count = numWithComma.format(unit.count);

                    return {
                        name: `__${index + 1}.__ ${count} 回排出 (${ratio}%)`,
                        value: `${name}`,
                        inline: true,
                    };
                })
            );

        await interaction.reply({ embeds: [embed] });
    },
};
