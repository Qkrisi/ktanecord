const Discord = require('discord.js')
const config = require('../config.json')
const WebSocket = require("ws")
const fs = require("fs")

const socket = config.EnableSimulator ? new WebSocket(`ws://${config.tpServerIP}:${config.SimPort}`) : undefined

let ChannelCache = {}

socket.on("message", data => {
	let body = JSON.parse(data)
	let channel = ChannelCache[body.id]
	messagebody = {}
	if(body.embed){
		let embed = new Discord.MessageEmbed().setTitle(body.embed.title).setDescription(body.embed.description)
		if(body.file){
			let attachment = new Discord.MessageAttachment(body.file.path, body.file.filename)
			embed.attachFiles(attachment)
		}
		embed.setImage(body.embed.image)
		messagebody.embed=embed
	}
	channel.send(body.message, messagebody).then(r => {
		if(body.file) fs.unlinkSync(body.file.path)
	})
})

module.exports.send = (msg) => {
	if(!socket) return
	ChannelCache[msg.channel.id]=msg.channel
	let body = {author:msg.author, channel:msg.channel, message:msg}
	socket.send(JSON.stringify(body))
}
