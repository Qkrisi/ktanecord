const Discord = require('discord.js')
const config = require('../config.json')
const WebSocket = require("ws")
const fs = require("fs")

const socket = config.EnableSimulator ? new WebSocket(`ws://${config.tpServerIP}:${config.SimPort}`) : undefined

let ChannelCache = {}

if(config.EnableSimulator){
	socket.on("message", data => {
		let body = JSON.parse(data)
		let channel = ChannelCache[body.id]
		messagebody = undefined
		if(body.embed){
			let embed = new Discord.MessageEmbed().setTitle(body.embed.title).setDescription(body.embed.description)
			let files
			if(body.file){
				let attachment = new Discord.MessageAttachment(body.file.path, body.file.filename)
				files = [attachment]
			}
			embed.setImage(body.embed.image)
			messagebody = {embeds:[embed], files: files}
		}
		else if(body.file) messagebody = {files: [new Discord.MessageAttachment(body.file.path, body.file.filename)]}
		if(!body.message)
			body.message = "⠀"
		if(messagebody)
			messagebody.content = body.message
		else messagebody = {content: body.message}
		channel.send(messagebody).then(r => {
			if(body.file) fs.unlinkSync(body.file.path)
		})
	})
}

module.exports.send = (msg) => {
	if(!socket) return
	ChannelCache[msg.channel.id]=msg.channel
	let body = {author:msg.author, channel:msg.channel, message:msg}
	socket.send(JSON.stringify(body))
}
