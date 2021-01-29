const {getCooldown} = require("../main.js")
const {profileWhitelist, ScoreWhitelist} = require("../map.js")
const {GetModule} = require("../utils.js")
const fetch = require('wumpfetch')
const config = require('../../config.json')

module.exports.run = async (client, message, args) => {
	let AuthorID = message.author.id.toString()
	let body = getCooldown()
	if(!profileWhitelist.includes(AuthorID) && !ScoreWhitelist.includes(AuthorID) && (body["Scoremaintainers"]==undefined || !body["Scoremaintainers"].includes(AuthorID)))
		return message.channel.send("You don't have permission to run this command!")
	if(args._.length==0) return message.channel.send("Please specify a module!")
	let module = GetModule(message, args)
	if(!module) return
	await fetch({url: encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/ClearScore/${module.Name}`), parse: "json"}).send().then(response => {
		let resp = response.body
		message.channel.send(resp.error ? resp.error : "Success!")
	}).catch(err => {
		message.channel.send("An error occurred!")
		console.log(`Error: ${err}`)
	})
}
