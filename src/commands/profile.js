const { embed, difficulties, getColor, FakeArg, GetModule } = require('../utils')
const main = require('../main.js')
const { modIDs } = require('../main.js')
const fetch = require('wumpfetch')
const { mostSimilarModule } = require('./repo.js')
const aliases = require('../map.js').aliases
const difficulties2 = [
	"Trivial",
	"Very Easy",
	"Easy",
	"Medium",
	"Hard",
	"Very Hard",
	"Extreme"
]

module.exports.run = async (client, message, args) => {
	let arr = message.attachments.map(attachment => attachment)
	if (arr.length < 1) {
		return message.channel.send("No profile attached")
	}
	await fetch({ url: arr[0].url }).send().then(async (res) => {
		let result = undefined
		if(typeof(res.body)=="string"){
			try {
				result = JSON.parse(res.body)
			}
			catch (SyntaxError) {
				return message.channel.send(`Your profile is invalid, <@${message.author.id}>`)
			}
		}
		else result=res.body
		if (result.DisabledList == undefined || result.Operation == undefined) {
			return message.channel.send(`Your profile is invalid, <@${message.author.id}>`)
		}
		let len = 0
		let avgDef = 0
		let avgExp = 0
		let EnabledList = result.EnabledList
		if (EnabledList == undefined) {
			EnabledList = []
			modIDs.forEach(module => {
				if (!result.DisabledList.includes(module)) EnabledList.push(module)
			})
		}
		EnabledList.forEach(module => {
			if (module) {
				let inputmodule = GetModule(message, new FakeArg(module), false)
				if (inputmodule) {
					defNum = difficulties.get(inputmodule.DefuserDifficulty)
					expNum = difficulties.get(inputmodule.ExpertDifficulty)
					avgDef += defNum == undefined ? 0 : defNum
					avgExp += expNum == undefined ? 0 : expNum
					len += 1
				}
			}
		})
		if (len > 0) {
			avgDef = difficulties2[Math.round(avgDef / len)]
			avgExp = difficulties2[Math.round(avgExp / len)]
		}
		else {
			avgDef = "No data"
			avgExp = "No data"
		}
		message.channel.send({embeds: [embed.getEmbed("Profile", {
			name: `Profile of ${message.author.username}`,
			diff: avgDef == "No data" || avgExp == "No data" ? "0x7289DA" : getColor({ DefuserDifficulty: avgDef.replace(' ', ''), ExpertDifficulty: avgExp.replace(' ', '') }).toString(16),
			enableds: EnabledList.length.toString(),
			disableds: result.DisabledList.length.toString(),
			defDif: avgDef,
			expDif: avgExp,
			operation: result.Operation ? "Defuser" : "Expert"
		})]})
	})
}
