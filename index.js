const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    StreamType,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

// Load encryption wrappers
const sodium = require('libsodium-wrappers');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', async () => {
    // Wait for sodium to be ready before doing anything
    await sodium.ready;
    console.log(`✅ Encryption Ready. Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content) return;

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return;

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        // CRITICAL: Wait for the connection to be ready with encryption
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5000);
        } catch (err) {
            console.error("Connection failed to reach Ready state:", err);
            return;
        }

        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(message.content)}`;
        
        const resource = createAudioResource(url, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => console.log('🔊 Playing...'));
        player.on('error', err => console.error('❌ Player Error:', err.message));

    } catch (error) {
        console.error("❌ Voice Error:", error);
    }
});

client.login(process.env.TOKEN);
