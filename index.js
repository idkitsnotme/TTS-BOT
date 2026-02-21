const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const discordTTS = require('discord-tts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Allows reading messages
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', async () => {
    const commands = [
        new SlashCommandBuilder().setName('join').setDescription('Join your voice channel'),
        new SlashCommandBuilder().setName('leave').setDescription('Leave the voice channel'),
    ].map(cmd => cmd.toJSON());
    await client.application.commands.set(commands);
    console.log('TTS Bot is Online!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'join') {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply("Join a VC first!");
        joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        await interaction.reply("I'm listening! Type anything in chat.");
    }
    if (interaction.commandName === 'leave') {
        getVoiceConnection(interaction.guild.id)?.destroy();
        await interaction.reply("Goodbye!");
    }
});

// AUTO-READ LOGIC (Matches your video)
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
        const stream = discordTTS.getVoiceStream(message.content);
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);
    }
});

client.login(process.env.TOKEN);
