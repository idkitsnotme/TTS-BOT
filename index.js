process.env.FFMPEG_PATH = require('ffmpeg-static');

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');

// This forces the encryption library to load immediately
try {
    require('libsodium');
    console.log("✅ Encryption library loaded!");
} catch (e) {
    console.error("❌ Encryption library failed to load:", e);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
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

            // Wait until the connection is ready (prevents the AbortError)
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            const text = encodeURIComponent(message.content);
            const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${text}`;
            
            const resource = createAudioResource(url);
            const player = createAudioPlayer();
            
            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => console.log('▶️ Speaking...'));
            player.on('error', err => console.error('❌ Player Error:', err.message));

        } catch (error) {
            console.error("❌ Voice Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
