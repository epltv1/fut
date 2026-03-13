const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Your Gist Raw URL
const GIST_URL = 'https://gist.githubusercontent.com/epltv1/cc21ac2b76f1b03da87bb81442230ce9/raw/cfd7d20861f5c07b6b4fb7206b3a4565555962c2/schedule.json';

const command = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Post the current stream schedule');

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
    console.log('Bot is online and command registered!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'schedule') {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Fetch directly from your Gist
            const response = await axios.get(GIST_URL);
            const data = response.data;
            const streams = data.streams[0].streams;

            for (const s of streams) {
                const embed = new EmbedBuilder()
                    .setTitle(s.name)
                    .setImage(s.poster)
                    .addFields(
                        { name: 'Start Time', value: s.starts_at, inline: true },
                        { name: 'Stream Link', value: `[Watch Now](${s.streams[0].url})`, inline: true }
                    )
                    .setColor(0x0099ff);
                
                await interaction.channel.send({ embeds: [embed] });
            }
            await interaction.editReply({ content: '✅ Schedule posted successfully!' });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: '❌ Failed to fetch schedule from Gist.' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
