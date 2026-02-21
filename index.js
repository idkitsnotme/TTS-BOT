const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    entersState 
} = require('@discordjs/voice');

const googleTTS = require('google-tts-api');
const ffmpeg = require('ffmpeg-static'); // Forces Railway to use our installed audio engine

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
    // Ignore other bots and empty messages
    if (message.author.bot || !message.content) return;

    const voiceChannel = message.member.voice.channel;
    
    if (voiceChannel) {
        try {
            // 1. Join the channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            // 2. Wait until the bot is 100% fully connected
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            // 3. THE FIX: Wait 1 second so the audio socket doesn't "swallow" the start of the sentence
            setTimeout(() => {
                try {
                    // Generate a safe audio URL using the API
                    const url = googleTTS.getAudioUrl(message.content, {
                        lang: 'en',
                        slow: false,
                        host: 'https://translate.google.com',
                    });
                    
                    const resource = createAudioResource(url);
                    const player = createAudioPlayer();
                    
                    // Subscribe the connection to the player BEFORE playing
                    connection.subscribe(player);
                    player.play(resource);

                    player.on('error', error => {
                        console.error('Audio Player Error:', error.message);
                    });

                } catch (err) {
                    console.error("TTS Generation Error:", err);
                }
            }, 1000); // 1000 milliseconds = 1 second

        } catch (error) {
            console.error("Voice Connection Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
