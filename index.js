const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    entersState, 
    StreamType 
} = require('@discordjs/voice');

// This line is vital for Railway to find the audio engine
const ffmpeg = require('ffmpeg-static');

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

            // Wait until the bot is fully connected
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            // Google TTS URL
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message.content)}&tl=en&client=tw-ob`;
            
            const resource = createAudioResource(url, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true
            });

            const player = createAudioPlayer();
            player.play(resource);
            connection.subscribe(player);

            player.on('error', error => {
                console.error('Audio Player Error:', error.message);
            });

        } catch (error) {
            console.error("Voice Connection Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
