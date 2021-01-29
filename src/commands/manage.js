const {profileWhitelist, ScoreWhitelist} = require("../map.js")
const {getCooldown} = require("../main.js")
const fs = require("fs")

module.exports.run = (client, message, args) => {
	let AuthorID = message.author.id.toString()
	if(!profileWhitelist.includes(AuthorID) && !ScoreWhitelist.includes(AuthorID)) return message.channel.send("You don't have permission to run this command!")
	ArgList = args._
	if(ArgList.length < 2) return message.channel.send("Not enough arguments")
	ArgList[0] = ArgList[0].toLowerCase()
	ArgList[1] = ArgList[1].toLowerCase()
	if(!["maintainers", "bans"].includes(ArgList[0])) return message.channel.send("Role should either be \"maintainers\" or \"bans\"")
	if(!["add", "remove"].includes(ArgList[1])) return message.channel.send("Action should either be \"add\" or \"remove\"")
	let Key = `Score${ArgList[0]}`
	let body = getCooldown()
	if(body[Key]==undefined) body[Key]=[]
	let splitted = message.content.split(" ")
	let UserID = splitted[splitted.length-1]
	if(ArgList[1]=="add")
	{
		if(body[Key].includes(UserID)) return message.channel.send("The specified user already has the given role.")
		body[Key].push(UserID)
	}
	else
	{
		if(!body[Key].includes(UserID)) return message.channel.send("The specified user doesn't have the given role.")
		body[Key].splice(body[Key].indexOf(UserID), 1)
	}
	fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(body))
	return message.channel.send("Success!")
}
