const { GetIdeaEmbed } = require('./commands/idea')
const { aliases, manualOverride } = require('./map')
const { levenshteinRatio, parseDifficulty, embed, getColor, months, GetModule, FakeArg, mostSimilarModule } = require('./utils')
const main = require("./main")
const axios = require('axios')
const d = /\[\[([^}]+)]]/g
const IdeaPattern = /i\[\[([^}]+)]]/gi
const CodeExclude = /`.*?`/g

module.exports = async (modules, message) => {
    message.content = message.content.replace(CodeExclude, '')
    let m = IdeaPattern.exec(message.content)
    let idea = true
    if (m == null) {
		idea = false
		m = d.exec(message.content)
		if(m==null) return
	}
    m = m[1]
    if(!idea){
		let inputmodule = modules.get(aliases.get(m)) ||
			modules.get(m) ||
			modules.get(mostSimilarModule(m)) || GetModule(message, new FakeArg(m), false)
		if (!inputmodule) return
		let sb = inputmodule.Symbol ? ` (${inputmodule.Symbol}) ` : ` `
		let Updated = "No data"
		let manualId = manualOverride.has(inputmodule.Name) ? manualOverride.get(inputmodule.Name) : inputmodule.Name
		await axios.get(encodeURI(`https://ktane.timwi.de/ManualLastUpdated/${manualId}.html`)).then(async (resp) => {
			let LastUpdatedDate = new Date(resp.data)
			Updated = `${LastUpdatedDate.getUTCFullYear()}-${LastUpdatedDate.getUTCMonth() + 1}-${LastUpdatedDate.getUTCDate()}`
		}).catch()
		
		if(!inputmodule.Description)
		{
			if(!inputmodule.Descriptions)
					inputmodule.Description = ""
			else
			{
					for({Description, language} of inputmodule.Descriptions)
					{
							if(language == "English")
									inputmodule.Description = Description
					}
					if(!inputmodule.Description)
							inputmodule.Description = inputmodule.Descriptions[0].Description
			}
		}
		message.channel.send({
			embeds: [embed.getEmbed("IML", {
				imlT: `${inputmodule.Name}${sb}${inputmodule.TwitchPlays ? inputmodule.TwitchPlays.Score ? ` \u00B7 <:Twitch:702495822281048129> ${inputmodule.TwitchPlays.Score}` : '' : ''}${inputmodule.RuleSeedSupport === 'Supported' ? ' \u00B7 <:RuleSeed:702495784716992583>' : ''}${inputmodule.Souvenir ? inputmodule.Souvenir.Status == 'Supported' ? ' \u00B7 S' : '' : ''}${inputmodule.MysteryModule == undefined ? " \u00B7 MM" : ""}`,
				imlD: '[Manual](' + encodeURI(`https://ktane.timwi.de/HTML/${manualId}.html`) + `) | ${parseDifficulty(inputmodule.DefuserDifficulty)} (d), ${parseDifficulty(inputmodule.ExpertDifficulty)} (e)\n` + inputmodule.Description.split('Tags')[0].trim(),
				imlF: `${inputmodule.Type == 'Widget' ? 'Widget' : 'Module'} made by ${inputmodule.Author}; published on ${inputmodule.Published}, last updated on ${Updated}`,
				imlU: `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`,
				diffColor: getColor(inputmodule)
			})]
		})
	}
	else{
		let Ideas = main.Ideas()
		let NamedIdeas = {}
		for(let i = 0;i<Ideas.length;i++){
			NamedIdeas[Ideas[i].name]=Ideas[i]
		}
		let SimilarName = mostSimilarModule(m, NamedIdeas)
		if(SimilarName) message.channel.send({
			embeds: [GetIdeaEmbed(NamedIdeas[SimilarName])]
		})
	}
}
