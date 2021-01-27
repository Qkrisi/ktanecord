const {profileWhitelist, ScoreWhitelist} = require("../map.js")
const {getCooldown} = require("../main.js")
const fs = require("fs")

module.exports.run = async (client, message, args) => {
	let AuthorID = message.author.id.toString()
	if(!profileWhitelist.includes(AuthorID) && !ScoreWhitelist.includes(AuthorID)) return message.channel.send("You don't have permission to run this command!")
	ArgList = args._
	if(ArgList.length < 2) return message.channel.send("Not enough arguments")
	ArgList[0] = ArgList[0].toLowerCase()
	if(!["add", "remove"].includes(ArgList[0])) return message.channel.send("Action should either be \"add\" or \"remove\"")
	let body = getCooldown()
	if(body["ScoreMaintainers"]==undefined) body["ScoreMaintainers"]=[]
	let UserID = ArgList[1]
	if(ArgList[0]=="add")
	{
		if(body["ScoreMaintainers"].includes(ArgList[1])) return message.channel.send("The specified user is already a maintainer.")
		body["ScoreMaintainers"].push(UserID)
	}
	else
	{
		if(!body["ScoreMaintainers"].includes(ArgList[1])) return message.channel.send("The specified user isn't a maintainer.")
		body["ScoreMaintainers"].splice(body["ScoreMaintainers"].indexOf(UserID), 1)
	}
	fs.writeFileSync([__dirname, "../cooldown.json"].join("/"), JSON.stringify(body))
	return message.channel.send("Success!")
}
