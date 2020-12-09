const Permissions = require("discord.js").Permissions.FLAGS
const { getCooldown } = require("../main.js")
const fs = require("fs")

module.exports.run = (client, message, args) => {
	if (!message.guild) return message.channel.send("This command doesn't work in DMs!")
	if (!message.member.hasPermission(Permissions.MANAGE_GUILD)) return message.channel.send("You don't have permission to run this command!")
	if (args._.length < 1) return message.channel.send("Invalid time specified")
	let secs = parseFloat(args._[0])
	if (isNaN(secs)) return message.channel.send("Invalid number!")
	if (secs < 0) return message.channel.send("The specified second should be at least 0!")
	let Cooldown = getCooldown()
	Cooldown[message.guild.id.toString()] = secs
	fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(Cooldown))
	message.channel.send(`Cooldown on this server is now set to ${secs} seconds.`)
}
