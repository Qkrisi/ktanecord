const { embed, getColor, getModule } = require('../utils.js')
const { aliases, manualOverride } = require('../map.js')
const fetch = require('wumpfetch')
const config = require('../../config.json')

const ScorePriority = {
	"Assigned Score": "Assigned",
	"Assigned Total boss points earned (adjust # of modules)": "Assigned boss points",
	"Community Score": "Community",
	"Community Boss Score": "Community boss points",
	"TP\nScore": "TP",
	"TP\nTotal boss points earned (adjust # of modules)": "TP boss points",
	"Resolved Score": "Score",
	"Total Resolved Points per Module Rounded": "Boss points"

}

const PPMPriority = [
	"Assigned per module",
	"Community Per Module",
	"Resolved Boss Points per Module"
]

function getPPM(body) {
	let str = ""
	PPMPriority.forEach(field => {
		if (!str && body[field] != undefined && body[field].toString().trim() != "") str = ` + ${body[field]} per module`
	});
	return str
}

function getMulitplier(m) {
	let splitted = m.split(":")
	let minutes = parseInt(splitted[0])
	let seconds = parseInt(splitted[1])
	let str = `${minutes}:${seconds.toString().length==1 ? 0 : ""}${seconds}`
	return str == "NaN:NaN" ? "" : str
}

function getScoreString(body, fields, names, useName = false) {
	let str = ""
	let c = 0
	fields.forEach(f => {
		if (f && body[f] && body[f].toString().trim() != "") str += (useName ? `${names[c]}:` : body[f]) + "\n"
		c += 1
	})
	return str
}

module.exports.run = async (client, message, args) => {
	if (args._.length == 0) return message.channel.send("🚫 You need to specify a module by entering its name, ID or periodic symbol, or by specifying a regular expression!");
	let inputmodule = getModule(message, args)
	if (!inputmodule) return
	await fetch({ url: encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/Score/${inputmodule.ModuleID}`), parse: 'json' }).send().then(async (res) => {
		let body = res.body
		if (body.error)
			return message.channel.send(body.error)
		if (body["Module Name"] != inputmodule.Name)
			return message.channel.send("Module is not on the scoring sheet!")
		let manualId = manualOverride.has(inputmodule.Name) ? manualOverride.get(inputmodule.Name) : inputmodule.Name
		let creator = `${inputmodule.Type == "Widget" ? "Widget" : "Module"} made by ${inputmodule.Author}`
		let thumbnail = `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`
		let tweaksScore = ""
		Object.keys(ScorePriority).forEach(field => {
			if (!tweaksScore && body[field] != undefined && body[field].toString().trim() != "") tweaksScore = body[field] + getPPM(body) + ` (${ScorePriority[field]})`
		})
		if (!tweaksScore) tweaksScore = `10${getPPM(body)} (Default)`
		let useCommunity = !tweaksScore.includes("Assigned");
		let time = getMulitplier(body["7.5"])
		let timeModeFields = "Score:\n" + getScoreString(body, [useCommunity ? "Community Score" : "", "Assigned Total boss points earned (adjust # of modules)"], ["Community", "Total points for 23 modules"], true) // +(time ? "Time gained at 7.5x multiplier:" : "")
		let timeModeValues = `${tweaksScore}\n` + getScoreString(body, [useCommunity ? "Community Score" : "", "Assigned Total boss points earned (adjust # of modules)"], ["Community", "Total points for 23 modules"]) // +(time ? time : "")
		let tpFields = getScoreString(body, ["TP\nScore", "TP\nBomb Reward"], ["Score", "Bomb reward"], true)
		let tpValues = getScoreString(body, ["TP\nScore", "TP\nBomb Reward"], ["Score", "Bomb reward"])
		let timeModeMobile = ""
		let counter = 0
		timeModeFields.split("\n").forEach(field => {
			timeModeMobile += field + " " + timeModeValues.split("\n")[counter] + "\n"
			counter += 1
		})
		let removeTP = !tpFields && !tpValues
		let tpMobile = ""
		counter = 0
		if (!removeTP) {
			tpFields.split("\n").forEach(field => {
				tpMobile += field + " " + tpValues.split("\n")[counter] + "\n"
				counter += 1
			})
		}
		let constructedBody = {
			ScoreTitle: `__${inputmodule.Name}__`,
			diffColor: getColor(inputmodule),
			tn: thumbnail,
			TimeModeFields: timeModeFields,
			TimeModeValues: timeModeValues,
			TPFields: tpFields,
			TPValues: tpValues,
			TimeModeFieldsMobile: timeModeMobile,
			TPFieldsMobile: tpMobile
		}
		let realBody = {}
		Object.keys(constructedBody).forEach(field => {
			if (constructedBody[field] != undefined && !["","-"].includes(constructedBody[field].toString().trim())) realBody[field] = constructedBody[field]
		})
		let emb = embed.getEmbed(args.mobile ? "ScoreMobile" : "Score", realBody)
		let remove = false
		emb.fields = emb.fields.filter(field => {
			if (remove || ["TPFields", "TPValues", "TPFieldsMobile"].includes(field.value)) {
				remove = true
				return false
			}
			return true
		})
		message.channel.send({ embeds: [emb] })
	})//.catch(error => message.channel.send(`An error occurred while fetching module scores: ${error}`))
}
