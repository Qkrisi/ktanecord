const Discord = require('discord.js')
const client = new Discord.Client({
    intents: [
	Discord.Intents.FLAGS.GUILD_MESSAGES,
	Discord.Intents.FLAGS.GUILDS,
	Discord.Intents.FLAGS.GUILD_MESSAGES,
	Discord.Intents.FLAGS.GUILD_MEMBERS,
	Discord.Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
	'MESSAGE',
	'CHANNEL'
    ]
})
const config = require('../config.json')
var savefile = {}
try
{
	savefile = require("./save.json")
}
catch {}
const fetch = require('wumpfetch')
const larg = require('larg')
const { aliases, profileWhitelist, Interactions } = require('./map.js')
const lookup = require('./lookup')
const fs = require('fs')
const SimHandler = require("./KtaneSimHandler.js")
const { embed, CreateAPIMessage } = require("./utils.js")
const dp = require("./DiscordPlaysHandler.js")

let ktaneModules = new Map()
let modIDs = []

let CreatorContacts = {}

function getCooldown() {
    let path = [__dirname, "cooldown.json"].join("/")
    return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {DPChannels: []}
}

const CreateDataFromObject = obj => {
	let body = {data:{type:4,data:{}}}
	if(typeof(obj)=="string") body.data.data.content=obj
	else
	{
		if(obj.components)
		{
			body.data.data.components = obj.components
			delete obj.components
		}
		body.data.data.embeds=obj.embeds
		body.data.data.content = obj.content
	}
	return body
}

const CSCommands = ["setcs", "setbosscs", "comment", "clearcs"]

const CreateMessageFromOptions = (name, options, resolved, base) => {
	if(options==undefined) return base
	let CurrentOptions = options
	CurrentOptions.sort((a, b) => a.value-b.value)
	let content = ""
	let Separator = CSCommands.includes(name) ? "//" : " "
	while(true){
		let BreakOut = true
		for(let i = 0;i<CurrentOptions.length;i++){
			let option = CurrentOptions[i]
			let BreakOutFor = false
			switch(option.type){
				case 1:
					content+=` ${option.name}`
					CurrentOptions = option.options
					if(CurrentOptions!=undefined)
					{
						CurrentOptions.sort((a, b) => a.value-b.value)
						BreakOut = false
					}
					BreakOutFor = true
					break
				case 3:
					content+=`${content ? Separator : ""}${option.value}`
					break
				case 5:
					if(option.value) content+=` --${option.name}`
					break
			}
			if(BreakOutFor) break
		}
		if(BreakOut) break
	}
	if(content.startsWith(" ")) content = content.substr(1)
	base.content = content
	base.attachments = resolved ? (resolved.attachments ? Object.values(resolved.attachments) : []) : []
	return base
}

let Ideas = []

function getKtaneModules() {
    fetch({ url: 'https://ktane.timwi.de/json/raw', parse: 'json' }).send().then(res => {
        let tmp = res.body.KtaneModules
        let symbolBan = new Set()
        for (const m of tmp) {
            symbolBan.add(m.Name.toLowerCase())
            symbolBan.add(m.ModuleID)
            ktaneModules.set(m.ModuleID, m)
            modIDs.push(m.ModuleID)
            ktaneModules.set(m.Name.toLowerCase(), m)
            if (m.Name.toLowerCase().startsWith("the ")) ktaneModules.set(m.Name.toLowerCase().substr(4), m)
            if (m.Symbol != undefined && !aliases.has(m.Symbol) && !ktaneModules.has(m.Symbol) && !symbolBan.has(m.Symbol)) ktaneModules.set(m.Symbol, m)
        }
        fetch({url: "https://ktane.timwi.de/ContactInfo.json", parse:'json'}).send().then(res => {
			CreatorContacts = {}
			Object.keys(res.body).forEach(creator => {
					let LowerName = creator.toLowerCase()
					CreatorContacts[LowerName]=res.body[creator]
					CreatorContacts[LowerName].CreatorName=creator
				})
			fetch({url:"https://ktane-ideas.mrmelon54.com/getmeta.php", parse:'json'}).send().then(res => {
				let response = res.body
				Ideas = response.ideas ? response.ideas : []
				console.log("Ideas fetched!")
			}).catch(console.log)
			console.log("Contacts fetched!")
		})
	try
	{
	    fetch({ url: `http://${config.tpServerIP}:${config.tpServerPort}/fetchScores` }).send().catch(err => console.log("Failed to connect to the TP server"))
	}
	catch
	{
	}
        console.log('fetching complete')
    })
}

const SetInteractions = (GuildID, enable, callback) => {
	let cb = true
	try{
		if(enable){
			let Break = false
			Interactions.forEach(int => {
					if(!Break)
						client.api.applications(client.user.id).guilds(GuildID).commands.post(int).then(r => {
								if(cb)callback("Success!")
								cb = false
							}).catch(ex => {
							console.log("Caught slash command enable exception")
							console.log(ex)
							Break = true
							if(cb)
							{
								callback(`Failed to enable slash commands! Maybe the bot doesn't have permission to create slash commands in this guild. If that's the case, kick the bot and invite it with ${config.Invite}`)
								cb = false
							}
						})
			})
		}
		else client.api.applications(client.user.id).guilds(GuildID).commands.get().then(resp => {
				resp.forEach(int => {
						client.api.applications(client.user.id).guilds(GuildID).commands(int.id).delete().then(r => {
								if(cb)callback("Success!")
								cb = false
							}).catch(ex =>{
							console.log("Caught slash command disable exception")
							console.log(ex)
							if(cb)
							{
								callback(`Failed to disable slash commands`)
								cb = false
							}
						})
				})
			}).catch(ex => {
				console.log("Caught slash command disable exception")
				console.log(ex)
				if(cb)
				{
					callback(`Failed to disable slash commands`)
					cb = false
				}
			})
	}
	catch(ex){
		console.log("Unknown exception (sc)")
		console.log(ex)
		if(cb)
		{
			callback("Unknown error occurred")
			cb = false
		}
	}
}

client.on('ready', () => {
	for(const command of Object.keys(savefile))
	{
		try
		{
			let CommandFile = require(`./commands/${command}.js`)
			if(CommandFile.load)
				CommandFile.load(savefile[command])
		}
		catch {}
	}
	client.ws.on("INTERACTION_CREATE", int => {
		try
		{
			switch(int.type)
			{
				case 1:		//Ping
				    client.api.interactions(int.id, int.token).callback.post({data: {type: 1}})
				    break
				case 2:		//Slash commands and app commands
					switch(int.data.type)
					{
					    case 1:	//Slash commands
						let CommandFile = require(`./commands/${int.data.name}.js`)
						let run = MSG => {
							let args = MSG.content ? larg(MSG.content.split(' ')) : {_:[]}
							MSG.slash = true
							MSG.interaction = int
							CommandFile.run(client, MSG, args)
						}
						int.member.user.tag = `${int.member.user.username}#${int.member.user.discriminator}`
						if(CSCommands.includes(int.data.name)){
							client.channels.fetch(int.channel_id).then(channel => {
								let MSG = CreateMessageFromOptions(int.data.name, int.data.options, int.data.resolved, {author:int.member.user, channel:channel})
								client.api.interactions(int.id, int.token).callback.post({data:{type:4, data:{content:`Running command: ${config.token}${int.data.name} ${MSG.content}`}}})
								run(MSG)
							})
						}
						else{
							let MSG = CreateMessageFromOptions(int.data.name, int.data.options, int.data.resolved, {author:int.member.user, guild:{id:int.guild_id}, channel:{id:int.channel_id,send:obj => { client.api.interactions(int.id, int.token).callback.post(CreateDataFromObject(obj))}}})
							run(MSG)
						}
						break
					    case 2:	//User commands
						let AppFile = require(`./apps/${int.data.name.toLowerCase().replaceAll(" ", "_")}.js`)
						let user = Object.values(int.data.resolved.users)[0]
						user.tag = `${user.username}#${user.discriminator}`
						client.guilds.fetch(int.guild_id).then(guild => {
						    AppFile.onUser(client, user, guild, (msg, flags) => {
							data = CreateDataFromObject(msg)
							data.data.data.flags = flags
							client.api.interactions(int.id, int.token).callback.post(data)
						    })
						})
						break
					    case 3:	//Message commands
						let _AppFile = require(`./apps/${int.data.name.toLowerCase().replaceAll(" ", "_")}.js`)
						let _msg = Object.values(int.data.resolved.messages)[0]
						_msg.app = true
						_msg.author.tag = `${_msg.author.username}#${_msg.author.discriminator}`
						client.guilds.fetch(int.guild_id).then(guild => {
						    _msg.guild = guild
						    _AppFile.onMessage(client, _msg, (msg, flags) => { 
							data = CreateDataFromObject(msg)
							data.data.data.flags = flags
							client.api.interactions(int.id, int.token).callback.post(data)
						    })
						})
						break
					    default:	//Just in case
						break
					}
					break
				case 3:		//Components
					let custom_id = int.data.custom_id.split(' ')
					let CFile = require(`./commands/${custom_id[0]}.js`)
					client.channels.fetch(int.message.channel_id).then(channel => {
							CFile.component(client, int, custom_id[1], channel, int.message)
					}).catch(console.error)
					break
				default:	//Just in case
					return
			}
		}
		catch(e)
		{
			console.log(e)
		}
	})
	/*client.ws.on("THREAD_MEMBERS_UPDATE", ThreadUpdate => {
		if(ThreadUpdate.added_members && dp.GetDPThreads().includes(ThreadUpdate.id))
		{
			client.guilds.fetch(ThreadUpdate.guild_id).then(guild => {
				for(const member of ThreadUpdate.added_members)
				{
					guild.members.fetch(member.user_id).then(m => {
						m.createDM().then(dm => dm.send("Welcome to Discord Plays: KTaNE! Commands work in the exact same way as they do on Twitch Plays.\nFor a list of commands, visit https://samfundev.github.io/KtaneTwitchPlays/ (Use the !help command for more info)"))
					})
				}
			})
		}
	})*/
	let body = getCooldown()
	if(body.SlashCommands) body.SlashCommands.forEach(GuildID => SetInteractions(GuildID, true, r => {}))
    console.log(`Hello world!\nLogged in as ${client.user.tag}\nI am in ${client.guilds.cache.map(g => g).length} servers`)
    client.user.setActivity(`${config.token}help | try ${config.token}repo`)
    if (config.prod) {
        const DBL = require('dblapi.js')
        const d = new DBL(config.dblToken, client)
        d.on('posted', _ => {
            console.log('posted server count to dbl')
        })
        d.on('error', e => {
            console.log(e)
        })
    }
    getKtaneModules()
    setInterval(() => {
        getKtaneModules()
        console.log('Updated ktaneModules!')
    }, 1800000)
})

client.on('messageCreate', message => {
    if (message.author.bot) return
    lookup(ktaneModules, message)
    if (!message.content.startsWith(config.token)) return dp.ValidateMessage(message)
	if (!profileWhitelist.includes(message.author.id) && message.content.length > 600) return message.channel.send("Please don't send messages containing more than 600 characters!") // why is this here

	while(message.content.includes("  ")) message.content = message.content.replace("  ", " ")

    let args = larg(message.content.slice(config.token.length).split(' '))

    try {
        if (args._[0].includes('.') || args._[0].includes('/')) return
        let commandFile = require(`./commands/${args._[0]}.js`)
        args._.shift()
        commandFile.run(client, message, args)
    } catch (err) {
        console.error(err)
	SimHandler.send(message)
    }
})

client.login(config.discord)

module.exports.Save = (key, data) => savefile[key] = data
module.exports.WriteSave = () => {
	let path = [__dirname, "save.json"].join("/")
	fs.writeFileSync(path, JSON.stringify(savefile), "utf8")
}
module.exports.Bot = () => client
module.exports.ktaneModules = () => ktaneModules
module.exports.CreatorContacts = () => CreatorContacts
module.exports.Ideas = () => Ideas
module.exports.modIDs = modIDs
module.exports.getCooldown = getCooldown
module.exports.SetInteractions = SetInteractions
module.exports.Enable_Cooldown = false
module.exports.embed = embed
module.exports.CreateAPIMessage = CreateAPIMessage
