const contact = require("../commands/contact.js")
const { embed } = require("../utils.js")
const { MessageFlags } = require("../map.js")

module.exports.onMessage = async(client, message, send) => {
	let fakemsg = { guild: message.guild, app: true, channel: {send: response => send(response, MessageFlags.EPHEMERAL)} }
	if(message.author.id == client.user.id)
	{
		if(!message.embeds || !message.embeds[0].footer)
			return send("Invalid module", MessageFlags.EPHEMERAL)
		let match = message.embeds[0].footer.text.match(/^Module made by (.*?)(;(.*?))?$/)
		if(!match)
			return send("Invalid module", MessageFlags.EPHEMERAL)
		embeds = []
		let HandleResponse = (user, response) => {
			if(!response.embeds)
				embeds.push(embed.getEmbed("ContactInfo", {Title: `No contact info found for ${user}`, Contacts: "⠀​"}))
			else embeds = embeds.concat(response.embeds)
		}
		for(const user of match[1].split(", "))
		{
			fakemsg.channel.send = async(response) => HandleResponse(user, response)
			await contact.run(client, fakemsg, {_: user.split(" ")})
		}
		return send({embeds: embeds}, MessageFlags.EPHEMERAL)
	}
	contact.run(client, fakemsg, {_: message.author.tag.split(" ")}, true)
}

module.exports.onUser = async(client, user, guild, send) => {
	contact.run(client, {guild: guild, app: true, channel: {send: response => send(response, MessageFlags.EPHEMERAL)}}, {_: user.tag.split(" ")}, true)
}
