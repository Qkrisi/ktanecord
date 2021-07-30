const { GetIdeaEmbed } = require('./commands/idea.js')
const { aliases, manualOverride } = require('./map.js')
const { levenshteinRatio, parseDifficulty, embed, getColor, months, getModule: GetModule, FakeArg, mostSimilarModule } = require('./utils.js')
const main = require("./main.js")
const axios = require('axios')
const d = /\[\[([^}]+)]]/g
const ideaPattern = /i\[\[([^}]+)]]/gi
const codeExclude = /`.*?`/g

module.exports = async (modules, message) => {
    message.content = message.content.replace(codeExclude, '')
    let m = ideaPattern.exec(message.content)
    let idea = true
    if (m == null) {
		idea = false
		m = d.exec(message.content)
		if (m==null) return
	}
    m = m[1]
    if (!idea) {
		let inputModule = modules.get(aliases.get(m)) ||
			modules.get(m) ||
			modules.get(mostSimilarModule(m)) || GetModule(message, new FakeArg(m), false)
		if (!inputModule) return
		let sb = inputModule.Symbol ? ` (${inputModule.Symbol}) ` : ` `
		let updated = "No data"
		let manualId = manualOverride.has(inputModule.Name) ? manualOverride.get(inputModule.Name) : inputModule.Name
		await axios.get(encodeURI(`https://ktane.timwi.de/ManualLastUpdated/${manualId}.html`)).then(async (resp) => {
			let lastUpdatedDate = new Date(resp.data)
			updated = `${lastUpdatedDate.getUTCFullYear()}-${lastUpdatedDate.getUTCMonth() + 1}-${lastUpdatedDate.getUTCDate()}`
		}).catch()
		message.channel.send('', {
			embed: embed.getEmbed("IML", {
				imlT: `${inputModule.Name}${sb}${inputModule.TwitchPlays ? inputModule.TwitchPlays.Score ? ` \u00B7 <:Twitch:702495822281048129> ${inputModule.TwitchPlays.Score}` : '' : ''}${inputModule.RuleSeedSupport === 'Supported' ? ' \u00B7 <:RuleSeed:702495784716992583>' : ''}${inputModule.Souvenir ? inputModule.Souvenir.Status == 'Supported' ? ' \u00B7 S' : '' : ''}${inputModule.MysteryModule == undefined ? " \u00B7 MM" : ""}`,
				imlD: '[Manual](' + encodeURI(`https://ktane.timwi.de/HTML/${manualId}.html`) + `) | ${parseDifficulty(inputModule.DefuserDifficulty)} (d), ${parseDifficulty(inputModule.ExpertDifficulty)} (e)\n` + inputModule.Description.split('Tags')[0].trim(),
				imlF: `${inputModule.Type == 'Widget' ? 'Widget' : 'Module'} made by ${inputModule.Author}; published on ${inputModule.Published}, last updated on ${updated}`,
				imlU: `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`,
				diffColor: getColor(inputModule)
			})
		})
	}
	else {
		let ideas = main.ideas()
		let namedIdeas = {}
		for (let i = 0;i<ideas.length;i++) {
			namedIdeas[ideas[i].name]=ideas[i]
		}
		let similarName = mostSimilarModule(m, namedIdeas)
		if (similarName)
			message.channel.send('', { embed: GetIdeaEmbed(namedIdeas[similarName]) })
	}
}
