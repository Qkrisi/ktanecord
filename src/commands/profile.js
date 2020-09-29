const { embed, difficulties, getColor, FakeArg, GetModule } = require('../utils')
const main = require('../main.js')
const { modIDs } = require('../main.js')
const fetch = require('wumpfetch')
const { mostSimilarModule } = require('./repo.js')
const aliases = require('../map.js').aliases
const difficulties2 = [
	"Very Easy",
	"Easy",
	"Medium",
	"Hard",
	"Very Hard"
]

module.exports.run = async(client, message, args) => {
	let arr = message.attachments.clone().array()
	if(arr.length<1)
	{
		return message.channel.send("No profile attached")
	}
	await fetch({ url: arr[0].url}).send().then(async (res) => {
		let result = undefined
		try
		{
			result = JSON.parse(res.body)
		}
		catch(SyntaxError)
		{
			return message.channel.send(`Your profile is invalid, <@${message.author.id}>`)
		}
		if(result.DisabledList==undefined || result.Operation==undefined)
		{
			return message.channel.send(`Your profile is invalid, <@${message.author.id}>`)
		}
		let len = 0
		let avgDef = 0
		let avgExp = 0
		let EnabledList = result.EnabledList
		if(EnabledList==undefined)
		{
			EnabledList = []
			modIDs.forEach(module => {
					if(!result.DisabledList.includes(module)) EnabledList.push(module) 
				})
		}
		EnabledList.forEach(module => {
				if(module)
				{
					let inputmodule = GetModule(message, new FakeArg(module), false)
					if(inputmodule)
					{
						defNum = difficulties.get(inputmodule.DefuserDifficulty)
						expNum = difficulties.get(inputmodule.ExpertDifficulty)
						avgDef += defNum==undefined ? 0 : defNum
						avgExp += expNum==undefined ? 0 : expNum
						len += 1
					}
				}
		})
		if(len>0)
		{
			avgDef = difficulties2[Math.round(avgDef/len)]
			avgExp = difficulties2[Math.round(avgExp/len)]
		}
		else
		{
			avgDef = "No data"
			avgExp = "No data"
		}
		message.channel.send(embed.getEmbed("Profile",{
				name:`Profile of ${message.author.username}`,
				diff: avgDef == "No data" || avgExp == "No data" ? 0x7289DA : getColor({DefuserDifficulty:avgDef.replace(' ',''), ExpertDifficulty:avgExp.replace(' ','')}),
				enableds:EnabledList.length,
				disableds:result.DisabledList.length,
				defDif:avgDef,
				expDif:avgExp,
				operation:result.Operation ? "Defuser" : "Expert"
			}))
	})
}
