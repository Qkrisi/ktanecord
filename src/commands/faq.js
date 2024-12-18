const { questions, categories } = require('../questions.js')
const { CreateAPIMessage } = require('../utils.js');
const { Bot } = require('../main.js');

const disabledServers = ['702194117030969344'];
const whiteListedChannels = [{serverId: '702194117030969344', allowedChannels: ['702506351305293956']}]

module.exports.run = async (client, message, args) => {
    const validator = validateCommand(message);
    if(validator)
    {
        message.channel.send(validator);
        return;
    }

    const validArgs = categories.map(c => c.id);
    if(args._.length == 0) {
        message.channel.send(`Error: no category id argument was given. The valid list of categories are **${validArgs.join(", ")}**`)
        return;
    }


    const categoryId = args._[0].toLowerCase();
    
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
	logFileAnalyzerLink: "[Logfile Analyzer](<https://ktane.timwi.de/More/Logfile%20Analyzer.html>)",
    contributorTutorial: "[repo contributor video tutorial](<https://youtu.be/2Lxl7OAafIg>)"
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
		.replaceAll("{contributor-tutorial}", placeholderInfo.contributorTutorial)
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
 * Checks if the server and channel allows faq commands
 * @param interaction The interaction object
 * @returns {number|undefined} A string as to why the faq command can't be ran. Undefined if it can be ran
 */
function validateCommand(interaction)
{
    console.log(interaction);
    const guild = interaction.channel.guild ?? interaction.guild;
    const guildId = guild.id;

    //if this command is being send in a "disabled" server and this is
    //not one of the whitelisted channels, send an error message 
    if(disabledServers.includes(guildId))
    {
        const validChannel = whiteListedChannels.find(obj => obj.serverId == guildId);
        if(validChannel)
        {
            
            const channelString = validChannel.allowedChannels.map(id => `https://discordapp.com/channels/${guildId}/${id}`).join(', ');
            return `The bot is disabled from running faq commands in this channel. This is only allowed in the following channels: ${channelString}`;
        }
        else
        {
            return 'The bot is disabled from running faq commands in this server';
        }
    }
}

/**
 * Sends the answer of a specific question
 * @param interaction The interaction object
 * @param commandId The id of the question that is being asked
 */
async function sendQuestion(interaction, desiredObj) {
    let client = await Bot();
    const channel = interaction.channel;

    const validator = validateCommand(interaction);

    if(validator)
    {
        channel.send(validator);
        return;
    }

    //how many messages that need to past in order to send a new link
    //?Note: maybe these could be configs
    const messageLimit = 10;
    const messageFluff = 20;

    //break the answer into different messages
    const answers = replacePlaceholders(desiredObj.answer).split('{breakMessage}');

    //the number of messages that will be sent to answer this question
    const answerCount = getAnswerCount(answers, desiredObj.images); 

    //get the last (messageLimit + answerCount + messageFluff) messages to see if the player has asked this question before 
    //adding messageFluff to make sure we don't track deleted messages and interaction events
    let messages = await channel.messages.fetch({ limit: messageLimit + answerCount + messageFluff  });
    let newMessages = messages.filter(m => m.content && !m.deleted && m.author.id == client.user.id);

    //check if the questions has been asked before
    let duplicateAnswer = newMessages.find(m => m.content.includes(`## ${desiredObj.question}`))

    //if it has link to the answer
    if(duplicateAnswer)
    {
        await channel.send(`**${desiredObj.question}** has been answered here: https://discordapp.com/channels/${duplicateAnswer.guildId}/${duplicateAnswer.channelId}/${duplicateAnswer.id}`)
    }

    //Otherwise send the answer 
    else
    {
        for(let i = 0; i < answers.length; i++) {
            if(i === 0) {
                await channel.send(`## ${desiredObj.question}\n${answers[i]}`);
            } 
            else {
                await channel.send(answers[i]);
            }
    
            if(desiredObj.images) {
                const files = desiredObj.images.filter(img => img.index === i).map(obj => `src/img/${obj.name}`);
                if(files.length > 0) {
                    await channel.send({files: files});
                }
            }
        }
    }
}

/**
 * Says how many messages will be sent to say the entire answer
 * @param {string[]} answers An array of the answer. Each element will be its own message
 * @param {{index: number, name:string}[]} images All of the image that will be sent in the answer.
 * @returns {number} The number of total messages that will be sent to say this answer
 */
function getAnswerCount(answers, images)
{
    //get the images that will be sent in separate files (if they exist)
    if(!images)
        return answers.length;
    const indices = [];
    for(const img of images) {
        if(!indices.includes(img.index)) {
            indices.push(img.index);
        }
    }

    return answers.length + indices.length;
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

	const targetedQuestions = questions.filter(q => q.categoryId === categoryId).sort((q1, q2) => q1.priority - q2.priority);
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