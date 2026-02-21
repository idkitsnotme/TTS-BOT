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

// Force tweetnacl to be the encryption provider
require('tweetnacl');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`✅ Texty is online! Using ${process.version}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content) return;

    const voiceChannel = message.member.voice.channel;
    if (voiceChannel) {
        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(message.content)}`;
            
            // We use 'arbitrary' to let FFmpeg handle the stream type automatically
            const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });
            const player = createAudioPlayer();
            
            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => console.log('🔊 Playing audio now...'));
            player.on('error', err => console.error('❌ Player Error:', err.message));

        } catch (error) {
            console.error("❌ Voice Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
