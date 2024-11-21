const { questions, categories } = require('../questions.js')
const { CreateAPIMessage } = require('../utils.js');

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

//what to replace placeholder information with
const placeholderInfo = {
    modCreationId: "201105291830493193",
    repoDiscussionId: "640557658482540564",
    repoRequestsId: "612414629179817985",
    logBotId: "317798455110139916",
	lfaSupportThread: "1018575584009400350",
	logFileAnalyzerDataJsLink: "[Logfile Analyzer Data.js](<https://github.com/Timwi/KtaneContent/blob/master/More/Logfile%20Analyzer%20Data.js>)",
    ktaneContentRepositoryLink: "[Ktane Content repository](<https://github.com/Timwi/KtaneContent>)",
    manualRepositoryLink: "[Repository of Manual Pages](<https://ktane.timwi.de>)",
    maintainerResponsibilities: "[Repo Maintainer Responsibilities](<https://docs.google.com/document/d/10rabFJES6avb8ime3Cw5LCd9p0663PbqVqzUrfehYac/edit?usp=sharing>)",
	logFileAnalyzerLink: "[Logfile Analyzer](<https://ktane.timwi.de/More/Logfile%20Analyzer.html>)"
}

/**
 * Replace placeholders text with their actual data
 * @param {string} text The original text
 * @param {string} name The user name of the user
 * @returns {string} The new text without the placeholders
 */
const replacePlaceholders = (text) => {
    text = text
    //replace channel ids
		.replaceAll("{modCreationId}", placeholderInfo.modCreationId)
		.replaceAll("{repoDiscussionId}", placeholderInfo.repoDiscussionId)
		.replaceAll("{repoRequestsId}", placeholderInfo.repoRequestsId)
		.replaceAll("{lfaSupportThread}", placeholderInfo.lfaSupportThread)
    //replace links
		.replaceAll("{logFileAnalyzerDataJsLink}", placeholderInfo.logFileAnalyzerDataJsLink)
		.replaceAll("{ktaneContentRepositoryLink}", placeholderInfo.ktaneContentRepositoryLink)
		.replaceAll("{manualRepositoryLink}", placeholderInfo.manualRepositoryLink)
		.replaceAll("{maintainerResponsibilities}", placeholderInfo.maintainerResponsibilities)
		.replaceAll("{logFileAnalyzerLink}", placeholderInfo.logFileAnalyzerLink)
    //ping roles/people
    	.replaceAll("{logBotId}", placeholderInfo.logBotId);

    
    //get rid of the any command ids with their actual name
    const commandObjects = questions.map(q => {return {id: q.commandId, name: q.commandName, question: q.question, categoryId: q.categoryId}});
    const categoryObject = categories.map(q => {return {id: q.id, name: q.name}});
    for(const obj of commandObjects) {
		const questionMax = 30;
		const shortQuestion = truncateText(obj.question, questionMax);
        text = text.replaceAll(`{${obj.id}}`, `**'${shortQuestion}' command** in **${categoryObject.find(c => c.id === obj.categoryId).name}** category`);
    }

    for(const obj of categoryObject) {
        text = text.replaceAll(`{${obj.id}}`, `**${obj.name}** commands`);
    }

    return text;
}

/**
 * Get a shorter version of some text. If text is cut off, the last three characters will be '...'
 * @param {string} text The original text
 * @param {number} maxCharacters The max amount of characters allowed
 * @returns {string} the shorter text
 */
const truncateText = (text, maxCharacters) => {
	let newText = text.substring(0, maxCharacters - 4);
	if(newText.length !== text.length) {
		newText += '...'
	}
	return newText;
}

/**
 * Sends the answer of a specific question
 * @param interaction The interaction object
 * @param commandId The id of the question that is being asked
 */
async function sendQuestion(interaction, desiredObj) {

    //break the answer into different messages
    const answers = replacePlaceholders(desiredObj.answer).split('{breakMessage}');
    for(let i = 0; i < answers.length; i++) {
        if(i === 0) {
            await interaction.channel.send(`## ${desiredObj.question}\n${answers[i]}`);
        } 
        else {
            await interaction.channel.send(answers[i]);
        }

        if(desiredObj.images) {
            const files = desiredObj.images.filter(img => img.index === i).map(obj => `src/img/${obj.name}`);
            if(files.length > 0) {
                await interaction.channel.send({files: files});
            }
        }
    }
}

/**
 * Creates string selection object(s) with the values being the question(s) within a certain category. The same as GetMessages in tp.js
 * @param categoryId the id of the category of questions
 * @param message
 * @param client
 * @param SendMessages if the the string selection(s) will be sent
 * @returns the string selection(s)
 */
async function setSelections(categoryId, message, client, SendMessages = true) {
    const maxQuestions = 25;
    let messages = [];
    let rows = [];
    let datas = [];
    let modules = [];

	const targetedQuestions = questions.filter(q => q.categoryId === categoryId);
	const categoryObj = categories.find(c => c.id === categoryId);
    for (const q of targetedQuestions) {
        modules.push({ "label": truncateText(q.question, 100), "custom_id": q.commandId, "value": q.commandId, description: "" })
    }
    while (modules.length > 0)
        rows.push(modules.splice(0, maxQuestions))
    while (rows.length > 0)
        messages.push(rows.splice(0, maxQuestions))

    let i = 0
    let row_i = 0
    for (const msg of messages) {
        const { data, files, send } = await CreateAPIMessage(message.channel, client, ++i == 1 ? `Here are the questions under the **${categoryObj.name}** category` : "⠀")
		data.components = []
        for (const row of msg) {
            let action_row = { "type": 1, "components": [{ "type": 3, "custom_id": `faq ${categoryId} ${row_i++}_${i}`, "options": [], "placeholder": "Choose a question"}] }
            for (const module of row)
                action_row.components[0].options.push(module)
            data.components.push(action_row)
        }
        datas.push([data, files, send])
        if(SendMessages)
		{
			if(!message.slash) {
				await send(data, msg => {})
			}

			else {
				await message.channel.send(data)
			}
		}
    }

	return datas
}