const { embed, levenshteinRatio, parseDifficulty, getColor, months } = require('../utils.js')
const { ktaneModules, getCooldown } = require('../main.js')
const { aliases, subjectOverrides, manualOverride } = require('../map.js')
const config = require('../../config.json')
const axios = require('axios')

let cooldown = new Map()

function doNothing() { }

function getRandomModule() {
    let keys = Array.from(ktaneModules.keys())
    return ktaneModules.get(keys[Math.floor(Math.random() * keys.length)])
}

function mostSimilarModule(searchItem) {
    let keys = Array.from(ktaneModules.keys())
    let module = keys.sort((entry1, entry2) =>
        levenshteinRatio(entry2.toLowerCase(), searchItem) - levenshteinRatio(entry1.toLowerCase(), searchItem)
    )[0]
    if (levenshteinRatio(module.toLowerCase(), searchItem) < 0.7) return null
    return module
}

var Updated = "No data"

module.exports.run = async(client, message, args) => {
    if (args._.length == 0 && !args.random) return message.channel.send(`🚫 You need to specify a module by entering its name, ID or periodic symbol, or select a random one with \`${config.token}repo --random\``)

    // why the fuck is this here?
    if (cooldown.get(message.author.id) <= Date.now())
        cooldown.delete(message.author.id)

    //defining the module
    let inputmodule
    if (args.random) {
        if (cooldown.has(message.author.id))
            return message.channel.send(`You are on cooldown for ${Math.round((cooldown.get(message.author.id) - Date.now()) / 1000)} seconds! You can still use the repo command with specified modules.`)
        inputmodule = getRandomModule()
        if (message.guild)
        {	
			let Cooldown = getCooldown()
            cooldown.set(message.author.id, Date.now() + (Cooldown.hasOwnProperty(message.guild.id.toString()) ? Cooldown[message.guild.id.toString()]*1000 : 45000))
		}
    }
    if (!inputmodule) inputmodule = ktaneModules.get(aliases.get(args._[0].toString().toLowerCase()))
    if (!inputmodule) inputmodule = ktaneModules.get(args._.join(' ').toLowerCase())
    if (!inputmodule) inputmodule = ktaneModules.get(args._[0])
    if (!inputmodule) inputmodule = ktaneModules.get(mostSimilarModule(args._.join(' ').toLowerCase()))
    if (!inputmodule) return message.channel.send(`🚫 Couldn't find a module by the ID of \`${args._[0]}\` (case-sensitive), name of \`${args._.join(' ')}\` (not case-sensitive) or periodic symbol of \`${args._[0]}\` (not case-sensitive)`)


    //adding the links of the module
    let links = []
    inputmodule.SteamID ? links.push(`[Workshop](http://steamcommunity.com/sharedfiles/filedetails/?id=${inputmodule.SteamID})`) : doNothing()
    inputmodule.SourceUrl ? links.push(`[Source code](${inputmodule.SourceUrl})`) : doNothing()
    inputmodule.TutorialVideoUrl ? links.push(`[Tutorial video](${inputmodule.TutorialVideoUrl})`) : doNothing()
    if (links.length == 0) {
        links.push('No links')
    }

	
    //adding the manuals of the module
    let manuals = []
    let base
    let manualId = manualOverride.has(inputmodule.Name) ? manualOverride.get(inputmodule.Name) : inputmodule.Name
    inputmodule.Sheets.forEach(e => {
        let v = e.split('|')
        if (v[1] == 'html') {
            base = `[${inputmodule.Name}${v[0]} (${v[1].toUpperCase()})](` + encodeURI(`https://ktane.timwi.de/HTML/${manualId}${v[0]}.html`).replace(/[)]/g, '%29') + ')'
        } else if (v[1] == 'pdf') {
            base = `[${inputmodule.Name}${v[0]} (${v[1].toUpperCase()})](` + encodeURI(`https://ktane.timwi.de/PDF/${manualId}${v[0]}.pdf`).replace(/[)]/g, '%29') + ')'
        }
        manuals.push(base)
    })
	
	let Updated = "No data"
	
	await axios.get(encodeURI(`https://ktane.timwi.de/ManualLastUpdated/${manualId}.html`)).then(async(resp) =>{
		let LastUpdatedDate = new Date(resp.data)
		Updated = `${LastUpdatedDate.getUTCFullYear()}-${LastUpdatedDate.getUTCMonth()+1}-${LastUpdatedDate.getUTCDate()}`
	}).catch()
	
    //making sure the manuals fit into the embed
    let thisvariableprobablyisntneededbutfuckit = false
    while (manuals.toString().length > 1000) {
        thisvariableprobablyisntneededbutfuckit = true
        manuals.pop()
    }
    if (thisvariableprobablyisntneededbutfuckit) {
        manuals.push('And more...')
    }

    message.channel.send(embed.getEmbed("Repo", {
        moduleName: `${subjectOverrides.get(inputmodule.Name) || `On the Subject of ${inputmodule.Name}`} ${inputmodule.TwitchPlays ? inputmodule.TwitchPlays.Score ? ` \u00B7 <:Twitch:702495822281048129> ${inputmodule.TwitchPlays.Score}` : '' : ''}${inputmodule.RuleSeedSupport === 'Supported' ? ' \u00B7 <:RuleSeed:702495784716992583>' : ''}${inputmodule.Souvenir ? inputmodule.Souvenir.Status == 'Supported' ? ' \u00B7 S' : '' : ''}${inputmodule.MysteryModule == undefined ? " \u00B7 MM" : ""}`,
        moduleDesc: `${inputmodule.Description.split('Tags')[0].trim()}`,
        diff: `Defuser: ${parseDifficulty(inputmodule.DefuserDifficulty)}\nExpert: ${parseDifficulty(inputmodule.ExpertDifficulty)}`,
        moduleID: inputmodule.ModuleID,
        symbol: inputmodule.Symbol == undefined ? "-" : inputmodule.Symbol,
        pDate: inputmodule.Published,
        uDate: Updated,
        manuals: manuals.join('\n'),
        links: links.join(' | '),
        creator: `${inputmodule.Type == 'Widget' ? 'Widget' : 'Module'} made by ${inputmodule.Author}`,
        moduleIcon: `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`,
        diffColor: getColor(inputmodule)
    }))
}

exports.mostSimilarModule = mostSimilarModule
