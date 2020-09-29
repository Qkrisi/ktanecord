const main = require("../main.js")
const config = require("../../config.json")

class RegexModule
{
	constructor(module, msgString)
	{
		this.Module = module
		this.MessageString = msgString
	}
}

const GetEscape = ch => ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'].indexOf(ch.toLowerCase()) > -1 ? ch : `\\${ch}`

const ConvertToFull = simple => {
	let s = simple.split("")
	let ind = -1
	s.forEach(char => {
		ind++
		switch(char){
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
				s[ind] = GetEscape(char)
				break
		}
	})
	return `/^${s.join("")}${"$"}/i`
}
//`/^${simple.replace(/\?/g,"(.)").replace(/\*/g,"(.*?)").replace(/\#/g, "([0-9])")}${"$"}/i`

function GetMatching(regex)
{
	console.log(regex)
	if(regex.startsWith("/")) regex = regex.substring(1)
	let i = regex.lastIndexOf("/")
	let flags = []
	if(i > -1)
	{
		flags = regex.substring(i+1, regex.length)
		regex = regex.substring(0, i)
		flags = flags.split("")
		
	}
	let re
	try
	{
		re = new RegExp(regex, ...flags)
	}
	catch
	{
		return undefined
	}
	let modules = []
	main.ktaneModules().forEach(value => {
		let results
		if(results = re.exec(value.Name))
		{
			let ModuleBuilder = new RegexModule(value, value.Name)
			ModuleBuilder.MessageString = ModuleBuilder.MessageString.replace(results[0], `**${results[0]}**`)
			//results.forEach(result => {console.log(result); if(result.trim()!="") ModuleBuilder.MessageString = ModuleBuilder.MessageString.replace(result, `**${result}**`)})
			if(new RegExp("\\*\\*\\*\\*(.*?)", "i").exec(ModuleBuilder.MessageString)) ModuleBuilder.MessageString = `**${ModuleBuilder.Module.Name}**`
			modules.push(ModuleBuilder)
		}
	})
	let banned = []
	let remove = []
	let ind = -1
	modules.forEach(module => {
		ind++
		if(banned.indexOf(module.MessageString) > -1) remove.push(ind)
		else {banned.push(module.MessageString)}
	})
	remove.forEach(index => delete modules[index])
	modules = modules.filter(value => value)
	return modules
}

module.exports.run = (client, message, args) => {
	if(args._.length==0) return message.channel.send("🚫 You need to specify a regular expression!")
	let regex = (`${args.simple ? `${args.simple}${args._.length > 0 ? " " : ""}` : ""}` + args._.join(" "))
	let regexString = regex
	console.log(args)
	if(args.simple) regex = ConvertToFull(regex)
	let res = GetMatching(regex)
	if(!res) return message.channel.send(`Invalid ${args.simple ? "simple " : ""}RegEx: ${"`"}${regex}${"`"}.${!args.simple ? ` Did you mean ${"`"}${config.token}match --simple${"`"}?` : ""}`)
	message.channel.send(`Found ${res.length} result${res.length == 1 ? "" : "s"} for ${regexString}${res.length > 0 ? `${res.length > 10 ? "; showing first 10:" : ":"}` : ""}`)
	if(res.length < 1) return
	let lines = []
	let i = 0
	res.forEach(module => {
		if(i < 10)
		{
			lines.push(module.MessageString)
			i++	
		}
	})
	message.channel.send(lines.join("\n"))
}

module.exports.GetMatching = GetMatching
module.exports.ConvertToFull = ConvertToFull
