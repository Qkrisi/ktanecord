const { embed, getColor, GetModule } = require('../utils.js')
const { aliases, manualOverride } = require('../map.js')
const fetch = require('wumpfetch')
const config = require('../../config.json')

const ScorePriority = {
	"Assigned Score":"Assigned",
	"Assigned Total boss points earned (adjust # of modules)":"Assigned boss points",
	"Community Score":"Community",
	"Community Boss Score":"Community boss points",
	"TP\nScore":"TP",
	"TP\nTotal boss points earned (adjust # of modules)":"TP boss points",
	"Resolved Score":"Score",
	"Total Resolved Points per Module Rounded":"Boss points"
	
}

const PPMPriority = [
	"Assigned per module",
	"Community Per Module",
	"Resolved Boss Points per Module"
]

function GetPPM(body)
{
	let str = ""
	PPMPriority.forEach(field => {
		if(!str && body[field]!=undefined && body[field].toString().trim()!="") str = ` + ${body[field]} per module`
	});
	return str
}

function GetMultiplier(m)
{
	let splitted = m.split(":")
	let minutes = parseInt(splitted[0])
	let seconds = parseInt(splitted[1])
	let str = `${minutes}:${seconds.toString().length==1 ? 0 : ""}${seconds}`
	return str=="NaN:NaN" ? "" : str
}

function GetScoreString(body, fields, names, UseName = false)
{
	let str = ""
	let c = 0
	fields.forEach(f => {
		if(f && body[f] && body[f].toString().trim()!="") str += (UseName ? `${names[c]}:` : body[f])+"\n"
		c+=1
	})
	return str
}

module.exports.run = async (client, message, args) => {
	if (args._.length == 0) return message.channel.send("🚫 You need to specify a module by entering its name, ID or periodic symbol, or by specifying a regular expression!");
	let inputmodule = GetModule(message, args)
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
		let TweaksScore = ""
		Object.keys(ScorePriority).forEach(field => 
		{
			if(!TweaksScore && body[field]!=undefined && body[field].toString().trim()!="") TweaksScore = body[field]+GetPPM(body)+` (${ScorePriority[field]})`
		})
		if(!TweaksScore) TweaksScore = `10${GetPPM(body)} (Default)`
		let UseCommunity = !TweaksScore.includes("Assigned");
		let time = GetMultiplier(body["7.5"])
		let TimeModeFields = "Score:\n"+GetScoreString(body, [UseCommunity ? "Community Score" : "", "Assigned Total boss points earned (adjust # of modules)"], ["Community", "Total points for 23 modules"], true)//+(time ? "Time gained at 7.5x multiplier:" : "")
		let TimeModeValues = `${TweaksScore}\n`+GetScoreString(body, [UseCommunity ? "Community Score" : "", "Assigned Total boss points earned (adjust # of modules)"], ["Community", "Total points for 23 modules"])//+(time ? time : "")
		let TPFields = GetScoreString(body, ["TP\nScore", "TP\nBomb Reward"], ["Score", "Bomb reward"], true)
		let TPValues = GetScoreString(body, ["TP\nScore", "TP\nBomb Reward"], ["Score", "Bomb reward"])
		let TimeModeMobile = ""
		let counter = 0
		TimeModeFields.split("\n").forEach(field => {
			TimeModeMobile += field+" "+TimeModeValues.split("\n")[counter]+"\n"
			counter+=1
		})
		let RemoveTP = !TPFields && !TPValues
		let TPMobile = ""
		counter = 0
		if(!RemoveTP)
		{
			TPFields.split("\n").forEach(field => {
				TPMobile += field + " " + TPValues.split("\n")[counter] + "\n"
				counter+=1
			})
		}
		let ConstructedBody = {
			ScoreTitle: `__${inputmodule.Name}__`,
			diffColor: getColor(inputmodule),
			tn: thumbnail,
			TimeModeFields: TimeModeFields,
			TimeModeValues: TimeModeValues,
			TPFields: TPFields,
			TPValues: TPValues,
			TimeModeFieldsMobile: TimeModeMobile,
			TPFieldsMobile: TPMobile
		}
		let RealBody = {}
		Object.keys(ConstructedBody).forEach(field => {
			if(ConstructedBody[field]!=undefined && !["","-"].includes(ConstructedBody[field].toString().trim())) RealBody[field]=ConstructedBody[field]
		});
		let emb = embed.getEmbed(args.mobile ? "ScoreMobile" : "Score", RealBody)
		let Remove = false
		emb.fields = emb.fields.filter(field => {
			if(Remove || ["TPFields", "TPValues", "TPFieldsMobile"].includes(field.value))
			{
				Remove = true
				return false
			}
			return true
		})
		message.channel.send(emb)
	})//.catch(error => message.channel.send(`An error occurred while fetching module scores: ${error}`))
}
