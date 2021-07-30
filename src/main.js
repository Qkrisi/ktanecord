const Discord = require('discord.js')
let intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED)
intents.add("GUILD_MEMBERS")
const client = new Discord.Client({ws:{intents:intents}})
const config = require('../config.json')
const fetch = require('wumpfetch')
const larg = require('larg')
const { aliases, profileWhitelist, interactions } = require('./map.js')
const lookup = require('./lookup')
const fs = require('fs')
const simHandler = require("./KtaneSimHandler.js")
const { embed } = require("./utils.js")

let ktaneModules = new Map()
let modIDs = []

let creatorContacts = {}

function getCooldown() {
    let path = [__dirname, "cooldown.json"].join("/")
    return fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {}
}

const createDataFromObject = obj => {
	let body =  {data:{ type: 4, data: {} } }
	if (typeof(obj)=="string") body.data.data.content = obj
	else {
		if (obj.components) {
			body.data.data.components = obj.components
			delete obj.components
		}
		body.data.data.embeds= [obj]
	}
	return body
}

const csCommands = ["setcs", "setbosscs", "comment", "clearcs"]

const createMessageFromOptions = (name, options, base) => {
	if (options==undefined) return base
	let currentOptions = options
	currentOptions.sort((a, b) => a.value - b.value)
	let content = ""
	let seperator = csCommands.includes(name) ? "//" : " "
	while (true) {
		let breakout = true
		for (let i = 0; i < currentOptions.length; i++) {
			let option = currentOptions[i]
			let breakoutFor = false
			switch (option.type) {
				case 1:
					content += ` ${option.name}`
					currentOptions = option.options
					if(currentOptions != undefined)
					{
						currentOptions.sort((a, b) => a.value - b.value)
						breakout = false
					}
					breakoutFor = true
					break
				case 3:
					content += `${content ? seperator : ""}${option.value}`
					break
				case 5:
					if (option.value) content += ` --${option.name}`
					break
			}
			if (breakoutFor) break
		}
		if (breakout) break
	}
	if (content.startsWith(" ")) content = content.substr(1)
	base.content = content
	return base
}

let ideas = []

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
			creatorContacts = {}
			Object.keys(res.body).forEach(creator => {
				let LowerName = creator.toLowerCase()
				creatorContacts[LowerName] = res.body[creator]
				creatorContacts[LowerName].CreatorName = creator
			})
			fetch({url:"https://ktane.onpointcoding.net/ideas-old/getmeta.php", parse:'json'}).send().then(res => {
				let response = res.body
				ideas = response.ideas ? response.ideas : []
				console.log("Ideas fetched!")
			}).catch(console.log)
			console.log("Contacts fetched!")
		})
        fetch({ url: `http://${config.tpServerIP}:${config.tpServerPort}/fetchScores` }).send().catch(err => console.log("Failed to connect to the TP server"))
        console.log('fetching complete')
    })
}

const setInteractions = (GuildID, enable, callback) => {
	let cb = true
	try {
		if (enable) {
			let breakout = false
			interactions.forEach(int => {
				if(!breakout)
					client.api.applications(client.user.id).guilds(GuildID).commands.post(int).then(r => {
						if (cb) callback("Success!")
						cb = false
					}).catch(ex => {
					console.log("Caught slash command enable exception")
					console.log(ex)
					breakout = true
					if(cb) {
						callback(`Failed to enable slash commands! Maybe the bot doesn't have permission to create slash commands in this guild. If that's the case, kick the bot and invite it with ${config.Invite}`)
						cb = false
					}
				})
			})
		}
		else client.api.applications(client.user.id).guilds(GuildID).commands.get().then(resp => {
			resp.forEach(int => {
				client.api.applications(client.user.id).guilds(GuildID).commands(int.id).delete().then(r => {
					if (cb) callback("Success!")
					cb = false
				}).catch(ex =>{
					console.log("Caught slash command disable exception")
					console.log(ex)
					if (cb) {
						callback(`Failed to disable slash commands`)
						cb = false
					}
				})
			})
		}).catch(ex => {
			console.log("Caught slash command disable exception")
			console.log(ex)
			if (cb) {
				callback(`Failed to disable slash commands`)
				cb = false
			}
		})
	}
	catch (ex) {
		console.log("Unknown exception (sc)")
		console.log(ex)
		if (cb) {
			callback("Unknown error occurred")
			cb = false
		}
	}
}

client.on('ready', () => {
	client.ws.on("INTERACTION_CREATE", int => {
		switch (int.type) {
			case 2:	// Slash commands
				let commandFile = require(`./commands/${int.data.name}.js`)
				let run = msg => {
					let args = msg.content ? larg(msg.content.split(' ')) : {_:[]}
					msg.slash = true
					msg.interaction = int
					commandFile.run(client, msg, args)
				}
				int.member.user.tag = `${int.member.user.username}#${int.member.user.discriminator}`
				if (csCommands.includes(int.data.name)) {
					client.channels.fetch(int.channel_id).then(channel => {
						let msg = createMessageFromOptions(int.data.name, int.data.options, { author: int.member.user, channel: channel })
						client.api.interactions(int.id, int.token).callback.post({ data: { type: 4, data: { content: `Running command: ${config.token}${int.data.name} ${msg.content}` } } })
						run(msg)
					})
				}
				else {
					let msg  = createMessageFromOptions(int.data.name, int.data.options, {
						author: int.member.user, guild:{id:int.guild_id},
						channel: {
							id: int.channel_id,
							send: obj => { client.api.interactions(int.id, int.token).callback.post(createDataFromObject(obj)) }
						}
					})
					run(msg)
				}
				break

			case 3: // Components
				let customId = int.data.custom_id.split(' ')
				let cFile = require(`./commands/${customId[0]}.js`)
				client.channels.fetch(int.message.channel_id).then(channel => {
					cFile.component(client, int, customId[1], channel, int.message)
				}).catch(console.error)
				break

			default:
				return
		}
	})
	let body = getCooldown()
	if (body.SlashCommands) body.SlashCommands.forEach(guildId => setInteractions(guildId, true, r => {}))
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

	while (message.content.includes("  ")) message.content = message.content.replace("  ", " ")

    let args = larg(message.content.slice(config.token.length).split(' '))

    try {
        if (args._[0].includes('.') || args._[0].includes('/')) return
        let commandFile = require(`./commands/${args._[0]}.js`)
        args._.shift()
        commandFile.run(client, message, args)
    } catch (err) {
        console.log(err)
        simHandler.send(message)
    }
})

client.login(config.discord)

module.exports.ktaneModules = () => ktaneModules
module.exports.creatorContacts = () => creatorContacts
module.exports.ideas = () => ideas
module.exports.modIDs = modIDs
module.exports.getCooldown = getCooldown
module.exports.setInteractions = setInteractions
module.exports.enableCooldown = false
module.exports.embed = embed
