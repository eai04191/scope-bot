import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("生存確認"),
    async execute(interaction) {
        await interaction.reply(
            "https://cdn.discordapp.com/attachments/260221489318461440/1015579018910765117/miho_ping.jpg"
        );
    },
};
