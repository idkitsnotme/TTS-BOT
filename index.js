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
    console.log(`✅ Texty 2026 is Online. Command: ${PREFIX}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim();
    if (!args) return;

    const channel = message.member?.voice.channel;
    if (!channel) return;

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        // FORCE WAIT for the 2026 Encryption Handshake
        await entersState(connection, VoiceConnectionStatus.Ready, 5000);

        const player = createAudioPlayer();
        connection.subscribe(player);

        // TTS URL
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(args)}`;
        
        // Use Arbitrary input type to let FFmpeg handle the 2026 bitrate requirements
        const resource = createAudioResource(url, { 
            inputType: StreamType.Arbitrary,
            inlineVolume: true 
        });

        if (resource.volume) resource.volume.setVolume(1.0);

        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => console.log(`🔊 Audio Transmitting: "${args}"`));
        player.on('error', err => console.error('❌ Audio Error:', err.message));

    } catch (error) {
        console.error("❌ Voice Connection Failed:", error);
    }
});

client.login(process.env.TOKEN);
