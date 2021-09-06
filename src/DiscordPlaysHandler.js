const { Server } = require("ws")
const { tpServerIP, DPPort } = require("../config.json")
const { randomBytes } = require("crypto")
const main = require("./main.js")

const ThreadTypes = ["GUILD_PUBLIC_THREAD", "GUILD_PRIVATE_THREAD", "GUILD_NEWS_THREAD"]

const WSServer = new Server({host: tpServerIP, port: DPPort})

var Tokens = {}
var ChannelIDs = {}
var Clients = {}
var ChannelUsers = {}
var TokenSave = {}

const Emojis = {
		"LUL": "<:LUL:732584833628241920>",
		"VoteYea": "<:VoteYea:872393782941855744>",
		"VoteNay": "<:VoteNay:872394870780739604>",
		"KAPOW": "<:KAPOW:872394837930938369>",
		"PraiseIt": "<:PraiseIt:872394838195208192>",
		"DansGame": "<:DansGame:872394838237143101>",
		"BabyRage": "<:BabyRage:872394838228750366>",
		"SeemsGood": "<:SeemsGood:872394838136455248>",
		"NotLikeThis": "<:NotLikeThis:872394838111293470>",
		"4Head": "<:4Head:872394837805125663>",
		"Kappa": "<:Kappa:872394838102908969>",
		"SwiftRage": "<:SwiftRage:872394837813522433>",
		"panicBasket": "<:panicBasket:872394837805105193>",
		"MrDestructoid": "<:MrDestructoid:872394838157443092>",
		"copyThis": "<:copyThis:872407125329051649>"
}
	
function GetRunningSessions()
{
	return Object.keys(Clients).length
}

function GenerateToken(channel, author)
{
	let token
	do
	{
		token = randomBytes(15).toString("hex")
	} while(Tokens[token])
	Tokens[token] = [channel.id, `${author.username} (${author.id})`, author.id]
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

function GetThread(name, id, channel, Callback)
{
	let Completed = false
	let end = `(${id})`
	channel.threads.fetchActive().then(threads => {
		for(const thread of threads.threads.map(t => t))
		{
			if(Completed)
				return
			if(thread.name.endsWith(end))
			{
				Completed = true
				Callback(thread)
			}
		}
		if(!Completed)
		{
			channel.threads.fetchArchived().then(ArchivedThreads => {
				for(const thread of ArchivedThreads.threads.map(t => t))
				{
					if(Completed)
						return
					if(thread.name.endsWith(end))
					{
						Completed = true
						thread.setArchived(false, "Discord Plays session restarted").then(Callback)
					}
				}
				if(!Completed)
				{
					console.log(channel.guild.features)
					Completed = true
					channel.threads.create({name: name, autoArchiveDuration: channel.guild.features.includes("THREE_DAY_THREAD_ARCHIVE") ? 4320 : 1440, reason: "New Discord Plays session"}).then(Callback)
				}
			})
		}
	})
}

const MinimumVersion = [1, 9, 24]

function ValidateVersion(version)
{
	if(!version || !version.startsWith("Version="))
		return false
	let VersionNumbers = version.replace("Version=", "", 1).split(".")
	for(let i = 0; i < MinimumVersion.length; i++)
	{
		let n = !VersionNumbers[i] ? 0 : parseInt(VersionNumbers[i])
		if(isNaN(n) || n < MinimumVersion[i])
			return false
	}
	return true
}

WSServer.on("connection", (client, req) => {
	let version = req.headers.cookie
	if(!ValidateVersion(version))
	{
		console.log(`Received invalid version: ${version}`)
		client.close(1003, "Game version mismatch")
		return
	}
	console.log("connected")
	let token
	let ChannelID
	let Channel
	let Thread
	client.on("message", message => {
		if(!token)
		{
			if(Tokens[message])
			{
				token = message
				let info = Tokens[token]
				ChannelID = info[0]
				Channel = ChannelIDs[ChannelID]
				let ThreadCallback = thread => {
					let EditCallback = () => {
						Thread = thread
						ChannelID = Thread.id
						client.AuthorID = info[2]
						Clients[ChannelID] = client
						ChannelID = ChannelID
						TokenSave[token] = info
						delete Tokens[token]
					}
					if(thread.editable && thread.name != info[1])
					{
						thread.edit({name: info[1]}, "Username change").then(t => {
							thread = t
							EditCallback()
						})
					}
					else EditCallback()
				}
				let Callback = () => {
					if(ThreadTypes.includes(Channel.type))
						ThreadCallback(Channel)
					else GetThread(info[1], info[2], Channel, ThreadCallback)
				}
				if(!Channel)
				{
					main.Bot().channels.fetch(ChannelID).then(ch => {
						Channel = ch
						if(Channel)
							Callback()
					})
				}
				else Callback()
			}
			else client.close(1014, "Invalid token")
			return
		}
		else if(Thread)
		{
			for(const emoji of Object.keys(Emojis))
				{
					let re = new RegExp(`(\\s|^)${emoji}(\\s|$)`, "gm")
					while(re.test(message))
						message = message.replace(re, ` ${Emojis[emoji]} `)
				}
			let Users = ChannelUsers[ChannelID]
			for(const tag of Object.keys(Users))
				message = message.replace(`@${tag}`, `<@${Users[tag]}>`)
			Thread.send(message)
		}
	})
	client.on("close", () => {
		console.log("Disconnected")
		delete Clients[ChannelID]
		delete ChannelUsers[ChannelID]
		delete TokenSave[token]
		if(Thread && !Thread.archived && Thread.editable)
			Thread.setArchived(true, "Session has ended")
	})
})

module.exports.IsRunning = id => Object.values(Clients).some(c => c.AuthorID == id)
module.exports.GetDPThreads = () => Object.keys(Clients)
module.exports.GetSave = () => TokenSave
module.exports.SetSave = data => Tokens = data
module.exports.GetRunningSessions = GetRunningSessions
module.exports.GenerateToken = GenerateToken
module.exports.ValidateMessage = ValidateMessage
