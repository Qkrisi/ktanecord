const { embed } = require('../utils')
const fetch = require('wumpfetch')
const config = require('../../config.json')
const Discord = require('discord.js')

const Streamers = new Map([
	["MrPeanut1028", "MrPeanut1028 (Weekday + Whitelist)"],
	["Derfer99", "Derfer99 (Weekend)"],
	["Strike_Kaboom", "Strike_Kaboom (Training)"],
	["Heres_Fangy", "Heres_Fangy (Backup)"],
	["eXish", "eXish (Backup)"],
	["MrMelon54", "MrMelon54 (Backup)"],
	["Qkrisi", "Qkrisi (Backup)"]
])

const available = [
	"MrPeanut1028",
	"eXish",
	"Heres_Fangy",
	"Strike_Kaboom",
]

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return `${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

function getDecimal(num) {
	console.log(num)
	let splitted = num.toString().split(".")
	return splitted.length == 1 ? `${splitted[0]}` : `${splitted[0]}**.**${splitted[1].charAt(0)}`
}

module.exports.run = async (_client, message, args) => {
	let argList = args._
	if (argList.length == 0) {
		/*let dEmbed = new Discord.MessageEmbed().setTitle('Available streamers').setColor('#0x7289DA')
		Streamers.forEach(async(value, key, map) => {
				await fetch({url: `https://pwn.sh/tools/streamapi.py?url=twitch.tv/${key}`, parse:'json'}).send().then(async(res) => {
						dEmbed.addFields(
							{name: value, value: res.success ? ":green_circle: Online" : ":red_circle: Offline"}
						)
					})
			})
		return message.channel.send(dEmbed)*/
		return
	}
	if (argList[0] == "streamers") return await message.channel.send(`Current available streamers: ${available.join(', ')}`)
	if (argList[0] != "stats") return
	let streamer
	let name
	let originalStreamer
	let originalName
	if (argList.length > 1) {
		argList = argList.splice(1, argList.length)
		let sDone = false
		streamer
		if (argList.length == 1) {
			streamer = "MrPeanut1028"
			sDone = true
		}
		name = argList.length == 1 ? argList[0] : argList.splice(0, argList.length - 1).join(" ")
		if (!sDone) streamer = argList[0]
		originalStreamer = streamer
		streamer = streamer.toLowerCase()
	}
	else {
		streamer = "MrPeanut1028"
		name = message.member.user.username
	}
	let url = `http://${config.tpServerIP}:${config.tpServerPort}/get/${streamer}/${name}`
	originalName = name
	if (!originalStreamer) originalStreamer = streamer
	await fetch({ url: url, parse: 'json' }).send().then(async (res) => {
		let resp = res.body
		/*if (resp.error != undefined) {
			let url2 = `http://${config.tpServerIP}:${config.tpServerPort}/get/${streamer}/${originalName.toLowerCase()}`
			let ret = true
			await fetch({ url: url2, parse: 'json' }).send().then(response => {
				if (!response.error) {
					ret = false
					resp = response.body
				}
			})
			if (ret) return message.channel.send(resp.error)
		}*/
		if (resp.error) return await message.channel.send(resp.error)
		let hex = rgbToHex(resp.color.r, resp.color.g, resp.color.b)

		let r1 = resp.strike > 0 ? getDecimal(resp.solve / resp.strike) : resp.solve
		let r2 = resp.strike > 0 ? getDecimal(resp.score / resp.strike) : resp.score

		let SS = `${resp.solve} **/** ${resp.strike}`
		let SSRatio = `${r1} **:** ${resp.strike > 0 ? 1 : 0}`

		await message.channel.send(embed.getEmbed(!resp.OptedOut ? "TwitchPlays" : "TPOptedOut", {
			name: `${originalName}`,
			userColor: hex,
			streamer: `Statistics from ${originalStreamer}'s stream`,
			sss: `${SS} **/** ${resp.score}`,
			ss: SS,
			sssRatio: `${SSRatio} **:** ${r2}`,
			ssRatio: SSRatio,
			rank: `${resp.rank}`,
			sDef: `${resp.soloClears}`,
			sRank: `${resp.soloRank}`
		}))
	})
}
