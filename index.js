const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
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
                selfDeaf: false // Important so bot doesn't look deafened
            });

            // Google TTS Link
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message.content)}&tl=en&client=tw-ob`;
            
            const resource = createAudioResource(url);
            const player = createAudioPlayer();

            player.play(resource);
            connection.subscribe(player);

            player.on('error', error => {
                console.error('Audio Player Error:', error.message);
            });

        } catch (error) {
            console.error("Connection Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
