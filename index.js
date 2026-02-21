process.env.FFMPEG_PATH = require('ffmpeg-static');

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    entersState 
} = require('@discordjs/voice');
const googleTTS = require('google-tts-api');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
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

            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            // 1-second delay so the audio socket has time to open
            setTimeout(() => {
                try {
                    const url = googleTTS.getAudioUrl(message.content, {
                        lang: 'en',
                        slow: false,
                        host: 'https://translate.google.com',
                    });
                    
                    const resource = createAudioResource(url);
                    const player = createAudioPlayer();
                    
                    connection.subscribe(player);
                    player.play(resource);

                    player.on('error', error => {
                        console.error('Audio Player Error:', error.message);
                    });

                } catch (err) {
                    console.error("TTS Generation Error:", err);
                }
            }, 1000);

        } catch (error) {
            console.error("Voice Connection Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
