const { embed } = require('../utils')

module.exports.run = async(client, message, _args) => {
    await message.channel.send(embed.getEmbed("Ping", { pingV: `${Math.round(client.ping)} ms` }))
}
