const { embed, getColor, GetModule } = require('../utils.js')
const {aliases, manualOverride} = require('../map.js')
const fetch = require('wumpfetch')
const config = require('../../config.json')

function GetMultiplier(m)
{
	let splitted = m.split(":")
	let minutes = parseInt(splitted[0])
	let seconds = parseInt(splitted[1])
	let AllSecs = minutes*60+seconds
	minutes = Math.floor((AllSecs-AllSecs%60)/60)
	let secs = AllSecs-minutes*60
	return `${minutes}**:**${secs >= 10 ? secs : `0${secs}`}`
}

module.exports.run = async(client, message, args) => {
	if(args._.length==0) return message.channel.send("🚫 You need to specify a module by entering its name, ID or periodic symbol, or by specifying a regular expression!");
	let inputmodule = GetModule(message, args)
	if(!inputmodule) return
	await fetch({url: encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/Score/${inputmodule.ModuleID}`), parse:'json'}).send().then(async(res) => {
		let body = res.body
		if(body.error) return message.channel.send(body.error)
		let manualId = manualOverride.has(inputmodule.Name) ? manualOverride.get(inputmodule.Name) : inputmodule.Name
		let creator = `${inputmodule.Type == "Widget" ? "Widget" : "Module"} made by ${inputmodule.Author}`
		let thumbnail = `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`
		if(body["Assigned Score"].toString().trim()=="" && body["TP\nScore"].toString().trim()=="") return message.channel.send(embed.getEmbed("ScoreEmpty", {
			ScoreTitle: `Scores of ${inputmodule.Name}`,
			diffColor: getColor(inputmodule),
			creator: creator,
			tn: thumbnail
		}))
		let ConstructedBody = {
			ScoreTitle: `Scores of ${inputmodule.Name}`,
			creator: creator,
			diffColor: getColor(inputmodule),
			tn: thumbnail,
			GeneralScore: body["Assigned Score"] ? body["Assigned Score"] : "None",
			BossPointsPerModule: body["Assigned per module"],
			TPScore: body["TP\nScore"],
			TPBombReward: body["TP\nBomb Reward"],
			ResolvedScore: body["Resolved Score\n"],
			ResolvedBossPointsPerModule: body["Resolved Boss Points per Module"],
			SFMultiplier: GetMultiplier(body["7.5"]),
			TotalBossPoints:body["Assigned Total boss points earned (adjust # of modules)"],
		}
		Object.keys(ConstructedBody).forEach(key => {
			if(!ConstructedBody[key] || ConstructedBody[key].toString().trim()=="" || !ConstructedBody[key]) ConstructedBody[key]="-"
		})
		let emb = embed.getEmbed("Score", ConstructedBody)
		emb.fields = emb.fields.filter(field => field.value!="-")
		message.channel.send(emb)
	})//.catch(error => message.channel.send(`An error occurred while fetching module scores: ${error}`))
}
