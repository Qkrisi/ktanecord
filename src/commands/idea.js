const {embed, mostSimilarModule} = require("../utils.js")
const main = require("../main.js")

const IdeaState = [
	"inProgress",
	"notReady",
	"unknown",
	"isReady"
]

const StateData = {
	"inProgress":[0x00ff00,"<:inProgress:833597370214252544>"],
	"notReady":[0xff0000,"<:notReady:833597370172047380>"],
	"unknown":[0x777777,"<:unknown:833597370201669632>"],
	"isReady":[0xffff00,"<:isReady:833597369903218739>"]
}

function GetIdeaEmbed(idea){
	let data = StateData[idea.state]
	return embed.getEmbed("Idea", {
			name:`${data[1]} ${idea.name} (by ${idea.author})`,
			description:idea.description,
			note:idea.notes,
			url:idea.manualUrl,
			color:data[0]
	})
}

module.exports.run = (client, message, args) => {
	let states = []
	let keys = Object.keys(args)
	for(let i = 0;i<keys.length;i++)
		args[keys[i].toLowerCase()]=args[keys[i]]
	for(let i = 0;i<IdeaState.length;i++){
		if(args[IdeaState[i].toLowerCase()]) states.push(IdeaState[i])
	}
	if(states.length==0) states=IdeaState
	let IdeaName = args._.join(" ")
	let Ideas = IdeaName ? main.Ideas() : main.Ideas().filter(idea => states.includes(idea.state))
	if(Ideas.length==0) return message.channel.send("Couldn't find any ideas")
	let idea
	if(IdeaName){
		let NamedIdeas = {}
		for(let i = 0;i<Ideas.length;i++){
			NamedIdeas[Ideas[i].name]=Ideas[i]
		}
		let SimilarName = mostSimilarModule(IdeaName, NamedIdeas)
		if(SimilarName) idea=NamedIdeas[SimilarName]
		else return message.channel.send("Couldn't find an idea with the given name")
	}
	else idea = Ideas[Math.floor(Math.random()*(Ideas.length+1))]
	message.channel.send(GetIdeaEmbed(idea))
}

module.exports.GetIdeaEmbed = GetIdeaEmbed
