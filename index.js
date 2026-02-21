// Force the FFmpeg path for Railway
process.env.FFMPEG_PATH = require('ffmpeg-static');

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus
} = require('@discordjs/voice');

// This forces the encryption check immediately
try {
    require('sodium-native');
    console.log("✅ Native Encryption (Sodium) is ACTIVE");
} catch (e) {
    console.log("⚠️ Native Encryption not found, trying fallback...");
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`✅ Bot is live as ${client.user.tag}`);
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

            // Use StreamElements (Reliable)
            const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(message.content)}`;
            
            const resource = createAudioResource(url);
            const player = createAudioPlayer();
            
            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => console.log('▶️ Playing Audio...'));
            player.on('error', err => console.error('❌ Player Error:', err.message));

        } catch (error) {
            console.error("❌ Voice Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
