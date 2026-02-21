const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const discordTTS = require('discord-tts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Railway will provide this from the "Variables" tab
const TOKEN = process.env.TOKEN; 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! TTS is online.`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command to trigger the TTS
    if (message.content.startsWith('!say ')) {
        const text = message.content.slice(5).trim();
        const voiceChannel = message.member.voice.channel;

        if (!text) return message.reply("Please provide some text to say!");
        if (!voiceChannel) return message.reply("Join a voice channel first!");

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Logic to play the TTS
            const stream = discordTTS.getVoiceStream(text);
            const resource = createAudioResource(stream);
            const player = createAudioPlayer();

            player.play(resource);
            connection.subscribe(player);

            // Error handling for the player
            player.on('error', error => {
                console.error(`Error: ${error.message}`);
            });

        } catch (error) {
            console.error(error);
            message.reply("I had trouble joining the voice channel.");
        }
    }
});

// Use the environment variable to log in
if (!TOKEN) {
    console.error("ERROR: No TOKEN found in environment variables!");
    process.exit(1);
}

client.login(TOKEN);
