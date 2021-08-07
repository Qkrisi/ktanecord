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
			GeneralScore:body["Community Score"],
			Reason:body["MainReason"],
			PPMScore:body["Community Boss Score"],
		}
		if(!ConstructedBody.GeneralScore && !ConstructedBody.PPMScore) ConstructedBody.desc="*none*"
		Object.keys(ConstructedBody).forEach(key => {
			if(!ConstructedBody[key] || ConstructedBody[key].toString().trim()=="" || !ConstructedBody[key]) ConstructedBody[key]="."
		})
		let emb = embed.getEmbed("CommunityScore", ConstructedBody)
		emb.fields = emb.fields.filter(field => field.value!=".")
		message.channel.send({embeds: [emb]})
	})
}
