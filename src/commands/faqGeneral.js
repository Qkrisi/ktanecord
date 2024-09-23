const { questions, setSelections, sendQuestion } = require('../utilsFaq')
const { MessageFlags } = require('../map.js')

let datas; 
const categoryId = "general";

module.exports.run = async (client, message, args) => {
    datas = await setSelections(categoryId, message, client);
    console.log(datas);
}

module.exports.component = async (client, interaction, custom_id, channel, message) => {
    const value = interaction.data.values[0];
    const msg = `You selected ${value}`;

    client.api.interactions(interaction.id, interaction.token).callback.post({data: {type: 4, data: {content: msg, flags: MessageFlags.EPHEMERAL}}}).then(async(___) => {
        const desiredObj = questions.find(q => q.commandId === value);
		sendQuestion({channel}, desiredObj);
        datas = await setSelections(categoryId, message, client, false);
        console.log(datas);
        let d = datas[parseInt(custom_id.split("_")[2])-1]
        let data = d[0]
        let files = d[1]
        await client.api.channels[channel.id].messages[message.id].patch({data, files})		//Reset dropdown
        //await client.api.channels[channel.id].messages[message.id].patch({data, files})	
    })
}