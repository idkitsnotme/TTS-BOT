// 1. Force FFmpeg to load from the static package
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath;

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    StreamType,
    generateDependencyReport 
} = require('@discordjs/voice');

// Print diagnostic report on startup
console.log("--- VOICE HEALTH REPORT ---");
console.log(generateDependencyReport());
console.log("---------------------------");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`✅ Texty is live as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Ignore bots and messages without content
    if (message.author.bot || !message.content) return;

    const channel = message.member?.voice.channel;
    
    if (channel) {
        try {
            // 2. Connect with the 2026 Encryption Flag
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
                // Some 2026 environments require this explicit flag
                daveEncryption: true 
            });

            // 3. Audio Source (StreamElements Brian)
            const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(message.content)}`;
            
            // 4. Create resource with 'inlineVolume' to force a kickstart
            const resource = createAudioResource(url, { 
                inputType: StreamType.Arbitrary,
                inlineVolume: true 
            });

            // Set volume to 100% (1.0)
            if (resource.volume) {
                resource.volume.setVolume(1.0);
            }

            const player = createAudioPlayer();
            connection.subscribe(player);
            player.play(resource);

            // Logging for debugging
            player.on(AudioPlayerStatus.Playing, () => {
                console.log(`🔊 Speaking: "${message.content}"`);
            });

            player.on('error', err => {
                console.error('❌ Audio Player Error:', err.message);
            });

        } catch (error) {
            console.error("❌ Connection Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
