const { setSelections, questions, sendQuestion } = require('../utilsFaq')

module.exports.run = async (client, message, args) => {
    await setSelections(message.content, message, client);
}

module.exports.component = async (client, interaction, custom_id, channel, message) => {
    
    client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 6 } }).then(async (__) => {
        //get the question object
        const desiredObj = questions.find(q => q.commandId === interaction.data.values[0]); 

        //send the answer to the question
        await sendQuestion({ channel }, desiredObj);
        
        //reset the dropdown
        let datas = await setSelections(custom_id, message, client, false);
        let data = datas[0][0];
        let files = datas[0][1];
        await client.api.channels[channel.id].messages[message.id].patch({ data, files })
    })
}