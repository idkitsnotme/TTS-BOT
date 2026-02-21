const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const ffmpeg = require('ffmpeg-static'); // Add this line

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
            });

            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message.content)}&tl=en&client=tw-ob`;
            
            // We tell the resource exactly where FFmpeg is
            const resource = createAudioResource(url, {
                inlineVolume: true
            });
            
            const player = createAudioPlayer();
            player.play(resource);
            connection.subscribe(player);

            player.on('error', error => {
                console.error('Player Error:', error.message);
            });

        } catch (error) {
            console.error("Connection Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
