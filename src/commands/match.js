const main = require("../main.js")
const config = require("../../config.json")
const discord = require("discord.js")

class RegexModule {
	constructor (module, msgString) {
		this.Module = module
		this.MessageString = msgString
	}
}

class RegexStore {
	constructor (module, matches){
		this.Module = module
		this.Matches = matches
	}
}

const getEscape = ch => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(ch.toLowerCase()) > -1 ? ch : `\\${ch}`

const convertToFull = simple => {
	let s = simple.split("")
	let ind = -1
	s.forEach(char => {
		ind++
		switch (char) {
			case "*":
				s[ind] = "(.*?)"
				break
			case "?":
				s[ind] = "(.)"
				break
			case "#":
				s[ind] = "([0-9])"
				break
			default:
				s[ind] = getEscape(char)
				break
		}
	})
	return `/^${s.join("")}${"$"}/i`
}
//`/^${simple.replace(/\?/g,"(.)").replace(/\*/g,"(.*?)").replace(/\#/g, "([0-9])")}${"$"}/i`

function getMatching(regex, mIndex = 0, maxMatches = {}) {
	if (regex.startsWith("/")) regex = regex.substring(1)
	let i = regex.lastIndexOf("/")
	let flags = ""
	if (i > -1) {
		flags = regex.substring(i + 1, regex.length)
		regex = regex.substring(0, i)
	}
	if (!flags.includes("g"))
		flags += "g"
	let re
	try {
		re = new RegExp(regex, flags)
	}
	catch {
		return undefined
	}
	let modules = []
	let matches = {}
	main.ktaneModules().forEach(value => {
		let result
		let moduleName = value.Name
		for(const result of moduleName.matchAll(re)) {
			if (!matches[moduleName])
				matches[moduleName] = new RegexStore(value, [])
			let matchList = [result.index, result.index + result[0].length, result[0]]
			if (!matches[moduleName].Matches.some(match => match[0] == matchList[0] && match[1] == matchList[1] && match[2] == matchList[2]))
				matches[moduleName].Matches.push(matchList)
		}
	})
	let m = 0
	Object.keys(matches).forEach(ModuleName => {
		let module = matches[ModuleName]
		if (module.Matches.length > m)
			m = module.Matches.length
		let moduleBuilder = new RegexModule(module.Module, module.Module.Name)
		let mInd = mIndex >= module.Matches.length ? module.Matches.length -1 : mIndex
		let match = module.Matches[mInd]
		let msgString = moduleBuilder.MessageString
		moduleBuilder.MessageString = msgString.substring(0, match[0])+"**"+match[2]+"**"+msgString.substring(match[1], msgString.length)
		if (new RegExp("\\*\\*\\*\\*(.*?)", "i").exec(moduleBuilder.MessageString)) moduleBuilder.MessageString = `**${moduleBuilder.Module.Name}**`
		modules.push(moduleBuilder)
	})
	maxMatches.max = m
	return modules
}

async function getMessageData(regex, page, match, channel) {
	let regexString = regex
	let maxMatches = {"max":0}
	let res = getMatching(convertToFull(regex), match, maxMatches)
	if (!res || res.length == 0) res = getMatching(regex, match, maxMatches)
	if (!res) return
	let lines = []
	for(let i = page * 10; i < (page+1) * 10; i++) {
		if(res.length <= i)
			break
		lines.push(res[i].MessageString)
	}
	let maxPage = Math.ceil(res.length/10)
	if (maxPage == 0)
		maxPage = 1
	page++
	match++
	let maxMatch = maxMatches.max
	if (maxMatch == 0)
		maxMatch = 1
	let joinedLines = lines.join("\n")
	let emb = main.embed.getEmbed("Matches", {
		"title": `__Found ${res.length} result${res.length == 1 ? "" : "s"} for ${regexString}:__`,
		"info": `Page ${page} of ${maxPage}, match ${match} of ${maxMatch}`,
		"matches": joinedLines ? joinedLines : "      ​"
	})
	const { data, files } = await discord.APIMessage.create(channel, "", {allowedMentions: {}, disableMentions: "none"}).resolveData().resolveFiles();
	data.embeds.push(emb)
	if (maxPage > 1) {
		data.components = [{ "type": 1, "components": [] }]
		if(page > 1)
			data.components[0].components.push({
				"type": 2,
				"custom_id": "match prev_page",
				"label": "Previous page",
				"style": 4
			})
		if (page < maxPage)
			data.components[0].components.push({
				"type": 2,
				"custom_id": "match next_page",
				"label": "Next page",
				"style": 3
			})
	}
	if (maxMatch > 1) {
		let componentIndex = 0
		if (data.components) {
			data.components.push({"type": 1, "components": []})
			componentIndex = 1
		}
		else data.components = [{"type": 1, "components": []}]
		if (match > 1)
			data.components[componentIndex].components.push({
				"type": 2,
				"custom_id": "match prev_matches",
				"label": "Previous matches",
				"style": 4
			})
		if (match < maxMatch)
			data.components[componentIndex].components.push({
				"type": 2,
				"custom_id": "match next_matches",
				"label": "Next matches",
				"style": 3
			})
	}
	return { data, files }
}


module.exports.run = async (client, message, args) => {
	if (args._.length == 0) return message.channel.send("🚫 You need to specify a regular expression!")
	let regex = args._.join(" ")
	let res = await getMessageData(regex, 0, 0, message.channel)
	if (!res)
		return message.channel.send("Invalid regex")
	const { data, files } = res
	if (message.slash) {
		if(data.components)
			data.embeds[0].components = data.components
		message.channel.send(data.embeds[0])
	}
	else return client.api.channels[message.channel.id].messages.post({data, files}).then(d => client.actions.MessageCreate.handle(d).message)
}

module.exports.component = async(client, interaction, customId, channel, message) => {
	let msgEmbed = message.embeds[0]
	let regex = msgEmbed.fields[0].name.match(/^__Found \d+ results? for (.*?):__$/)[1]
	let footerGroups = msgEmbed.footer.text.match(/^Page (\d+) of \d+, match (\d+) of \d+$/)
	let pageNum = footerGroups[1]-1
	let matchNum = footerGroups[2]-1
	switch (customId) {
		case "prev_page":
			pageNum--
			break
		case "next_page":
			pageNum++
			break
		case "prev_matches":
			matchNum--
			break
		case "next_matches":
			matchNum++
			break
	}
	const { data, files } = await getMessageData(regex, pageNum, matchNum, channel)
	client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 7, data: data}})
}

module.exports.getMatching = getMatching
module.exports.convertToFull = convertToFull
