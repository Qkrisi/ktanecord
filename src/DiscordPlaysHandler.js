const { Server } = require("ws")
const { tpServerIP, DPPort, DPSalts } = require("../config.json")
const { createHash } = require("crypto")
const main = require("./main.js")

if(!DPSalts || DPSalts.length < 3)
	throw new Error("3 Discord Plays salts should be given in the config file ('DPSalts')")

const ThreadTypes = ["GUILD_PUBLIC_THREAD", "GUILD_PRIVATE_THREAD", "GUILD_NEWS_THREAD"]
const SessionFields = ["channel", "name", "authorID", "authorTag", "validUntil", "signature"]
const ExpirationMinutes = 10

const WSServer = new Server({host: tpServerIP, port: DPPort})

var ChannelIDs = {}
var Clients = {}
var ChannelUsers = {}

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

function SignSession(sessionInfo)
{
	return createHash('sha256').update(sessionInfo.channel + DPSalts[0] + sessionInfo.name + sessionInfo.authorID + DPSalts[1] + sessionInfo.authorTag + DPSalts[2] + sessionInfo.validUntil).digest('base64')
}

function GenerateToken(channel, author)
{
	let sessionInfo = {
		"channel": channel.id,
		"name": `${author.username} (${author.id})`,
		"authorID": author.id,
		"authorTag": author.tag,
		"validUntil": Date.now() + (ExpirationMinutes * 60000)
	}
	sessionInfo.signature = SignSession(sessionInfo)
	if(!ChannelIDs[channel.id])
		ChannelIDs[channel.id] = channel
	return Buffer.from(JSON.stringify(sessionInfo), "utf8").toString("base64")
}

function ValidateToken(message, bypassExpiration)
{
	let sessionInfo
	try
	{
		sessionInfo = JSON.parse(Buffer.from(message, "base64").toString("utf8"))
	}
	catch {}
	if(!sessionInfo)
		return { sessionInfo: null, tokenError: "Unable to decode token" }
	for(const field of SessionFields)
	{
		if(!sessionInfo[field])
			return { sessionInfo: null, tokenError: "Insufficient fields in token" }
	}
	if(sessionInfo.signature !== SignSession(sessionInfo))
		return { sessionInfo: null, tokenError: "Invalid signature" }
	if(!bypassExpiration && sessionInfo.validUntil < Date.now())
		return { sessionInfo: null, tokenError: "Token expired" }
	return { sessionInfo: sessionInfo, tokenError: null }
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
	if(!version)
		return false
	let VersionNumbers = version.split(".")
	for(let i = 0; i < MinimumVersion.length; i++)
	{
		let n = !VersionNumbers[i] ? 0 : parseInt(VersionNumbers[i])
		if(isNaN(n) || n < MinimumVersion[i])
			return false
	}
	return true
}

WSServer.on("connection", (client, req) => {
	let gameInfo = req.headers.cookie
	if(!gameInfo || !gameInfo.startsWith("GameInfo="))
	{
		client.close(1003, "Didn't receive required game information")
		return
	}
	try
	{
		gameInfo = JSON.parse(Buffer.from(gameInfo.replace("GameInfo=", "", 1), "base64").toString("utf8"))
	}
	catch
	{
		client.close(1003, "Unable to decode game information")
		return
	}
	if(!ValidateVersion(gameInfo.Version))
	{
		console.log(`Received invalid version: ${gameInfo.Version}`)
		client.close(1003, "Game version mismatch")
		return
	}
	console.log("DiscordPlays connected")
	let Retry = gameInfo.Retry
	let token
	let ChannelID
	let Channel
	let Thread
	let info
	let Streamer
	client.on("message", message => {
		try
		{
			if(!token)
			{
				let { sessionInfo, tokenError } = ValidateToken(message, Retry)
				if(sessionInfo)
				{
					token = message
					ChannelID = sessionInfo.channel
					Channel = ChannelIDs[ChannelID]
					Streamer = sessionInfo.authorTag
					let ThreadCallback = thread => {
						let EditCallback = () => {
							Thread = thread
							ChannelID = Thread.id
							client.AuthorID = sessionInfo.authorID
							Clients[ChannelID] = client
							ChannelID = ChannelID
						}
						if(thread.editable && thread.name != sessionInfo.name)
						{
							thread.edit({name: sessionInfo.name}, "Username change").then(t => {
								thread = t
								EditCallback()
							})
						}
						else EditCallback()
					}
					let Callback = () => {
						if(ThreadTypes.includes(Channel.type))
							ThreadCallback(Channel)
						else GetThread(sessionInfo.name, sessionInfo.authorID, Channel, ThreadCallback)
						if(Streamer)
							client.send(`streamer ${Streamer}`)
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
				else
				{
					console.log(`Received invalid token (${tokenError})`)
					client.close(1014, `Invalid token (${tokenError})`)
				}
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
				if(Users)
				{
					for(const tag of Object.keys(Users))
						message = message.replace(`@${tag}`, `<@${Users[tag]}>`)
				}
				Thread.send(message)
			}
		}
		catch(e)
		{
			console.log(e)
		}
	})
	client.on("close", () => {
		console.log("DiscordPlays disconnected")
		delete Clients[ChannelID]
		delete ChannelUsers[ChannelID]
		if(Thread && !Thread.archived && Thread.editable)
			Thread.setArchived(true, "Session has ended")
	})
})

module.exports.IsRunning = id => Object.values(Clients).some(c => c.AuthorID == id)
module.exports.GetDPThreads = () => Object.keys(Clients)
module.exports.GetRunningSessions = GetRunningSessions
module.exports.GenerateToken = GenerateToken
module.exports.ValidateMessage = ValidateMessage
module.exports.ExpirationMinutes = ExpirationMinutes
