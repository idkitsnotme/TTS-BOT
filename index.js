process.env.FFMPEG_PATH = require('ffmpeg-static');

const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource,
    AudioPlayerStatus,
    StreamType,
    generateDependencyReport
} = require('@discordjs/voice');

// This prints a health check of your encryption libraries in the logs
console.log(generateDependencyReport());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content) return;

    const channel = message.member?.voice.channel;
    if (channel) {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        // Using StreamElements (Brian voice)
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(message.content)}`;
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });
        const player = createAudioPlayer();

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => console.log('🔊 Playing...'));
        player.on('error', err => console.error('❌ Player Error:', err.message));
    }
});

client.login(process.env.TOKEN);
