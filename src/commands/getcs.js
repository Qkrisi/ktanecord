const {embed, getColor, GetModule} = require('../utils.js')
const {manualOverride} = require('../map.js')
const fetch = require('wumpfetch')
const config = require('../../config.json')

module.exports.run = async (client, message, args) => {
	if (args._.length == 0) return message.channel.send("🚫 You need to specify a module by entering its name, ID or periodic symbol, or by specifying a regular expression!");
	let inputmodule = GetModule(message, args)
	if (!inputmodule) return
	await fetch({ url: encodeURI(`http://${config.tpServerIP}:${config.tpServerPort}/GetCommunity/${inputmodule.ModuleID}`), parse: 'json' }).send().then(async(res) => {
		let body = res.body
		let manualId = manualOverride.has(inputmodule.Name) ? manualOverride.get(inputmodule.Name) : inputmodule.Name
		let thumbnail = `https://raw.githubusercontent.com/Timwi/KtaneContent/master/Icons/${manualId}.png`
		let ConstructedBody = {
			ScoreTitle:`__Community scores of ${inputmodule.Name}__`,
			diffColor:getColor(inputmodule),
			tn:thumbnail,
			MainScore:body["Community Score"],
			MainReason:body["MainReason"],
			ppm:body["Community Boss Score"],
			totalbp:body["Community Per Module"],
			BossReason:body["BossReason"],
			MainTitle: "Score",
			BossTitle: "Points Per Module"
		}
		if(!ConstructedBody.MainScore)
		{
			ConstructedBody.MainTitle = "*none*"
			ConstructedBody.MainScore = " ​"
		}
		if(!ConstructedBody.ppm && !ConstructedBody.totalbp)
		{
			ConstructedBody.BossTitle = "*none*"
			ConstructedBody.ppm = " ​"
		}
		Object.keys(ConstructedBody).forEach(key => {
			console.log(key);
			console.log(!ConstructedBody[key] || ConstructedBody[key].toString().trim()=="" || !ConstructedBody[key]);
			if(!ConstructedBody[key] || ConstructedBody[key].toString().trim()=="" || !ConstructedBody[key]) ConstructedBody[key]="."
		})
		let emb = embed.getEmbed("CommunityScore", ConstructedBody)
		emb.fields = emb.fields.filter(field => field.value!=".")
		message.channel.send(emb)
	})
}
