import {
    CacheType,
    ChatInputCommandInteraction,
    SelectMenuInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { recipe } from "./logic/recipe";
import { unit } from "./logic/unit";

const data = new SlashCommandBuilder()
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
    );

export default {
    data,
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

        try {
            await interaction.deferReply();
            const response = await recipe({
                metal,
                nutrientHead,
                nutrientChest,
                nutrientLeg,
                power,
                specialItem,
            });
            await interaction.followUp(response);
        } catch (error) {
            if (error instanceof Error) {
                await interaction.followUp({
                    content: error.message,
                    ephemeral: true,
                });
            }
            return;
        }
    },
    async executeSelectMenu(interaction: SelectMenuInteraction<CacheType>) {
        try {
            await interaction.deferReply();
            const response = await unit({
                pckey: interaction.values[0],
            });
            await interaction.followUp(response);
        } catch (error) {
            if (error instanceof Error) {
                await interaction.followUp({
                    content: error.message,
                    ephemeral: true,
                });
            }
            return;
        }
    },
};
