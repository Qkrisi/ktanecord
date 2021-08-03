const dp = require("../DiscordPlaysHandler.js")
const config = require("../../config.json")

module.exports.run = (client, message, args) => {
	if(args.n)
		return message.channel.send(`Number of running sessions: ${dp.GetRunningSessions()}`)
	if(!message.guild)
		return message.channel.send("Please run this command in a guild channel!")
	message.author.createDM().then(channel => {
		let token = dp.GenerateToken(message.channel)
		if(!token)
			return message.channel.send("A DiscordPlays session is already running in this channel!")
		let WSSOverride = config.WSSOverride
		let URL = WSSOverride ? WSSOverride : `${config.tpServerIP}:${config.DPPort}`
		channel.send(`Token: \`${token}\`\nURL: \`${URL}\`\nUse secure WebSockets: ${WSSOverride ? "True" : "False"}`)
		message.channel.send("Sent instructions in DM")
	}).catch(err => {
		console.log(err)
		message.channel.send("An error occurred. Please make sure you have DMs enabled on this server!")
	})
}
