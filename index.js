const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource,
    AudioPlayerStatus, StreamType, VoiceConnectionStatus, entersState
} = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = '!say';

client.on('ready', () => {
    console.log(`✅ TEXTY IS ONLINE! Use ${PREFIX} [message]`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim();
    if (!args) return;

    const channel = message.member?.voice.channel;
    if (!channel) return message.reply("Join a voice channel first!");

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
            // 2026 Mandatory Encryption Flag
            daveEncryption: true 
        });

        // WAIT for the secure handshake to finish
        await entersState(connection, VoiceConnectionStatus.Ready, 5000);

        const player = createAudioPlayer();
        connection.subscribe(player);

        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(args)}`;
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => console.log(`🔊 Playing: ${args}`));
        player.on('error', err => console.error('❌ Audio Error:', err.message));

    } catch (error) {
        console.error("❌ Connection Failed:", error);
    }
});

client.login(process.env.TOKEN);
