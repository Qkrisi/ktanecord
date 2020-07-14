const { embed } = require('../utils')
const config = require('../../config.json')

module.exports.run = (client, message, args) => {
	if(args.admin) return message.channel.send(embed.getEmbed("AdminHelp", {
		cooldownCMD: `\`${config.token}setcooldown <seconds>\``,
		cooldownValue: `🕒 Sets the cooldown value of  \`${config.token}repo --random\` (at least 0)`
	}))
    message.channel.send(embed.getEmbed("Help",{
			helpCMD: `\`${config.token}help\``,
			pingCMD: `\`${config.token}ping\``,
			repoCMD: `\`${config.token}repo\``,
			statsCMD: `\`${config.token}tp stats [player] [streamer]\``,
			statsValue: `<:Twitch:702495822281048129> Shows player statistics on Twitch Plays (For a list of streamers use \`${config.token}tp streamers\`)`,
			profileCMD: `\`${config.token}profile\``,
			b: '\u200b'
		}))
}
