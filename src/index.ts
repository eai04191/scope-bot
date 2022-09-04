import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { getCommandsWithCollection } from "./util/getCommands";

const token = process.env.DISCORD_TOKEN!;
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!token || !supabaseUrl || !supabaseKey) {
    console.log("token", token);
    console.log("supabaseUrl", supabaseUrl);
    console.log("supabaseKey", supabaseKey);
    throw new Error("Missing environment variables");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = await getCommandsWithCollection();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
        });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        if (!command.executeAutocomplete) {
            return;
        }
        await command.executeAutocomplete(interaction);
    } catch (error) {
        console.error(error);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isSelectMenu()) return;

    const command = (() => {
        switch (interaction.customId) {
            case "select_search_by_recipe":
                return interaction.client.commands.get("unit");
            case "select_search_by_unit":
                return interaction.client.commands.get("recipe");
            default:
                return null;
        }
    })();

    if (!command) return;

    try {
        if (!command.executeSelectMenu) {
            return;
        }
        await command.executeSelectMenu(interaction);
    } catch (error) {
        console.error(error);
    }
});

client.login(token);
