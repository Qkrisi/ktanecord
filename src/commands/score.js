const { embed, getColor } = require('../utils.js')
const {mostSimilarModule} = require('./repo.js')
const {ktaneModules} = require("../main.js")
const {aliases} = require('../map.js')
const fetch = require('wumpfetch')
const config = require('../../config.json')

function GetMultiplier(m, mu)
{
	let splitted = m.split(":")
	let minutes = parseInt(splitted[0])
	let seconds = parseInt(splitted[1])
	let secs = minutes*60+seconds
	secs/=6
	let tempMinutes = Math.floor(secs/60)
	secs-=tempMinutes*60
	tempMinutes*=mu
	secs = Math.round(secs) * mu
	tempMinutes = Math.floor(secs/60)
	secs = Math.round(secs%60)
	return `${tempMinutes}**:**${secs}`
}

module.exports.run = async(client, message, args) => {
	let inputmodule = ktaneModules.get(aliases.get(args._[0].toString().toLowerCase()))
    if (!inputmodule) inputmodule = ktaneModules.get(args._.join(' ').toLowerCase())
    if (!inputmodule) inputmodule = ktaneModules.get(args._[0])
    if (!inputmodule) inputmodule = ktaneModules.get(mostSimilarModule(args._.join(' ').toLowerCase()))
    if (!inputmodule) return message.channel.send(`🚫 Couldn't find a module by the ID of \`${args._[0]}\` (case-sensitive), name of \`${args._.join(' ')}\` (not case-sensitive) or periodic symbol of \`${args._[0]}\` (not case-sensitive)`)
	await fetch({url: encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/Score/${inputmodule.Name}`), parse:'json'}).send().then(async(res) => {
		let body = res.body
		if(body.error) return message.channel.send(body.error)
		if(body.Score.toString().trim()=="" && body["TP\nScore"].toString().trim()=="") return message.channel.send(embed.getEmbed("ScoreEmpty", {
			ScoreTitle: `Scores of ${inputmodule.Name}`,
			diffColor: getColor(inputmodule)
		}))
		let ConstructedBody = {
			ScoreTitle: `Scores of ${inputmodule.Name}`,
			diffColor: getColor(inputmodule),
			GeneralScore: body.Score,
			BossPointsPerModule: body["Boss Module Points per Module"],
			ScoreWithCheatsheet: body["Score With Cheatsheet"],
			TPScore: body["TP\nScore"],
			TPBombReward: body["TP\nBomb Reward"],
			ResolvedScore: body["Resolved Score\n"],
			ResolvedBossPointsPerModule: body["Resolved Boss Points per Module"],
			SFMultiplier: GetMultiplier(body["Time gained upon solve when multiplier is at:"], 7.5),
			TotalBossPoints:body["Total boss points earned (adjust # of modules)"],
		}
		Object.keys(ConstructedBody).forEach(key => {
			if(ConstructedBody[key].toString().trim()=="" || !ConstructedBody[key]) ConstructedBody[key]="-"
		})
		let emb = embed.getEmbed("Score", ConstructedBody)
		emb.fields = emb.fields.filter(field => field.value!="-")
		message.channel.send(emb)
	}).catch(error => message.channel.send(`An error occurred while fetching module scores: ${error}`))
}
