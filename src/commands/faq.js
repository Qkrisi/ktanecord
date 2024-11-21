const { setSelections, questions, categories, sendQuestion } = require('../utilsFaq')

module.exports.run = async (client, message, args) => {
    if(args._.length == 0)
        return

    const categoryId = args._[0];
    const validArgs = categories.map(c => c.id);
    if(!validArgs.includes(categoryId))  {
        message.channel.send(`Error: "${categoryId}" is an invalid category id. The valid list of categories are **${validArgs.join(", ")}**`)
        return;
    }
    await setSelections(categoryId, message, client);
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