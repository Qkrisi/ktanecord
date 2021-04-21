const Discord = require('discord.js')
let intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED)
intents.add("GUILD_MEMBERS")
const client = new Discord.Client({ws:{intents:intents}})
const config = require('../config.json')
const fetch = require('wumpfetch')
const larg = require('larg')
const { aliases, profileWhitelist, Interactions } = require('./map.js')
const lookup = require('./lookup')
const fs = require('fs')
const SimHandler = require("./KtaneSimHandler.js")

let ktaneModules = new Map()
let modIDs = []

let CreatorContacts = {}

function getCooldown() {
    let path = [__dirname, "cooldown.json"].join("/")
    return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {}
}

const CreateDataFromObject = obj => {
	let body = {data:{type:4,data:{}}}
	if(typeof(obj)=="string") body.data.data.content=obj
	else body.data.data.embeds=[obj]
	return body
}

const CSCommands = ["setcs", "setbosscs", "comment", "clearcs"]

const CreateMessageFromOptions = (name, options, base) => {
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
			fetch({url:"https://ktane.onpointcoding.net/ideas/getmeta.php", parse:'json'}).send().then(res => {
				let response = res.body
				Ideas = response.ideas ? response.ideas : []
				console.log("Ideas fetched!")
			}).catch(console.log)
			console.log("Contacts fetched!")
		})
        fetch({ url: `http://${config.tpServerIP}:${config.tpServerPort}/fetchScores` }).send()
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
	client.ws.on("INTERACTION_CREATE", int => {
			let CommandFile = require(`./commands/${int.data.name}.js`)
			let run = MSG => {
				let args = MSG.content ? larg(MSG.content.split(' ')) : {_:[]}
				CommandFile.run(client, MSG, args)
			}
			int.member.user.tag = `${int.member.user.username}#${int.member.user.discriminator}`
			if(CSCommands.includes(int.data.name)){
				client.channels.fetch(int.channel_id).then(channel => {
					let MSG = CreateMessageFromOptions(int.data.name, int.data.options, {author:int.member.user, channel:channel})
					client.api.interactions(int.id, int.token).callback.post({data:{type:4, data:{content:`Running command: ${config.token}${int.data.name} ${MSG.content}`}}})
					run(MSG)
				})
			}
			else{
				let MSG = CreateMessageFromOptions(int.data.name, int.data.options, {author:int.member.user, guild:{id:int.guild_id}, channel:{id:int.channel_id,send:obj => { client.api.interactions(int.id, int.token).callback.post(CreateDataFromObject(obj))}}})
				run(MSG)
			}
	})
	let body = getCooldown()
	if(body.SlashCommands) body.SlashCommands.forEach(GuildID => SetInteractions(GuildID, true, r => {}))
    console.log(`Hello world!\nLogged in as ${client.user.tag}\nI am in ${client.guilds.cache.keyArray().length} servers`)
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

client.on('message', message => {
    if (message.author.bot) return
    lookup(ktaneModules, message)
    if (!message.content.startsWith(config.token)) return
	if (!profileWhitelist.includes(message.author.id) && message.content.length > 600) return message.channel.send("Please don't send messages containing more than 600 characters!") // why is this here

	while(message.content.includes("  ")) message.content = message.content.replace("  ", " ")

    let args = larg(message.content.slice(config.token.length).split(' '))

    try {
        if (args._[0].includes('.') || args._[0].includes('/')) return
        let commandFile = require(`./commands/${args._[0]}.js`)
        args._.shift()
        commandFile.run(client, message, args)
    } catch (err) {
        console.log(err)
        SimHandler.send(message)
    }
})

client.login(config.discord)

module.exports.ktaneModules = () => ktaneModules
module.exports.CreatorContacts = () => CreatorContacts
module.exports.Ideas = () => Ideas
module.exports.modIDs = modIDs
module.exports.getCooldown = getCooldown
module.exports.SetInteractions = SetInteractions
module.exports.Enable_Cooldown = false
