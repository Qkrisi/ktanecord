const { embed } = require('../utils')
const fetch = require('wumpfetch')
const config = require('../../config.json')
const Discord = require('discord.js')
const axios = require('axios')
const save = require('./save.js')
const { CreateAPIMessage } = require('../utils.js')
const { profileWhitelist } = require('../map.js')

const Roles_MaxModules = 15
const Roles_MaxRows = 5

/*const Streamers = new Map([
	["MrPeanut1028", "MrPeanut1028 (Weekday + Whitelist)"],
	["Derfer99", "Derfer99 (Weekend)"],
	["Strike_Kaboom", "Strike_Kaboom (Training)"],
	["Heres_Fangy", "Heres_Fangy (Backup)"],
	["eXish", "eXish (Backup)"],
	["MrMelon54", "MrMelon54 (Backup)"],
	["Qkrisi", "Qkrisi (Backup)"]
])*/

const available = [
	"Marksam32",
	"MrPeanut1028",
	"eXish",
	"Heres_Fangy",
	"Strike_Kaboom"
]

const FetchStatus = [
	"MrPeanut1028",
	"Marksam32",
	"Heres_Fangy",
]

const DefaultStreamer = "Marksam32"

var RoleSelect_ChannelID = 0
var RoleSelect_MessageID = []

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return `${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

function getDecimal(num) {
	let splitted = num.toString().split(".")
	return splitted.length == 1 ? `${splitted[0]}` : `${splitted[0]}**.**${splitted[1].charAt(0)}`
}


async function GetMessages(roles, message, client, SendMessages) {
	let bounds = config.TPBounds
	let record = false
	let messages = []
	let rows = []
	let datas = []
	roles = roles.map(r => r)
	/*for(let i = 3;i<100;i++)
		roles.push({position: i, name: `TP_Created${i}`, id: `${i}`})*/
	if(SendMessages)
	{
		RoleSelect_ChannelID = message.channel.id
		RoleSelect_MessageID = []
	}
	roles.sort((a, b) => b.position - a.position)
	let modules = []
	for(const role of roles.map(r => r))
	{
		if(role.id == bounds[0])
			record = true
		else if(role.id == bounds[1])
			break
		else if(record)
			modules.push({"label": role.name, "value": role.id})
	}
	while(modules.length > 0)
		rows.push(modules.splice(0, Roles_MaxModules))
	while(rows.length > 0)
		messages.push(rows.splice(0, Roles_MaxRows))
	let i = 0
	let row_i = 0
	for(const msg of messages)
	{
		const { data, files, send } = await CreateAPIMessage(message.channel, client, ++i == 1 ? "Select the roles you wish to toggle:" : "⠀")
		data.components = []
		for(const row of msg)
		{
			let action_row = {"type": 1, "components": [{"type": 3, "custom_id": `tp role_${row_i++}_${i}`, "options": [], "max_values": row.length}]}
			for(const module of row)
				action_row.components[0].options.push(module)
			action_row.components[0].placeholder = action_row.components[0].options[0].label
			let options_length = action_row.components[0].options.length
			if(options_length > 1)
				action_row.components[0].placeholder += " - " + action_row.components[0].options[options_length-1].label
			data.components.push(action_row)
		}
		datas.push([data, files, send])
		if(SendMessages)
			await send(data, msg => RoleSelect_MessageID.push(msg.id))
	}
	if(SendMessages)
		await message.delete()
	return datas
}


module.exports.run = async(client, message, args) => {
	let argList = args._
	if(argList[0]) argList[0] = argList[0].toLowerCase()
	if(argList[0] == "roles") {
		if(!message.guild || message.guild.id != config.TPServer)
			return message.channel.send("This command cannot be used in this server.")
		if(!profileWhitelist.includes(message.author.id) && !message.member.roles.cache.some(r => r.id == config.TPAdmins))
			return message.channel.send("You don't have permission to execute this command!")
		if(!argList[1])
			return message.channel.send("Not enough arguments!")
		let update = async(_r = undefined) => {
			let callback = async(roles) => {
						let messages = await GetMessages(roles, message, client, false)
						let i = -1
						while(++i < messages.length)
						{
							let msg = messages[i]
							let data = msg[0]
							let files = msg[1]
							if(RoleSelect_MessageID.length > i)
							{
								try
								{
									await client.api.channels[RoleSelect_ChannelID].messages[RoleSelect_MessageID[i]].patch({data, files})
								}
								catch
								{
									RoleSelect_MessageID.splice(i--, 1)
								}
							}
							else await msg[2](data, m => RoleSelect_MessageID.push(m.id), RoleSelect_ChannelID)
						}
						for(let j = i; j < RoleSelect_MessageID.length;j++)
						{
							try
							{
								await client.api.channels[RoleSelect_ChannelID].messages[RoleSelect_MessageID[j]].delete()
							}
							catch {}
						}
						RoleSelect_MessageID = RoleSelect_MessageID.slice(0, messages.length)
						message.channel.send("Success!")
			}
			if(_r != undefined)
				await callback(_r)
			else message.guild.roles.fetch().then(callback)
		}
		let key = argList[1].toLowerCase()
		switch(key)
		{
			case "message":
				if(RoleSelect_MessageID.length > 0)
				{
					for(const msg of RoleSelect_MessageID)
					{
						try
						{
							await client.api.channels[RoleSelect_ChannelID].messages[msg].delete()
						}
						catch {}
					}
				}
				message.guild.roles.fetch().then(async(roles) => {
					await GetMessages(roles, message, client, true)
					save.run(client, message, {}, true)
				})
				break
			case "update":
				await update()
				break
			case "add":
			case "remove":
				if(!argList[2])
				{
					message.channel.send("Not enough arguments!")
					break
				}
				let modules = argList.slice(2).join(" ").split("//")
				message.guild.roles.fetch().then(async(roles) => {
					let success = false
					let _r = roles
					for(let module of modules)
					{
						module = module.trim()
						if(!module)
						{
							await message.channel.send("Invalid role name")
							continue
						}
						roles = roles.map(r => r)
						roles.sort((a, b) => b.position - a.position)
						let current_roles = []
						let record = false
						let bounds = config.TPBounds
						let start_pos = 0
						for(const r of roles)
						{
							if(r.id == bounds[0])
								record=true
							else if(r.id == bounds[1])
							{
								start_pos = r.position
								break
							}
							else if(record)
								current_roles.push(r)
						}
						let role_names = current_roles.map(r => r.name)
						if(key == "add")
						{
							if(role_names.includes(module))
							{
								await message.channel.send(`A role with the specified name already exists (${module})`)
								continue
							}
							role_names.push(module)
							role_names.sort()
							role_names = role_names.reverse()
							let role = await message.guild.roles.create({
								name: module,
								mentionable: true,
								position: start_pos+role_names.indexOf(module)+1
							})
							roles.push(role)
							success = true
						}
						else
						{
							if(!role_names.includes(module))
							{
								await message.channel.send(`A role with the specified name doesn't exist (${module})`)
								continue
							}
							await current_roles.find(r => r.name == module).delete()
							roles = roles.filter(r => r.name != module)
							success = true
						}
						_r = roles
					}
					if(success)
						await update(_r)
				})
				break
			default:
				message.channel.send("Invalid argument")
				break
		}
		return
	}
	if(["current","data", "stats"].includes(argList[0])) {
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
					message.channel.send({embeds: [embed.getEmbed("CurrentStreamers", {streamers:msg})]})
				}
			})	
		}
		else if(argList[0]=="data")
		{
			let streamer = argList[1]
			if(!streamer) streamer = DefaultStreamer
			let url = encodeURI(`https://api.twitch.tv/helix/streams?user_login=${streamer}`)
			await fetch({url: url, parse: "json", headers:{Authorization:`Bearer ${token}`, "Client-Id": ClientID}}).send().then(async(response) => {
				let body = response.body.data[0]
				let online = body!=undefined && body.type=="live" && body["game_name"]=="Keep Talking and Nobody Explodes" && ["Twitch Plays", "TP"].some(element => body.title.includes(element))
				if(!online) return message.channel.send(`${streamer} is currently not online or isn't streaming TP:KTaNE`)
				message.channel.send({embeds: [embed.getEmbed("StreamerData", {
					viewers: body["viewer_count"],
					start: body["started_at"].replace("T", " ").replace("Z",""),
					language: body["language"],
					thumbnail: body["thumbnail_url"].replace("{width}", "1920").replace("{height}", "1080")+`?${new Date().getMilliseconds()}`,
					streamer: `Statistics of ${streamer}'s stream`,
					name: body["title"]
				})]})		
			})
		}
		else
		{
			let streamer
			let name
			let originalStreamer
			let originalName
			if (argList.length > 1) {
				argList = argList.splice(1, argList.length)
				let sDone = false
				streamer
				if (argList.length == 1) {
					streamer = DefaultStreamer
					sDone = true
				}
				name = argList.length == 1 ? argList[0] : argList.splice(0, argList.length - 1).join(" ")
				if (!sDone) streamer = argList[0]
				originalStreamer = streamer
				streamer = streamer.toLowerCase()
			}
			else {
				streamer = DefaultStreamer
				let username = message.author.username
				name = message.guild ? (message.member.nickname ?? username) : username
			}
			let url = `http://${config.tpServerIP}:${config.tpServerPort}/get/${streamer}/${name}`
			originalName = name
			if (!originalStreamer) originalStreamer = streamer
			await fetch({ url: url, parse: 'json' }).send().then(async (res) => {
				let resp = res.body
				if (resp.error) return message.channel.send(resp.error)
				let pfp = ""
				await fetch({url: encodeURI(`https://api.twitch.tv/helix/users?login=${originalName}`), parse: 'json', headers:{Authorization:`Bearer ${token}`, "Client-Id": ClientID}}).send().then(async(response) => {
						let body = response.body.data[0]
						if(!body["profile_image_url"]) return
						pfp = body["profile_image_url"]
					})
				let hex = rgbToHex(resp.color.r, resp.color.g, resp.color.b)

				let r1 = resp.strike > 0 ? getDecimal(resp.solve / resp.strike) : resp.solve
				let r2 = resp.strike > 0 ? getDecimal(resp.score / resp.strike) : resp.score

				let SS = `${resp.solve} **/** ${resp.strike}`
				let SSRatio = `${r1} **:** ${resp.strike > 0 ? 1 : 0}`

				message.channel.send({embeds: [embed.getEmbed(!resp.OptedOut ? "TwitchPlays" : "TPOptedOut", {
					name: `${originalName}`,
					userColor: hex,
					pfp: pfp,
					streamer: `Statistics from ${originalStreamer}'s stream`,
					sss: `${SS} **/** ${resp.score}`,
					ss: SS,
					sssRatio: `${SSRatio} **:** ${r2}`,
					ssRatio: SSRatio,
					rank: `${resp.rank}`,
					sDef: `${resp.soloClears}`,
					sRank: `${resp.soloRank}`
				})]})
			})
		}
		return
	}
	if (argList[0] == "streamers") return message.channel.send(`Current available streamers: ${available.join(', ')}`)
}

module.exports.component = async(client, interaction, custom_id, channel, message) => {
	client.guilds.fetch(interaction.guild_id).then(guild => {
		guild.members.fetch(interaction.member.user.id).then(member => {
			let length = interaction.data.values.length
			let current_roles = member.roles.cache.map(r => r.id)
			let i = 0
			let roles_add = []
			let roles_remove = []
			guild.roles.fetch().then(roles => {
				for(const role_id of interaction.data.values)
				{
						let role = roles.find(r => r.id == role_id)
						if(current_roles.includes(role_id))
							roles_remove.push(role)
						else roles_add.push(role)
						if(++i == length)
						{
							member.roles.add(roles_add).then(async(_) => {
								member.roles.remove(roles_remove).then(async(__) => {
									let datas = await GetMessages(roles, {channel: channel}, client, false)
									let msg = ""
									if(roles_add.length > 0)
										msg += `**Added roles:** ${roles_add.map(r => r.name).join(", ")}`
									if(roles_remove.length > 0)
										msg += `${msg ? "\n\n" : ""}**Removed roles:** ${roles_remove.map(r => r.name).join(", ")}`
									client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data: {content: msg, flags: 1 << 6}}}).then(async(___) => {
										let d = datas[parseInt(custom_id.split("_")[2])-1]
										let data = d[0]
										let files = d[1]
										await client.api.channels[channel.id].messages[message.id].patch({data, files})		//Reset dropdown
									})
							})
						})	
					}
				}
			})
		})
	})
}

module.exports.save = () => {return {"Channel": RoleSelect_ChannelID, "Messages": RoleSelect_MessageID}}
module.exports.load = data => {
	RoleSelect_ChannelID = data.Channel
	RoleSelect_MessageID = data.Messages
}
