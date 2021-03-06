const { embed, mostSimilarModule } = require("../utils.js")
const main = require('../main.js')

const Emojis = {
	"Twitch":"<:Twitch:702495822281048129>",
	"GitHub":"<:GitHub:821728071207485470>",
	"Reddit":"<:Reddit:821729004100911104>",
	"Steam":"<:Steam:821729400021712946>",
	"Discord":"<:Discord:821731910866436116>",
	"YouTube":"<:YouTube:821733572598562836>",
	"Twitter":"<:Twitter:821732818865618975>",
	"Email":":e_mail:"
}

const PlatformURLs = {
	"Twitch":"https://twitch.tv/",
	"GitHub":"https://github.com/",
	"Reddit":"https://reddit.com/",
	"Steam":"https://steamcommunity.com/",
	"YouTube":"https://youtube.com/",
	"Twitter":"https://twitter.com/",
}

const PlatformAlias = {
		"Github":"GitHub"
}

module.exports.run = async(client, message, args) => {
	let Contacts = main.CreatorContacts()
	let CreatorName = args._.join(" ")
	if(!CreatorName) return message.channel.send("Please specify a creator!")
	let Creator = Contacts[CreatorName]
	if(!Creator)
	{
		let similar = mostSimilarModule(CreatorName, Contacts)
		Creator = Contacts[similar]
	}
	if(!Creator) return message.channel.send("Couldn't find creator!")
	
	let ContactInfo = {}
	Object.keys(Creator).forEach(platform => {
			if(platform!="CreatorName")
				ContactInfo[PlatformAlias[platform] ? PlatformAlias[platform] : platform]=Creator[platform]
	})
	let HandlePlatforms = () => {
		let ConstructedBody = {Title:`Contact information of ${Creator.CreatorName}`, Contacts:""}
		Object.keys(ContactInfo).forEach(platform => {
				let MainPlatform = PlatformURLs[platform ] ? `[${platform}](${PlatformURLs[platform]}${ContactInfo[platform]})` : ContactInfo[platform]
				ConstructedBody.Contacts+=`${Emojis[platform] ? Emojis[platform] : platform+":"} ${MainPlatform}\n`
				
		})
		return ConstructedBody
	}
	let msg = await message.channel.send(embed.getEmbed("ContactInfo", HandlePlatforms()))
	if(ContactInfo.Discord && message.guild){
		let Complete = false
		let Edit = false
		message.guild.members.fetch().then(members => {
			members.array().forEach(member => {
				if(!Complete && member.user.tag==ContactInfo.Discord){
					Complete = true
					Edit = true
					ContactInfo.Discord=`<@${member.id}>`
					console.log(ContactInfo.Discord)
				}
				else if(Edit){
					Edit = false	
					msg.edit(embed.getEmbed("ContactInfo", HandlePlatforms()))
				}
			})
		})
	}
}
