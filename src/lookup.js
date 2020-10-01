const { aliases, manualOverride } = require('./map')
const { levenshteinRatio, parseDifficulty, embed, getColor, months, GetModule, FakeArg } = require('./utils')
const axios = require('axios')
const d = /\{[^}]+}/g

function mostSimilarModule(modules, searchItem) {
    let keys = Array.from(modules.keys())
    let module = keys.sort((entry1, entry2) =>
        levenshteinRatio(entry2.toLowerCase(), searchItem) - levenshteinRatio(entry1.toLowerCase(), searchItem)
    )[0]
    if (levenshteinRatio(module.toLowerCase(), searchItem) < 0.7) return null
    return module
}

module.exports = async (modules, message) => {
    let m = d.exec(message.content)
    if (m == null) { return } // don't remove {} otherwise ASI will fuck it up
    m = m[0].slice(1, m[0].length - 1).toLowerCase()
    console.log(m)
    let inputmodule = modules.get(aliases.get(m)) ||
        modules.get(m) ||
        modules.get(mostSimilarModule(modules, m)) || GetModule(message, new FakeArg(m), false)
    if (!inputmodule) return
    let sb = inputmodule.Symbol ? ` (${inputmodule.Symbol}) ` : ` `
    let Updated = "No data"
    let manualId = manualOverride.has(inputmodule.Name) ? manualOverride.get(inputmodule.Name) : inputmodule.Name
    axios.get(encodeURI(`https://ktane.timwi.de/ManualLastUpdated/${manualId}.html`)).then(async (resp) => {
        let LastUpdatedDate = new Date(resp.data)
        Updated = `${LastUpdatedDate.getUTCFullYear()}-${LastUpdatedDate.getUTCMonth() + 1}-${LastUpdatedDate.getUTCDate()}`
    }).catch()
    await message.channel.send('', {
        embed: embed.getEmbed("IML", {
            imlT: `${inputmodule.Name}${sb}${inputmodule.TwitchPlays ? inputmodule.TwitchPlays.Score ? ` \u00B7 <:Twitch:702495822281048129> ${inputmodule.TwitchPlays.Score}` : '' : ''}${inputmodule.RuleSeedSupport === 'Supported' ? ' \u00B7 <:RuleSeed:702495784716992583>' : ''}${inputmodule.Souvenir ? inputmodule.Souvenir.Status == 'Supported' ? ' \u00B7 S' : '' : ''}${inputmodule.MysteryModule == undefined ? " \u00B7 MM" : ""}`,
            imlD: '[Manual](' + encodeURI(`https://ktane.timwi.de/HTML/${manualId}.html`) + `) | Defuser: ${parseDifficulty(inputmodule.DefuserDifficulty)} | Expert: ${parseDifficulty(inputmodule.ExpertDifficulty)}\n` + inputmodule.Description.split('Tags')[0].trim(),
            imlF: `${inputmodule.Type == 'Widget' ? 'Widget' : 'Module'} made by ${inputmodule.Author}; published on ${inputmodule.Published}, updated on ${Updated}`,
            imlU: `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`,
            diffColor: getColor(inputmodule)
        })
    })

}
