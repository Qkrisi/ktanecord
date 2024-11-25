const { embed, GetMission, GetModule, FakeArg, difficulties, getColor } = require("../utils.js")
const main = require("../main.js")
const config = require('../../config.json')
const FormData = require("form-data")
const axios = require("axios")
const difficulties2 = [
	"Trivial",
	"Very Easy",
	"Easy",
	"Medium",
	"Hard",
	"Very Hard",
	"Extreme"
]

function formatTime(time)
{
	let hours = Math.floor(time/3600).toString()
	let minutes = Math.floor((time%3600)/60).toString()
	if(minutes.length == 1)
		minutes = "0" + minutes
	let seconds = Math.floor(time%60).toString()
	if(seconds.length == 1)
		seconds = "0" + seconds
	return `${hours}:${minutes}:${seconds}`
}

async function getMissionEmbed(message, args, lookup = false)
{
	if(args._.length == 0 && Object.keys(args).length < 2 && !args.random)
	{
		if(!lookup)
			message.channel.send(`🚫 You need to specify a mission by entering its name or ID, or select a random one with \`${config.token}mission --random\``)
		return null
	}
	
	let mission
	if(args.random)
	{
		let keys = Array.from(main.missions().keys())
		mission = main.missions().get(keys[Math.floor(Math.random() * keys.length)])
	}
	if(!mission)
	{
		if(args._.length == 0)
		{
			for(const key of Object.keys(args))
			{
				if(key == "_")
					continue
				args._.push(`${key}=${args[key]}`)
			}
		}
		mission = GetMission(message, args, !lookup)
	}
	if(!mission)
		return
	
	missionpack = main.missionPacks().get(mission.missionpack.toLowerCase())
	
	let form = new FormData();
	form.append("itemcount", 1)
	form.append("publishedfileids[0]", missionpack.steamID)
	let thumbnail = ""
	await axios({method: "POST", url: "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1", data: form, headers: { "Content-Type": "multipart/form-data" }})
		.then(async(resp) => thumbnail = resp.data.response.publishedfiledetails[0].preview_url).catch(console.error)
	
	let title = mission.name
	if(mission.designedForTP)
		title = "<:Twitch:702495822281048129> " + title
	let solves = []
	if(mission.teamSolve)
		solves.push("T")
	if(mission.efmSolve)
		solves.push("E")
	if(mission.tpSolve)
		solves.push("TP")
	if(mission.soloSolve)
		solves.push("S")
	if(solves.length > 0)
		title += " \u00B7 " + solves.join(",")
	let topCompletion = mission.topCompletion
	let topValue = "**-**"
	if(topCompletion)
		topValue = `[[${formatTime(topCompletion.time)}] ${topCompletion.solo ? "(S) " : ""}${topCompletion.team.join(', ')}](${topCompletion.proofs[0]})`
	let bombs = {}

	let avg = 0
	let missionAvgDef = 0
	let missionAvgExp = 0
	let bombCount = 0
	for(const bomb of mission.bombs)
	{
		let b = `[${formatTime(bomb.time)}] ${bomb.modules} **/** ${bomb.widgets} **/** ${bomb.strikes}`
		if(b in bombs)
		{
			bombs[b]++
		}
		else bombs[b]=1
		let poolCount = 0
		let bombAvgDef = 0
		let bombAvgExp = 0
		for(const pool of bomb.pools)
		{
			let avgDef = 0
			let avgExp = 0
			let length = 0
			for(const module of pool.modules)
			{
				if(["ALL_SOLVABLE","ALL_NEEDY","ALL_VANILLA","ALL_MODS","ALL_VANILLA_NEEDY","ALL_MODS_NEEDY","ALL_VANILLA_SOLVABLE","ALL_MODS_SOLVABLE"].includes(module.toUpperCase()))
					continue
				let inputmodule = GetModule(message, new FakeArg(module), false)
				if(!inputmodule)
					continue
				let defNum = difficulties.get(inputmodule.DefuserDifficulty)
				let expNum = difficulties.get(inputmodule.ExpertDifficulty)
				avgDef += defNum ?? 0
				avgExp += expNum ?? 0
				length++
			}
			if(!length)
				continue
			avgDef /= length
			avgExp /= length
			bombAvgDef += avgDef
			bombAvgExp += avgExp
			poolCount++
		}
		if(!poolCount)
			continue
		bombAvgDef /= poolCount
		bombAvgExp /= poolCount
		missionAvgDef += bombAvgDef
		missionAvgExp += bombAvgExp
		bombCount++
	}
	let avgDefStr
	let avgExpStr
	if(bombCount) {
		missionAvgDef = Math.round(missionAvgDef / bombCount)
		missionAvgExp = Math.round(missionAvgExp / bombCount)
		avgDefStr = difficulties2[missionAvgDef]
		avgExpStr = difficulties2[missionAvgExp]
	}
	else
	{
		avgDefStr = "No data"
		avgExpStr = "No data"
	}

	return embed.getEmbed("Mission", {
		missionName: title,
		cbsURL: "https://bombs.samfun.dev/mission/" + mission.name,
		packImg: thumbnail,
		diffColor: avgDefStr == "No data" || avgExpStr == "No data" ? "0xBC421E" : getColor({ DefuserDifficulty: avgDefStr.replace(' ', ''), ExpertDifficulty: avgExpStr.replace(' ', '') }).toString(16),
		creator: `Mission by ${mission.authors.join(", ")}`,
		mpack: `[${missionpack.name}](https://steamcommunity.com/sharedfiles/filedetails/?id=${missionpack.steamID})`,
		rdate: mission.dateAdded.substring(0, 10).replace(/-/g, '.'),
		bombs: Object.keys(bombs).map(b => `${b} (x${bombs[b]})`).join("\n"),
		top: topValue,
		avgDef: avgDefStr,
		avgExp: avgExpStr
	})
}

module.exports.run = async(client, message, args) => {
	let missionEmbed = await getMissionEmbed(message, args)
	if(!missionEmbed)
		return
	return message.channel.send({embeds: [missionEmbed]})
}

module.exports.getMissionEmbed = getMissionEmbed
