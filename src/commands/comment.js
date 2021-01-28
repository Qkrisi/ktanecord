const {GetModule, FakeArg} = require("../utils.js")
const config = require('../../config.json')
const axios = require('axios')

module.exports.run = async(client, message, args) => {
	let input = args._.join(" ").split("//")
	if(input.length < 2) return message.channel.send(`To few arguments were given. Please use this syntax: \`${config.token}comment <module>//<comment>\``);
	let module = GetModule(message, new FakeArg(input[0]))
	if(!module) return
	let reason = input[1]
	let body = {
		"module":module.Name,
		"discord":message.author.tag,
		"reason":reason,
		"column":"K"
	}
	let url = encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/Comment`)
	await axios.post(url, body).then(response => {
		let data = response.data
		message.channel.send(data.error ? data.error: "Success!")
	}).catch(error => {
		console.log(error)
		message.channel.send(`An error occurrend while communicating with the scoring server (${error.response.status})`)
	})
}
