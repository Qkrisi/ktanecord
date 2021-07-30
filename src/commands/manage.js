const { profileWhitelist, scoreWhitelist } = require("../map.js")
const { getCooldown } = require("../main.js")
const fs = require("fs")

module.exports.run = (client, message, args) => {
	let authorId = message.author.id.toString()
	if (!profileWhitelist.includes(authorId) && !scoreWhitelist.includes(authorId)) return message.channel.send("You don't have permission to run this command!")
	let argList = args._
	if (argList.length < 3) return message.channel.send("Not enough arguments")
	argList[0] = argList[0].toLowerCase()
	argList[1] = argList[1].toLowerCase()
	if (!["maintainers", "bans"].includes(argList[0])) return message.channel.send("Role should either be \"maintainers\" or \"bans\"")
	if (!["add", "remove"].includes(argList[1])) return message.channel.send("Action should either be \"add\" or \"remove\"")
	let key = `Score${argList[0]}`
	let body = getCooldown()
	if (body[key] == undefined) body[key] = []
	let splitted = message.content.split(" ")
	let userId = splitted[splitted.length-1]
	if(argList[1] == "add") {
		if (body[key].includes(userId)) return message.channel.send("The specified user already has the given role.")
		body[key].push(userId)
	}
	else {
		if (!body[key].includes(userId)) return message.channel.send("The specified user doesn't have the given role.")
		body[key].splice(body[key].indexOf(userId), 1)
	}
	fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(body))
	return message.channel.send("Success!")
}
