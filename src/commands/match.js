const main = require("../main.js")
const config = require("../../config.json")
const discord = require("discord.js")

class RegexModule {
	constructor(module, msgString) {
		this.Module = module
		this.MessageString = msgString
	}
}

class RegexStore {
	constructor(module, matches){
		this.Module = module
		this.Matches = matches
	}
}

const GetEscape = ch => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(ch.toLowerCase()) > -1 ? ch : `\\${ch}`

const ConvertToFull = simple => {
	let s = simple.split("")
	let ind = -1
	for(const char of s)
	{
		ind++
		switch (char)
		{
			case "*":
				s[ind] = "(.*?)"
				break
			case "?":
				s[ind] = "(.)"
				break
			case "#":
				s[ind] = "(\\d)"
				break
			default:
				s[ind] = GetEscape(char)
				break
		}
	}
	return `/^${s.join("")}${"$"}/i`
}
//`/^${simple.replace(/\?/g,"(.)").replace(/\*/g,"(.*?)").replace(/\#/g, "([0-9])")}${"$"}/i`

function GetMatching(regex, MIndex = 0, MaxMatches = {}) {
	if (regex.startsWith("/")) regex = regex.substring(1)
	let i = regex.lastIndexOf("/")
	let flags = ""
	if (i > -1) {
		flags = regex.substring(i + 1, regex.length)
		regex = regex.substring(0, i)
	}
	if(!flags.includes("g"))
		flags+="g"
	let re
	try {
		re = new RegExp(regex, flags)
	}
	catch
	{
		return undefined
	}
	let modules = []
	let matches = {}
	main.ktaneModules().forEach(value => {
		let result
		let ModuleName = value.Name
		for(const result of ModuleName.matchAll(re)) {
			if(!matches[ModuleName])
				matches[ModuleName] = new RegexStore(value, [])
			let MatchList = [result.index, result.index + result[0].length, result[0]]
			if(!matches[ModuleName].Matches.some(match => match[0] == MatchList[0] && match[1] == MatchList[1] && match[2] == MatchList[2]))
				matches[ModuleName].Matches.push(MatchList)
		}
	})
	let m = 0
	Object.keys(matches).forEach(ModuleName => {
		let module = matches[ModuleName]
		if(module.Matches.length > m)
			m = module.Matches.length
		let ModuleBuilder = new RegexModule(module.Module, module.Module.Name)
		let MInd = MIndex >= module.Matches.length ? module.Matches.length -1 : MIndex
		let match = module.Matches[MInd]
		let MSGString = ModuleBuilder.MessageString
		ModuleBuilder.MessageString = MSGString.substring(0, match[0])+"**"+match[2]+"**"+MSGString.substring(match[1], MSGString.length)
		if (new RegExp("\\*\\*\\*\\*(.*?)", "i").exec(ModuleBuilder.MessageString))
			ModuleBuilder.MessageString = `**${ModuleBuilder.Module.Name}**`
		modules.push(ModuleBuilder)
	})
	MaxMatches.max = m
	return modules
}

async function GetMessageData(regex, page, match, channel, client)
{
	let regexString = regex
	let MaxMatches = {"max":0}
	let res = GetMatching(ConvertToFull(regex), match, MaxMatches)
	if (!res || res.length == 0) res = GetMatching(regex, match, MaxMatches)
	if(!res) return
	let lines = []
	for(let i = page*10; i < (page+1)*10; i++)
	{
		if(res.length <= i)
			break
		lines.push(res[i].MessageString)
	}
	MaxPage = Math.ceil(res.length/10)
	if(MaxPage == 0)
		MaxPage = 1
	page++
	match++
	let MaxMatch = MaxMatches.max
	if(MaxMatch == 0)
		MaxMatch = 1
	let JoinedLines = lines.join("\n")
	let emb = main.embed.getEmbed("Matches", {
			"title": `__Found ${res.length} result${res.length == 1 ? "" : "s"} for ${regexString}:__`,
			"info": `Page ${page} of ${MaxPage}, match ${match} of ${MaxMatch}`,
			"matches": JoinedLines ? JoinedLines : "      ​"
	})
	const { data, files, send } = await main.CreateAPIMessage(channel, client, "⠀")
	data.embeds = [emb]
	if(MaxPage > 1)
	{
		data.components = [{"type": 1, "components": []}]
		if(page > 1)
			data.components[0].components.push({
					"type": 2,
					"custom_id": "match prev_page",
					"label": "Previous page",
					"style": 4
				})
		if(page < MaxPage)
			data.components[0].components.push({
					"type": 2,
					"custom_id": "match next_page",
					"label": "Next page",
					"style": 3
				})
	}
	if(MaxMatch > 1)
	{
		let ComponentIndex = 0
		if(data.components)
		{
			data.components.push({"type": 1, "components": []})
			ComponentIndex = 1
		}
		else data.components = [{"type": 1, "components": []}]
		if(match > 1)
			data.components[ComponentIndex].components.push({
					"type": 2,
					"custom_id": "match prev_matches",
					"label": "Previous matches",
					"style": 4
				})
		if(match < MaxMatch)
			data.components[ComponentIndex].components.push({
					"type": 2,
					"custom_id": "match next_matches",
					"label": "Next matches",
					"style": 3
				})
	}
	return { data, files, send }
}


module.exports.run = async(client, message, args) => {
	if (args._.length == 0) return message.channel.send("🚫 You need to specify a regular expression!")
	let regex = args._.join(" ")
	let res = await GetMessageData(regex, 0, 0, message.channel, client)
	if(!res)
		return message.channel.send("Invalid regex")
	const { data, files, send } = res
	if(message.slash)
	{
		if(data.components)
			data.embeds[0].components = data.components
		message.channel.send(data.embeds[0])
	}
	else return await send(data)
}

module.exports.component = async(client, interaction, custom_id, channel, message) => {
	let MSGEmbed = message.embeds[0]
	let regex = MSGEmbed.fields[0].name.match(/^__Found \d+ results? for (.*?):__$/)[1]
	let FooterGroups = MSGEmbed.footer.text.match(/^Page (\d+) of \d+, match (\d+) of \d+$/)
	let PageNum = FooterGroups[1]-1
	let MatchNum = FooterGroups[2]-1
	switch(custom_id)
	{
		case "prev_page":
			PageNum--
			break
		case "next_page":
			PageNum++
			break
		case "prev_matches":
			MatchNum--
			break
		case "next_matches":
			MatchNum++
			break
	}
	const { data, files, send } = await GetMessageData(regex, PageNum, MatchNum, channel, client)
	client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 7, data: data}})
}

module.exports.GetMatching = GetMatching
module.exports.ConvertToFull = ConvertToFull
