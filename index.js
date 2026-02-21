const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    entersState, 
    AudioPlayerStatus 
} = require('@discordjs/voice');

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
            // 1. Join the channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
            });

            // 2. Wait until we are actually connected before playing
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

            // 3. Create the TTS URL
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(message.content)}&tl=en&client=tw-ob`;
            
            // 4. Create and play the resource
            const resource = createAudioResource(url);
            const player = createAudioPlayer();
            
            connection.subscribe(player);
            player.play(resource);

            // Debugging logs - Check your Railway Logs for these!
            player.on('stateChange', (oldState, newState) => {
                console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
            });

            player.on('error', error => console.error('Player Error:', error.message));

        } catch (error) {
            console.error("Voice Error:", error);
        }
    }
});

client.login(process.env.TOKEN);
