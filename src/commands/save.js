const { profileWhitelist } = require("../map.js")
const main = require("../main.js")

const savecommands = ["dp"]

module.exports.run = (client, message, args) => {
	if (!profileWhitelist.includes(message.author.id)) return
	for (const command of savecommands) {
		try {
			let commandFile = require(`./${command}.js`)
			if (commandFile.save)
				main.Save(command, commandFile.save())
		}
		catch {}
	}
	main.WriteSave()
	message.channel.send("Saved!")
}
