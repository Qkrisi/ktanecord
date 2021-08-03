const { Server } = require("ws")
const { tpServerIP, DPPort } = require("../config.json")
const { randomBytes } = require("crypto")

const WSServer = new Server({host: tpServerIP, port: DPPort})

var Tokens = {}
var ChannelIDs = {}
var Clients = {}
var ChannelUsers = {}

const Emojis = {
		"LUL": "<:LUL:732584833628241920>"
}
	
function GetRunningSessions()
{
	return Object.keys(Clients).length
}

function GenerateToken(channel)
{
	if(Clients[channel.id])
		return
	let token
	do
	{
		token = randomBytes(15).toString("hex")
	} while(Tokens[token])
	Tokens[token] = channel.id
	if(!ChannelIDs[channel.id])
		ChannelIDs[channel.id] = channel
	return token
}

function ValidateMessage(message)
{
	let msg = message.content
	let ChannelID = message.channel.id
	let Client = Clients[ChannelID]
	if(Client)
	{
		Client.send(JSON.stringify({"Message":msg, "User":message.author.tag, "Color":message.member.displayHexColor}))
		if(!ChannelUsers[ChannelID])
			ChannelUsers[ChannelID] = {}
		ChannelUsers[ChannelID][message.author.tag] = message.author.id
		return true
	}
	return false
}

WSServer.on("connection", client => {
	console.log("connected")
	let token
	let ChannelID
	let Channel
	client.on("message", message => {
		if(!token)
		{
			if(Tokens[message])
			{
				token = message
				ChannelID = Tokens[token]
				delete Tokens[token]
				Clients[ChannelID] = client
				Channel = ChannelIDs[ChannelID]
			}
			else client.close()
			return
		}
		for(const emoji of Object.keys(Emojis))
			message = message.replace(new RegExp(`(\\s|^)${emoji}(\\s|$)`, "gm"), ` ${Emojis[emoji]} `)
		let Users = ChannelUsers[ChannelID]
		for(const tag of Object.keys(Users))
			message = message.replace(`@${tag}`, `<@${Users[tag]}>`)
		Channel.send(message)
	})
	client.on("close", () => {
		console.log("Disconnected")
		delete Clients[ChannelID]
		delete ChannelUsers[ChannelID]
	})
})

module.exports.GetRunningSessions = GetRunningSessions
module.exports.GenerateToken = GenerateToken
module.exports.ValidateMessage = ValidateMessage
