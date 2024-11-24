const dembParser = require("./dembParser.js")
const main = require('./main.js')
const discord = require('discord.js')
const { aliases } = require("./map.js")
const { GetMatching, ConvertToFull } = require("./commands/match.js")

class FakeArg {
	constructor(module) {
		this._ = module.split(" ")
	}
}

const cleanseDiscordText = (text) => text.replace(/`/g, "");

function mostSimilarModule(searchItem, obj = undefined) {
	let keys = obj==undefined ? Array.from(main.ktaneModules().keys()) : Object.keys(obj).filter(key => key!=undefined)
	let module = keys.sort((entry1, entry2) =>
		levenshteinRatio(entry2.toLowerCase(), searchItem) - levenshteinRatio(entry1.toLowerCase(), searchItem)
	)[0]
	if (levenshteinRatio(module.toLowerCase(), searchItem) < 0.7) return null
	return module
}

exports.parseDifficulty = d => !d ? "None" : d.startsWith('Very') ? d.replace('y', 'y ').trim() : d

const levenshteinRatio = (target, source) => {
	if (source == null || target == null) return 0.0
	if (source.length == 0 || target.length == 0) return 0.0
	if (source === target) return 1.0

	let sourceWordCount = source.length
	let targetWordCount = target.length

	let distance = new Array(sourceWordCount + 1)
	for (let i = 0; i < distance.length; i++) {
		distance[i] = new Array(targetWordCount + 1)
	}

	for (let i = 0; i <= sourceWordCount; distance[i][0] = i++);
	for (let j = 0; j <= targetWordCount; distance[0][j] = j++);

	for (let i = 1; i <= sourceWordCount; i++) {
		for (let j = 1; j <= targetWordCount; j++) {
			let cost = ((target.charAt(j - 1) === source.charAt(i - 1)) ? 0 : 1)

			distance[i][j] = Math.min(Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1), distance[i - 1][j - 1] + cost)
		}
	}

	return 1.0 - distance[sourceWordCount][targetWordCount] / Math.max(source.length, target.length)
}

exports.GetModule = (message, args, send = true) => {
	if(args._.join(' ').includes("`"))
	{
		message.channel.send("Please don't use backticks in the input!")
		return undefined
	}
	let HandleRegex = result => {
		if (result.length == 1) return result[0].Module
		else {
			if (send) {
				let msg = `Expression is ambigious between ${result.length} modules${result.length > 10 ? "; showing first 10" : ""}:`
				let lines = []
				let ind = -1
				result.forEach(r => {
					ind++
					if (ind < 10) lines.push(r.MessageString)
				})
				message.channel.send(`${msg}\n${lines.join("\n")}`)
			}
			return undefined
		}
	}
	let modules = main.ktaneModules()
	let module = modules.get(aliases.get(args._[0].toString().toLowerCase()))
	if (!module) module = modules.get(args._.join(' ').toLowerCase())
	if (!module) module = modules.get(args._[0])
	if (!module) module = modules.get(mostSimilarModule(args._.join(' ').toLowerCase()))
	if (!module) {
		let result = GetMatching(ConvertToFull(args._.join(' ')))
		if (result && result.length > 0) return HandleRegex(result)
		else {
			result = GetMatching(args._.join(' '))
			if (result && result.length > 0)
				return HandleRegex(result)
			if (send) message.channel.send(result === null ? "Regular expression timeout" : `🚫 Couldn't find a module by the ID of \`${cleanseDiscordText(args._[0])}\` (case-sensitive), name of \`${cleanseDiscordText(args._.join(' '))}\` (not case-sensitive) or periodic symbol of \`${cleanseDiscordText(args._[0])}\` (not case-sensitive)`)
			return undefined
		}
	}
	return module
}

exports.CreateAPIMessage = async(channel, client, content) => {
	let { data, files } = await discord.MessagePayload.create(channel, content, {allowedMentions: {}, disableMentions: "none"}).resolveData().resolveFiles()
	let send = async(dataOverride = null, callback = _ => {}, ChannelOverride = null) => {
		if(dataOverride != null)
			data = dataOverride
		return await client.api.channels[ChannelOverride ?? channel.id].messages.post({data, files}).then(async(d) => await callback(client.actions.MessageCreate.handle(d).message))
	}
	return { data, files, send }
}


const colors = [0x53FF00, 0x13FF00, 0x15B300, 0xFFFF00, 0xF91515, 0xA81313, 0x000000, 0x7289DA]
const difficulties = new Map([
        ['Trivial', 0],
        ['VeryEasy', 1],
        ['Easy', 2],
        ['Medium', 3],
        ['Hard', 4],
        ['VeryHard', 5],
        ['Extreme', 6],
        ['General', 7]
])

exports.FakeArg = FakeArg
exports.levenshteinRatio = levenshteinRatio
exports.mostSimilarModule = mostSimilarModule
exports.difficulties = difficulties
exports.getColor = inputmodule => colors[Math.max(...new Array(inputmodule.DefuserDifficulty ? inputmodule.DefuserDifficulty : "General", inputmodule.ExpertDifficulty ? inputmodule.ExpertDifficulty : "General").map(e => difficulties.get(e)))]
exports.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
exports.embed = new dembParser([__dirname, "/embeds.demb"].join(""))
