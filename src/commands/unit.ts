import {
    APIApplicationCommandOptionChoice,
    AutocompleteInteraction,
    CacheType,
    ChatInputCommandInteraction,
    SelectMenuInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { unit } from "./logic/unit";
import { recipe } from "./logic/recipe";
import { getUnits } from "../util/getUnit";

const unitChoices: APIApplicationCommandOptionChoice<string>[] = getUnits().map(
    (unit) => {
        return {
            name: `${unit.name} (${unit.key3})`,
            value: unit.key,
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
        const pckey = interaction.options.getString("name", true);

        try {
            const response = await unit({
                pckey,
            });
            await interaction.reply(response);
        } catch (error) {
            if (error instanceof Error) {
                console.error("units execute", error);
                await interaction.reply({
                    content: error.message,
                    ephemeral: true,
                });
            }
            return;
        }
    },
    async executeAutocomplete(interaction: AutocompleteInteraction<CacheType>) {
        const focusedValue = interaction.options.getFocused();
        const filtered = unitChoices.filter((choice) =>
            choice.name.toLowerCase().includes(focusedValue.toLowerCase())
        );
        const slicedFiltered = filtered.slice(0, 25);
        await interaction.respond(slicedFiltered);
    },
    async executeSelectMenu(interaction: SelectMenuInteraction<CacheType>) {
        try {
            const dataArray = JSON.parse(interaction.values[0]);
            const data = {
                metal: dataArray[0],
                nutrientHead: dataArray[1],
                nutrientChest: dataArray[2],
                nutrientLeg: dataArray[3],
                power: dataArray[4],
                specialItem: dataArray[5],
            };
            const response = await recipe(data);
            await interaction.reply(response);
        } catch (error) {
            if (error instanceof Error) {
                await interaction.reply({
                    content: error.message,
                    ephemeral: true,
                });
            }
        }
    },
};
