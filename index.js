const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const discordTTS = require('discord-tts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('messageCreate', async (message) => {
    // 1. Ignore other bots
    if (message.author.bot) return;

    // 2. Find the person who typed the message
    const voiceChannel = message.member.voice.channel;

    // 3. If the person is in a Voice Channel, the bot joins them
    if (voiceChannel) {
        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            // 4. Generate and play the TTS
            const stream = discordTTS.getVoiceStream(message.content);
            const resource = createAudioResource(stream);
            const player = createAudioPlayer();

            player.play(resource);
            connection.subscribe(player);
        } catch (error) {
            console.error("Couldn't join or speak:", error);
        }
    }
});

client.login(process.env.TOKEN);
