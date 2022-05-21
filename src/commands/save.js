const {profileWhitelist} = require("../map.js")
const main = require("../main.js")

const SaveCommands = ["tp"]

module.exports.run = (client, message, args, skipCheck = false) => {
	if (!skipCheck && !profileWhitelist.includes(message.author.id)) return
	for(const command of SaveCommands)
	{
		try
		{
			let CommandFile = require(`./${command}.js`)
			if(CommandFile.save)
				main.Save(command, CommandFile.save())
		}
		catch {}
	}
	main.WriteSave()
	if(!skipCheck)
		message.channel.send("Saved!")
}
