const { getCooldown } = require("../main.js")
const { profileWhitelist, ScoreWhitelist } = require("../map.js")
const { getModule, FakeArg } = require("../utils.js")
const fetch = require('wumpfetch')
const config = require('../../config.json')
const say = require("./say.js")

module.exports.run = async (client, message, args) => {
	let authorId = message.author.id.toString()
	let body = getCooldown()
	if (!profileWhitelist.includes(authorId) && !ScoreWhitelist.includes(authorId) && (body["Scoremaintainers"] == undefined || !body["Scoremaintainers"].includes(authorId)))
		return message.channel.send("You don't have permission to run this command!")
	if (args._.length==0) return message.channel.send("Please specify a module!")
	let module = getModule(message, args)
	if (!module) return
	let success = true
	await fetch({url: encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/ClearScore/${module.Name}`), parse: "json"}).send().then(response => {
		let resp = response.body
		if (resp.error) {
			success = false
			message.channel.send(resp.error)
		}
		else message.channel.send("Success!")
	}).catch(err => {
		success = false
		message.channel.send("An error occurred!")
		console.log(`Error: ${err}`)
	})
	if (success)
		say.run(client, message, new FakeArg(`${config.ScoreLog} ${message.author.tag} has cleared ${module.Name} (${message.author.id})`), true);
}
