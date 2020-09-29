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
			repoCMD: `\`${config.token}repo <module or --random>\``,
			statsCMD: `\`${config.token}tp stats [player] [streamer]\``,
			statsValue: `<:Twitch:702495822281048129> Shows player statistics on Twitch Plays (For a list of streamers use \`${config.token}tp streamers\`)`,
			profileCMD: `\`${config.token}profile\``,
			matchCMD: `\`${config.token}match <regular expression (simple if --simple is specified)>\``,
			matchDesc: "🔑 Shows the number of modules that matches the specified expression and list up to 10 ones.\n[Full RegEx](https://regexr.com/)\n[Simple RegEx](https://docs.microsoft.com/en-us/previous-versions/windows/desktop/indexsrv/ms-dos-and-windows-wildcard-characters)",
			scoreCMD: `\`${config.token}score <module>\``,
			b: '\u200b'
		}))
}
