const dp = require("../DiscordPlaysHandler.js")
const config = require("../../config.json")
const {getCooldown} = require("../main.js")
const Permissions = require("discord.js").Permissions.FLAGS
const fs = require("fs")

module.exports.run = (client, message, args) => {
	if(args.n)
		return message.channel.send(`Number of running sessions: ${dp.GetRunningSessions()}`)
	if(message.channel.type != "GUILD_TEXT")
		return message.channel.send("Please run this command in a non-thread guild text channel!")
	let body = getCooldown()
	if(!body.DPChannels)
		body.DPChannels = []
	let IsAdmin = message.member.permissions.has(Permissions.MANAGE_GUILD)
	if(args.enable || args.disable)
	{
		if(!IsAdmin)
			return message.channel.send("You don't have permission to run this command!")
		let Enabled = body.DPChannels.includes(message.channel.id)
		if(args.enable)
		{
			if(Enabled)
				return message.channel.send("Discord Plays is already enabled in this channel.")
			body.DPChannels.push(message.channel.id)
		}
		else
		{
			if(!Enabled)
				return message.channel.send("Discord Plays is already disabled in this channel.")
			body.DPChannels.splice(body.DPChannels.indexOf(message.channel.id), 1)
		}
		fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(body))
		return message.channel.send("Success!")
	}
	if(!body.DPChannels.includes(message.channel.id))
		return message.channel.send("Discord Plays is not enabled in this channel." + (IsAdmin ? `\nYou can enable it by running \`${config.token}dp --enable\`.` : ""))
	if(dp.IsRunning(message.author.id))
		return message.channel.send("Please finish your running session before starting a new one!")
	message.author.createDM().then(channel => {
		let token = dp.GenerateToken(message.channel, message.author)
		channel.send(`Token (expires in ${dp.ExpirationMinutes} minutes): \`${token}\``)
		message.channel.send("Sent token in DM")
	}).catch(err => {
		console.log(err)
		message.channel.send("An error occurred. Please make sure you have DMs enabled on this server!")
	})
}
