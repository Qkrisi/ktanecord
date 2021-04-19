const main = require("../main.js")
const { embed } = require('../utils')
const config = require('../../config.json')

module.exports.run = (client, message, args) => {
	if(args.cs) return message.channel.send(embed.getEmbed("CSHelp", {
		setcs: `\`${config.token}setcs <module>//<value>//<reason>\``,
		setbosscs: `\`${config.token}setbosscs <module>//<general value>//<ppm value>//<reason>\``,
		clearcs: `\`${config.token}clearcs <module>\``,
		comment: `\`${config.token}comment <module>//<comment>\``,
		getcs: `\`${config.token}getcs <module>\``
	}))
	let body = main.getCooldown()
	let Slash = `Slash commands are currently ${!body.SlashCommands || !body.SlashCommands.includes(message.guild.id) ? "disabled" : "enabled"} on this server.`
	if (args.admin) return message.channel.send(embed.getEmbed(main.Enable_Cooldown ? "AdminHelp" : "AdminHelpNoCooldown", {
		SCCMD: `\`${config.token}sc <enable/disable>\``,
		cooldownCMD: `\`${config.token}setcooldown <seconds>\``,
		cooldownValue: `🕒 Sets the cooldown value of  \`${config.token}repo --random\` (at least 0)`,
		manageCMD: `\`${config.token}manage maintainers/bans add/remove <User ID>\``,
		SCValue: `Enable or disable slash commands (${Slash})`
	}))
	return message.channel.send(embed.getEmbed("Help", {
		helpCMD: `\`${config.token}help\``,
		pingCMD: `\`${config.token}ping\``,
		repoCMD: `\`${config.token}repo <module or --random>\``,
		statsCMD: `\`${config.token}tp stats [player] [streamer]\``,
		statsValue: `<:Twitch:702495822281048129> Shows player statistics on Twitch Plays (For a list of streamers use \`${config.token}tp streamers\`)`,
		streamCMD: `\`${config.token}tp current/data [streamer]\``,
		profileCMD: `\`${config.token}profile\``,
		matchCMD: `\`${config.token}match <regular expression (full or simple)>\``,
		matchDesc: "🔑 Shows the number of modules that matches the specified expression and list up to 10 ones.\n[Full RegEx](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet)\n[Simple RegEx](https://kb.iu.edu/d/ahsf)",
		contactCMD: `\`${config.token}contact <modder>\``,
		scoreCMD: `\`${config.token}score <module>\``,
		ideaCMD:`\`${config.token}idea [name] [--InProgress --NotReady --Unknown --IsReady]\``,
		Reference: "**-**Modules can be the name, the ID, the periodic symbol or a Regular Expression to the module\n**-**Simple RegEx also has a `#` wildcard here which represents any numeric character (0-9)\nIf slash commands are enabled on a server, you can also select the command and arguments you wish to invoke by typing `/`. "+Slash,
		b: '\u200b'
	}))
}
