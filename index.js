const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const discordTTS = require('discord-tts');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Replace 'YOUR_BOT_TOKEN' with your actual token from the Discord Dev Portal
const TOKEN = 'YOUR_BOT_TOKEN'; 

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! TTS is ready.`);
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Trigger command (e.g., !say Hello)
    if (message.content.startsWith('!say ')) {
        const text = message.content.slice(5);
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply("You need to be in a voice channel for me to speak!");
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Generate the TTS stream
            const stream = discordTTS.getVoiceStream(text);
            const resource = createAudioResource(stream);
            const player = createAudioPlayer();

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                // Optional: Disconnect after speaking
                // connection.destroy(); 
            });

        } catch (error) {
            console.error(error);
            message.reply("I had trouble speaking that!");
        }
    }
});

client.login(TOKEN);
