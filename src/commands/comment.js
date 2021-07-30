const { getModule, FakeArg } = require("../utils.js")
const { profileWhitelist, scoreWhitelist } = require("../map.js")
const { getCooldown } = require("../main.js")
const say = require("./say.js")
const config = require('../../config.json')
const axios = require('axios')

module.exports.run = async(client, message, args) => {
	let AuthorID = message.author.id.toString()
	let cooldown = getCooldown()
	if (!profileWhitelist.includes(AuthorID) && !scoreWhitelist.includes(AuthorID) && cooldown["Scorebans"] ! =undefined && cooldown["Scorebans"].includes(AuthorID))
		return message.channel.send("You were banned from interacting with community scores!")
	let input = args._.join(" ").split("//")
	if (input.length < 2) return message.channel.send(`To few arguments were given. Please use this syntax: \`${config.token}comment <module>//<comment>\``);
	let module = GetModule(message, new FakeArg(input[0]))
	if (!module) return
	let reason = input[1]
	let body = {
		"module": module.Name,
		"discord": message.author.tag,
		"reason": reason,
		"column": "K"
	}
	let url = encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/Comment`)
	success = true
	await axios.post(url, body).then(response => {
		let data = response.data
		if (data.error) {
			success = false
			message.channel.send(data.error)
		}
		else message.channel.send(data.error ? data.error: "Success!")
	}).catch(error => {
		console.log(error)
		success = false
		message.channel.send(`An error occurrend while communicating with the scoring server (${error.response.status})`)
	})
	if (success)
		say.run(client, message, new FakeArg(`${config.ScoreLog} ${message.author.tag} has commented on ${module.Name}: ${reason} (${message.author.id})`), true)
}
