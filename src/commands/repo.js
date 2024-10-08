const { embed, parseDifficulty, getColor, months, GetModule } = require('../utils.js')
const main = require('../main.js')
const { aliases, subjectOverrides, manualOverride } = require('../map.js')
const config = require('../../config.json')
const axios = require('axios')

let cooldown = new Map()

function doNothing() { }

function getRandomModule() {
    let keys = Array.from(main.ktaneModules().keys())
    return main.ktaneModules().get(keys[Math.floor(Math.random() * keys.length)])
}

var Updated = "No data"

module.exports.run = async (client, message, args) => {
    if (args._.length == 0 && !args.random) return message.channel.send(`🚫 You need to specify a module by entering its name, ID or periodic symbol, or select a random one with \`${config.token}repo --random\``)

	let Enable_Cooldown = main.Enable_Cooldown

    // why the fuck is this here?
    if (Enable_Cooldown && cooldown.get(message.author.id) <=    Date.now())
        cooldown.delete(message.author.id)

    //defining the module
    let inputmodule
    if (args.random) {
        if (Enable_Cooldown && cooldown.has(message.author.id))
            return message.channel.send(`You are on cooldown for ${Math.round((cooldown.get(message.author.id) - Date.now()) / 1000)} seconds! You can still use the repo command with specified modules.`)
        inputmodule = getRandomModule()
        if (Enable_Cooldown && message.guild) {
            let Cooldown = main.getCooldown()
            cooldown.set(message.author.id, Date.now() + (Cooldown.hasOwnProperty(message.guild.id.toString()) ? Cooldown[message.guild.id.toString()] * 1000 : 45000))
        }
    }
    if (!inputmodule) inputmodule = GetModule(message, args)
    if (!inputmodule) return


    //adding the links of the module
    let links = []
    inputmodule.SteamID ? links.push(`[Workshop](http://steamcommunity.com/sharedfiles/filedetails/?id=${inputmodule.SteamID})`) : doNothing()
    inputmodule.SourceUrl ? links.push(`[Source code](${inputmodule.SourceUrl})`) : doNothing()
    if(inputmodule.TutorialVideos)
    {
        for(const video of inputmodule.TutorialVideos)
        {
            if(video.Language == "English")
            {
                links.push(`[Tutorial video](${video.Url})`)
                break
            }
        }
    }
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

    await axios.get(encodeURI(`https://ktane.timwi.de/ManualLastUpdated/${manualId}.html`)).then(async (resp) => {
        let LastUpdatedDate = new Date(resp.data)
        Updated = `${LastUpdatedDate.getUTCFullYear()}-${LastUpdatedDate.getUTCMonth() + 1}-${LastUpdatedDate.getUTCDate()}`
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

   message.channel.send({embeds: [embed.getEmbed("Repo", {
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
    })]})
}
