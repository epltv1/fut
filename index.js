const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Your Raw Gist URL
const GIST_URL = 'https://gist.githubusercontent.com/epltv1/cc21ac2b76f1b03da87bb81442230ce9/raw/cfd7d20861f5c07b6b4fb7206b3a4565555962c2/schedule.json';

const command = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Post the live stream schedule');

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
    console.log('Bot is online!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'schedule') return;
    await interaction.deferReply({ ephemeral: true });

    try {
        const response = await axios.get(GIST_URL);
        const streams = response.data.streams[0].streams;
        const now = new Date().getTime();

        for (const s of streams) {
            const startDate = new Date(s.starts_at).getTime();
            const endDate = new Date(s.ends_at).getTime();

            // Auto-delete check: If the event already finished, skip it
            if (now > endDate) continue;

            const startTimestamp = Math.floor(startDate / 1000);

            const embed = new EmbedBuilder()
                .setTitle(s.name)
                .setColor(0x0099ff)
                .addFields(
                    { name: 'Starts', value: `<t:${startTimestamp}:R>`, inline: true },
                    { name: 'Watch', value: `[Link](${s.streams[0].url})`, inline: true }
                );

            const msg = await interaction.channel.send({ embeds: [embed] });

            // Auto-delete after event ends
            const timeUntilEnd = endDate - now;
            setTimeout(async () => {
                try { await msg.delete(); } catch (err) { console.error("Could not delete message"); }
            }, timeUntilEnd);
        }
        await interaction.editReply('✅ Schedule posted!');
    } catch (e) {
        await interaction.editReply('❌ Error fetching schedule.');
    }
});

client.login(process.env.DISCORD_TOKEN);
