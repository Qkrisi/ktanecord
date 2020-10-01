const Permissions = require("discord.js").Permissions.FLAGS
const { getCooldown } = require("../main.js")
const fs = require("fs")

module.exports.run = (_client, message, args) => {
	if (!message.guild) return await message.channel.send("This command doesn't work in DMs!")
	if (!message.member.hasPermission(Permissions.MANAGE_GUILD)) return await message.channel.send("You don't have permission to run this command!")
	if (args._.length < 1) return await message.channel.send("Invalid time specified.")
	let secs = parseFloat(args._[0])
	if (isNaN(secs)) return await message.channel.send("Invalid number!")
	if (secs < 0) return await message.channel.send("The specified second should be at least 0!")
	let Cooldown = getCooldown()
	Cooldown[message.guild.id.toString()] = secs
	fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(Cooldown))
	await message.channel.send(`Cooldown on this server is now set to ${secs} seconds.`)
}
