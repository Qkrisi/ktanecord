const Permissions = require("discord.js").Permissions.FLAGS
const main = require("../main.js")
const fs = require("fs")

module.exports.run = async(client, message, args) => {
	if (!message.guild) return message.channel.send("This command doesn't work in DMs!")
	if (!message.member.hasPermission(Permissions.MANAGE_GUILD)) return message.channel.send("You don't have permission to run this command!")
	if (args._.length < 1) return message.channel.send('Please specify either "enable" or "disable"!')
	let state = args._[0].toLowerCase()
	if (!["enable", "disable"].includes(state)) return message.channel.send('Please specify either "enable" or "disable"!')
	let body = main.getCooldown()
	if (!body.SlashCommands) body.SlashCommands = []
	let GuildID = message.guild.id.toString()
	if (state == "enable") {
		if (body.SlashCommands.includes(GuildID)) return message.channel.send("This server already has slash commands enabled!")
		main.SetInteractions(GuildID, true, response => {
			if (response == "Success!") body.SlashCommands.push(GuildID)
			message.channel.send(response)
			fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(body))
		})
	}
	else {
		if (!body.SlashCommands.includes(GuildID)) return message.channel.send("This server already has slash commands disabled!")
		let msg = await message.channel.send("Disabling slash commands... This might take a while")
		main.SetInteractions(GuildID, false, response => {
			if (response == "Success!") body.SlashCommands.splice(body.SlashCommands.indexOf(GuildID), 1)
			msg.delete()
			message.channel.send(response)
			fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(body))
		})
	}
}
