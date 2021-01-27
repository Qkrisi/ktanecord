const { embed } = require('../utils')
const fetch = require('wumpfetch')
const config = require('../../config.json')
const Discord = require('discord.js')
const axios = require('axios')

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

const FetchStatus = [
	"MrPeanut1028",
	"Marksam32",
	"Heres_Fangy",
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

module.exports.run = async (client, message, args) => {
	let argList = args._
	if(argList[0]) argList[0] = argList[0].toLowerCase()
	if(["current","data"].includes(argList[0])) {
		let token
		let ClientID = config.TwitchID
		await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${ClientID}&client_secret=${config.TwitchSecret}&grant_type=client_credentials`, {}).then(async(response) => token = response.data.access_token)
		if(!token) return message.channel.send("Failed to get Twitch token")
		let msg = ""
		let StreamerInfo = {}
		let counter = 0
		if(argList[0]=="current")
		{
			FetchStatus.forEach(async(streamer) => {
				let url = encodeURI(`https://api.twitch.tv/helix/streams?user_login=${streamer}`)
				await fetch({url: url, parse: "json", headers:{Authorization:`Bearer ${token}`, "Client-Id": ClientID}}).send().then(async(response) => {
					counter+=1
					let body = response.body.data[0]
					let online = body!=undefined && body.type=="live" && body["game_name"]=="Keep Talking and Nobody Explodes" && ["Twitch Plays", "TP"].some(element => body.title.includes(element))
					StreamerInfo[streamer]=online ? "online :green_circle:" : "offline :red_circle:"
				})
				if(counter==FetchStatus.length)
				{
					FetchStatus.forEach(streamer => msg+=`\n[${streamer}](https://twitch.tv/${streamer}): ${StreamerInfo[streamer]}`)
					message.channel.send(embed.getEmbed("CurrentStreamers", {streamers:msg}))
				}
			})	
		}
		else
		{
			let streamer = argList[1]
			if(!streamer) streamer = "MrPeanut1028"
			let url = encodeURI(`https://api.twitch.tv/helix/streams?user_login=${streamer}`)
			await fetch({url: url, parse: "json", headers:{Authorization:`Bearer ${token}`, "Client-Id": ClientID}}).send().then(async(response) => {
				let body = response.body.data[0]
				let online = body!=undefined && body.type=="live" && body["game_name"]=="Keep Talking and Nobody Explodes" && ["Twitch Plays", "TP"].some(element => body.title.includes(element))
				if(!online) return message.channel.send(`${streamer} is currently not online or isn't streaming TP:KTaNE`)
				message.channel.send(embed.getEmbed("StreamerData", {
					viewers: body["viewer_count"],
					start: body["started_at"].replace("T", " ").replace("Z",""),
					language: body["language"],
					thumbnail: body["thumbnail_url"].replace("{width}", "1920").replace("{height}", "1080")+`?${new Date().getMilliseconds()}`,
					streamer: `Statistics of ${streamer}'s stream`,
					name: body["title"]
				}))		
			})
		}
		return
	}
	if (argList[0] == "streamers") return message.channel.send(`Current available streamers: ${available.join(', ')}`)
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
		if (resp.error) return message.channel.send(resp.error)
		let hex = rgbToHex(resp.color.r, resp.color.g, resp.color.b)

		let r1 = resp.strike > 0 ? getDecimal(resp.solve / resp.strike) : resp.solve
		let r2 = resp.strike > 0 ? getDecimal(resp.score / resp.strike) : resp.score

		let SS = `${resp.solve} **/** ${resp.strike}`
		let SSRatio = `${r1} **:** ${resp.strike > 0 ? 1 : 0}`

		message.channel.send(embed.getEmbed(!resp.OptedOut ? "TwitchPlays" : "TPOptedOut", {
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
