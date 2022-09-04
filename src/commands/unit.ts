import "dotenv/config";
import {
    APIApplicationCommandOptionChoice,
    AutocompleteInteraction,
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import knownUnits from "../data/units.json" assert { type: "json" };
import emoji from "../data/emoji.json" assert { type: "json" };
import { supabase } from "../db";

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

const unitChoices: APIApplicationCommandOptionChoice<string>[] = knownUnits.map(
    (unitId: string) => {
        const maker = unitId.match(/^Char_.+?_/)[0];
        return {
            name: unitId.replace(maker, "").replace("_N", ""),
            value: unitId,
        };
    }
);

export default {
    data: new SlashCommandBuilder()
        .setName("unit")
        .setDescription("指定した戦闘員が作られたレシピを検索します")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("戦闘員の名前")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const pckey = interaction.options.getString("name");
        if (!pckey) {
            await interaction.reply("name is required");
            return;
        }

        const { data: recipes, error } = await supabase.rpc<Recipe>(
            "find_recipe_by_pckey",
            { pckey }
        );
        if (error) {
            console.error(error);
            await interaction.reply({
                content: ":warning: エラーが発生しました",
                ephemeral: true,
            });
            return;
        }

        if (recipes.length === 0) {
            await interaction.reply({
                content: ":thinking: レシピが見つかりませんでした",
                ephemeral: true,
            });
            return;
        }

        const icon = `https://cdn.laoplus.net/formationicon/FormationIcon_${pckey.replace(
            /^Char_/,
            ""
        )}.webp`;
        const name = pckey.replace(/^Char_.+?_/, "").replace("_N", "");
        const numWithComma = new Intl.NumberFormat();
        const embed = new EmbedBuilder();
        embed
            .setThumbnail(icon)
            .setTitle(name)
            .setDescription("を排出したレシピ一覧")
            .addFields(
                recipes.slice(0, 5).map((recipe, index) => {
                    const count = numWithComma.format(recipe.count);
                    return {
                        name: `__${index + 1}.__ ${count} 回排出`,
                        value:
                            `${recipe.IsSpecial ? "🟥" : "🟩"} ` +
                            [
                                `${emoji.metal} **${recipe.MetalUsed}**`,
                                `${emoji.nutrient} (**${recipe.NutrientHeadUsed}**`,
                                `**${recipe.NutrientChestUsed}**`,
                                `**${recipe.NutrientLegUsed}**)`,
                                `${emoji.power} **${recipe.PowerUsed}**`,
                                recipe.SpecialItemUsed !== 0
                                    ? `${emoji.advanced_module} **${recipe.SpecialItemUsed}**`
                                    : null,
                            ]
                                .filter((a) => a)
                                .join(" / "),
                    };
                })
            );

        await interaction.reply({ embeds: [embed] });
    },
    async executeAutocomplete(interaction: AutocompleteInteraction<CacheType>) {
        const focusedValue = interaction.options.getFocused();
        const filtered = unitChoices.filter((choice) =>
            choice.name.toLowerCase().includes(focusedValue.toLowerCase())
        );
        const slicedFiltered = filtered.slice(0, 25);
        await interaction.respond(slicedFiltered);
    },
};
