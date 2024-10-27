const { embed } = require('../utils')
const { ktaneModules } = require('../main')
const { categories, setSelections, questions, sendQuestion } = require('../utilsFaq')

module.exports.run = async (client, message, args) => {
    await setSelections(message.content, message, client);
}

module.exports.component = async (client, interaction, custom_id, channel, message) => {
    const value = interaction.data.values[0];
    const m = client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 6, with_response: true}}).then(async(response) => {
        const desiredObj = questions.find(q => q.commandId === value);
		await sendQuestion({channel}, desiredObj);

        //todo reset the dropdown
    })
}