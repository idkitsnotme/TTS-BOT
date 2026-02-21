// 1. FORCE FFmpeg Path immediately
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    StreamType
} = require('@discordjs/voice');

// Load encryption
require('sodium-native');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} is ready to speak!`);
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

        // Generate Audio URL
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(message.content)}`;
        
        // 2. Specify the InputType as Arbitrary to force FFmpeg to process it
        const resource = createAudioResource(url, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });
        resource.volume.setVolume(1.0);

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        // --- TRACKING LOGS ---
        player.on(AudioPlayerStatus.Playing, () => console.log('🔊 AUDIO START: Bot is actually sending sound.'));
        player.on(AudioPlayerStatus.Idle, () => console.log('⏹️ AUDIO END: Player is now idle.'));
        player.on('error', err => console.error('❌ PLAYER ERROR:', err.message));

    } catch (error) {
        console.error("❌ CONNECTION ERROR:", error);
    }
});

client.login(process.env.TOKEN);
