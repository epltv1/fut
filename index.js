const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Post a stream schedule')
    .addStringOption(option => option.setName('category').setDescription('The sport name').setRequired(true))
    .addStringOption(option => option.setName('json').setDescription('Paste your JSON here').setRequired(true));

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
    console.log('Bot is online and command registered!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const jsonString = interaction.options.getString('json');
    try {
        const data = JSON.parse(jsonString);
        const streams = data.streams[0].streams;
        for (const s of streams) {
            const embed = new EmbedBuilder().setTitle(s.name).setImage(s.poster).addFields({ name: 'Start', value: s.starts_at });
            await interaction.channel.send({ embeds: [embed] });
        }
        await interaction.reply({ content: 'Posted!', ephemeral: true });
    } catch (e) { await interaction.reply({ content: 'Invalid JSON', ephemeral: true }); }
});

client.login(process.env.DISCORD_TOKEN);
