const { embed } = require('../utils')
const { ktaneModules } = require('../main')

module.exports.run = (client, message, args) => {
    message.channel.send({embeds: [embed.getEmbed("Ping", { pingV: `${Math.round(client.ws.ping)} ms` })]})
}
