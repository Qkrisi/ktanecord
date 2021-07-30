const { embed, mostSimilarModule } = require("../utils.js")
const main = require('../main.js')

const emojis = {
	"Twitch": "<:Twitch:702495822281048129>",
	"GitHub": "<:GitHub:821728071207485470>",
	"Reddit": "<:Reddit:821729004100911104>",
	"Steam": "<:Steam:821729400021712946>",
	"Discord": "<:Discord:821731910866436116>",
	"YouTube": "<:YouTube:821733572598562836>",
	"Twitter": "<:Twitter:821732818865618975>",
	"Email": ":e_mail:",
	"Website": ":earth_africa:"
}

const platformURLs = {
	"Twitch": "https://twitch.tv/",
	"GitHub": "https://github.com/",
	"Reddit": "https://reddit.com/",
	"Steam": "https://steamcommunity.com/",
	"YouTube": "https://youtube.com/",
	"Twitter": "https://twitter.com/",
	"Website": "https://"
}

const platformAlias = {
	"Github": "GitHub"
}

module.exports.run = async(client, message, args) => {
	let contacts = main.creatorContacts()
	let creatorName = args._.join(" ")
	if (!creatorName) return message.channel.send("Please specify a creator!")
	let creator = contacts[creatorName]
	if (!creator) {
		let similar = mostSimilarModule(creatorName, contacts)
		creator = contacts[similar]
	}
	if (!creator) return message.channel.send("Couldn't find creator!")

	let contactInfo = {}
	Object.keys(creator).forEach(platform => {
		if (platform != "CreatorName")
			contactInfo[platformAlias[platform] ? platformAlias[platform] : platform] = creator[platform]
	})
	let HandlePlatforms = () => {
		let ConstructedBody = { Title: `Contact information of ${creator.CreatorName}`, Contacts: "" }
		Object.keys(contactInfo).forEach(platform => {
			let MainPlatform = platformURLs[platform ] ? `[${platform}](${platformURLs[platform]}${contactInfo[platform]})` : contactInfo[platform]
			ConstructedBody.Contacts += `${emojis[platform] ? emojis[platform] : platform+":"} ${MainPlatform}\n`
		})
		return ConstructedBody
	}
	let msg = await message.channel.send(embed.getEmbed("ContactInfo", HandlePlatforms()))
	if (contactInfo.Discord && message.guild) {
		let complete = false
		let edit = false
		message.guild.members.fetch().then(members => {
			members.array().forEach(member => {
				if (!complete && member.user.tag==contactInfo.Discord) {
					complete = true
					edit = true
					contactInfo.Discord=`<@${member.id}>`
					console.log(contactInfo.Discord)
				}
				else if (edit) {
					edit = false
					msg.edit(embed.getEmbed("ContactInfo", HandlePlatforms()))
				}
			})
		})
	}
}
