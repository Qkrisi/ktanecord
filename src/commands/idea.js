const { embed, mostSimilarModule } = require("../utils.js")
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

function getIdeaEmbed(idea){
	let data = StateData[idea.state]
	return embed.getEmbed("Idea", {
			name: `${data[1]} ${idea.name} (by ${idea.author})`,
			description: idea.description,
			note: idea.notes,
			url: idea.manualUrl,
			color: data[0]
	})
}

module.exports.run = (client, message, args) => {
	let states = []
	let keys = Object.keys(args)
	for (let i = 0; i<keys.length; i++)
		args[keys[i].toLowerCase()] = args[keys[i]]
	for (let i = 0; i<IdeaState.length; i++){
		if (args[IdeaState[i].toLowerCase()]) states.push(IdeaState[i])
	}
	if (states.length==0) states=IdeaState
	let ideaName = args._.join(" ")
	let ideas = ideaName ? main.ideas() : main.ideas().filter(idea => states.includes(idea.state))
	if (ideas.length==0) return message.channel.send("Couldn't find any ideas")
	let idea
	if (ideaName) {
		let namedIdeas = {}
		for (let i = 0; i<ideas.length; i++) {
			namedIdeas[ideas[i].name] = ideas[i]
		}
		let similarName = mostSimilarModule(ideaName, namedIdeas)
		if (similarName) idea=namedIdeas[similarName]
		else return message.channel.send("Couldn't find an idea with the given name")
	}
	else idea = ideas[Math.floor(Math.random()*(ideas.length+1))]
	message.channel.send(getIdeaEmbed(idea))
}

module.exports.getIdeaEmbed = getIdeaEmbed
