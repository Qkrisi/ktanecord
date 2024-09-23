const { questions, setSelections, sendQuestion } = require('../utilsFaq.js')
const { MessageFlags } = require('../map.js')

module.exports.run = async (client, message, args) => {
    const categoryId = "misc";
    await setSelections(categoryId, message, client);
}

module.exports.component = async (client, interaction, custom_id, channel, message) => {
    const value = interaction.data.values[0];
    const msg = `You selected ${value}`;

    client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data: {content: msg, flags: MessageFlags.EPHEMERAL}}}).then(async(___) => {
        const desiredObj = questions.find(q => q.commandId === value);
		sendQuestion({channel}, desiredObj);
    })
}