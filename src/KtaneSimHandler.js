const Discord = require('discord.js')
const config = require('../config.json')
const ws = require("ws")
const fs = require("fs")

const socket = config.EnableSimulator ? new ws(`ws://${config.tpServerIP}:${config.SimPort}`) : undefined

let channelCache = {}

if (config.EnableSimulator) {
	socket.on("message", data => {
		let body = JSON.parse(data)
		let channel = channelCache[body.id]
		let messageBody = undefined
		if (body.embed) {
			let embed = new Discord.MessageEmbed().setTitle(body.embed.title).setDescription(body.embed.description)
			if (body.file) {
				let attachment = new Discord.MessageAttachment(body.file.path, body.file.filename)
				embed.attachFiles(attachment)
			}
			embed.setImage(body.embed.image)
<<<<<<< HEAD
			messageBody = {embed:embed}
=======
			messagebody = {embeds:[embed]}
>>>>>>> f8a5a3c9d17b69b7177f5d750fa8e8199104ce9e
		}
		else if (body.file) messageBody = new Discord.MessageAttachment(body.file.path, body.file.filename)
		channel.send(body.message, messageBody ? messageBody : {}).then(r => {
			if (body.file) fs.unlinkSync(body.file.path)
		})
	})
}

module.exports.send = (msg) => {
	if (!socket) return
	channelCache[msg.channel.id] = msg.channel
	let body = {author: msg.author, channel: msg.channel, message: msg}
	socket.send(JSON.stringify(body))
}
