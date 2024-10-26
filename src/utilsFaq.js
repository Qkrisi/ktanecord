const { CreateAPIMessage } = require('./utils');


//the questions of the FAQ questions
const questions = [
	{
		"question": "What is this?",
		"categoryId": "general",
		"answer": "This bot's purpose is to answer frequently asked questions about modding KTANE. Its goal is to alleviate answering duplicate questions in <#{modCreationId}> and <#{repoDiscussionId}>. Please try to see if your question(s) are answered here before asking there. Navigate through the categories below to see which section your question falls under. Please report any bugs or suggestions to the developers.",
		"commandId": "help",
		"commandName": "help"
	},
	{
		"question": "I have a question that is not answered here. What should I do?",
		"categoryId": "general",
		"answer": "First, verify that your question has truly not been answered here. Sometimes, we gloss things over at a first glance. If the question still hasn’t been answered, ask it in <#{modCreationId}>, but be specific as it makes other people help you quicker.",
		"commandId": "question-not-here",
		"commandName": "QuestionNotHere"
	},
	{
		"question": "How do I get into modding?",
		"categoryId": "getting-started",
		"answer": "1. Download the [KTANE Modkit](<https://github.com/Qkrisi/ktanemodkit>)\n\t- Assuming you have a github account (see {github} for more details), you can create your own repository using the modkit. Press `Use this template` -> `Create new repository`. Add a name and press `Create repository`. Clone your project to your device.\n\t- If you don't have a github account, you can get the project by pressing `Code` -> `Download zip`. Extract the project. It is recommended that you change the name of the folder to be whatever the name of your mod is: \"The Simpleton\" for example.\n1. Download [Unity Hub](<https://unity.com/download>) (optional)\nUnity Hub is a tool that allows you to see all of your Unity projects in one place. It's optional, but highly recommended if you plan to make multiple Unity projects. You can add a Unity project by selecting `Open` and selecting the folder of your project. It should be the one that contains `Assets` inside of it.\n3. Install a IDE\nAn IDE (Integrated Development Environment) is a tool that makes writing code **much** easier. It allows you to see what is wrong with your code without needing to constantly check Unity. It also color codes your words and has autocompletion which will make writing code quicker. Although you can write scripts by just using Notepad, it is not recommended.\nThe two most common IDEs are Visual Studio (VS) and Visual Studio Code (VS Code). Here are the [installations to both](<https://visualstudio.microsoft.com/downloads/>). Both require some setup to get working with Unity. Here are the steps to do so:\n  * [VS Code](<https://code.visualstudio.com/docs/other/unity>)\n * [VS](<https://learn.microsoft.com/en-us/visualstudio/gamedev/unity/get-started/getting-started-with-visual-studio-tools-for-unity?pivots=windows>)\nIgnore the steps about installing packages as that is not supported in the Unity version for KTANE.{breakMessage}\n4. Add a plugin template (Optional)\nThere are several pre-made templates that streamline the process of creating mods. Although optional, they are very useful for beginners. They can be found by pressing `KeepTalking ModKit` -> `Plugins` at the top of the Unity editor. Which one you use is up to personal preference.\nThese are the steps to set up your project for modding. See other {getting-started} if you require assistance with how to start modding.",
		"commandId": "modding-start",
		"commandName": "ModdingStart"
	},
	{
		"question": "I don’t know how to start learning C#/Unity. How do I know when I learned enough to start modding?",
		"categoryId": "getting-started",
		"answer": "* C# resources:\n\t- [Video Tutorials](<https://www.youtube.com/playlist?list=PL82C6-O4XrHcblXkHA4dLcnb_ipVkKHch>)\n  * [C# documentation](<https://learn.microsoft.com/en-us/dotnet/csharp/>)   \n  * [Codewars](https://www.codewars.com): Website that allows people to solve a variety of coding problems in various ranges of difficulty. Good to practice C# (or any other language) skills\n* Unity Resources:\n    * [Unity Tutorial](<https://www.youtube.com/watch?v=XtQMytORBmM>)\n   * [Unity Workshop](<https://youtu.be/XcK0Y_PVyu8>):  very similar to the first video teaching-wise, but you can try figuring out how to do both projects on your own for more practice\n  * [Unity Documentation](<https://docs.unity.com>)\nThere isn’t a real answer to what is “enough” to start modding. You will learn new things as you continue using the tools. If you need to ask a question on how to do something, try googling it to see if someone else has asked the question before. If not, or you don’t understand the answer, you can try following what other people did in their mods (look at {mod-reference} for more details). If you need more assistance, ask your question in <#{modCreationId}>.",
		"commandId": "c-sharp-tutorials",
		"commandName": "CSharpTutorials"
	},
	{
		"question": "Are there any modding tutorials I can follow?",
		"categoryId": "getting-started",
		"answer": "Yes! There are several tutorials, though some of the information is outdated, the general steps are the same. Be sure to look at the [modkit wiki](<https://github.com/Qkrisi/ktanemodkit/wiki>) to see if something has been updated. It is also a good resource for understanding some methods/classes the modkit provides.\n### Regular Mods\n* [Deaf's video](<https://youtu.be/YobuGSBl3i0>) is very condensed and possibly best if for people who are proficient in C#/Unity.\n* [Royal_Flu$h's series](<https://www.youtube.com/watch?v=Uwmm9iqAlV4&list=PL-1P5EmkkFxrwWW6z0uZ5nBdRImsReOQ0&index=6>) takes a slower pace. Explaining the different aspects of module creation in more detail. Better for beginners.\n### Needy Mods\n* [Deaf's needy video](<https://youtu.be/jnqxzVZYPHg>) assume that you have watched his regular modding tutorial first\n### Boss Modules\n* At the time of writing this (October 12th, 2024), there aren’t any noticeable tutorials for bosses. As for now, it’s recommended to look at the most simple form of a boss (Forget It Not)’s [source code](<https://github.com/VFlyer/FlyersOtherModules/blob/master/Assets/ForgetItNot/ForgetItNotHandler.cs>) as a reference. ",
		"commandId": "mod-tutorials",
		"commandName": "ModTutorials"
	},
	{
		"question": "I don’t have time to look through tutorials/documentations that are this long. Is there a faster way to get started?",
		"categoryId": "getting-started",
		"answer": "Short answer is no. If you want to get into a position of making your modules on your own, you will need to put in the effort of learning. It’s okay if you don’t get it right away as everyone learns at their own pace, but there isn’t a shortcut.\nIf you feel intimidated by the learning process, start small and grow from there. Try making a basic mod; recreate The Simpleton for example, and use what you learned in order to make your “dream” module. If you don’t like a certain aspect of mod creating: scripting, modeling, manual making, etc., you can ping the appropriate roles in <#{modCreationId}> to see if anyone wants to collaborate.\n* Proofreader: People who can read your manual to verify it makes sense grammatically and logically\n* 3D Creator: People who know how to model\n* Mod Creator: Everyone else. Mainly people who can implement the entire mod, or just TP (Twitch Plays)",
		"commandId": "shortcut",
		"commandName": "Shortcut"
	},
	{
		"question": "What is GitHub? Is it necessary to get into modding?",
		"categoryId": "getting-started",
		"answer": "GitHub is a website that holds your code. Think of it like Google Drive. Although GitHub is not required, it is definitely recommended as it allows you to work on your project on different devices and lets other people see and collaborate with your work. Here are the steps to set up git/Github.\n\n1. Create a GitHub account\n2. Install git. Follow this tutorial for installing it on [windows](<https://www.youtube.com/watch?v=8HhEupU4iGU>). Other OS tutorials can be found easily\n3. Figure out which application you want to use in order to use git. There are several applications that have git controls inside of them. For basic purposes, you will need to know how to:\n    * create a new **repository** (project on github)\n    * **clone** (download a project that is on Github)\n    * **commit** (save your changes)\n   * **push** (“upload” your commits/changes)\n    * **pull** (“download” your commits/changes)\n\nHere are some tutorials explaining some of the git terminology including how to publish an existing Unity project to Github. Before you are about to publish your code to GitHub, verify you have a .gitignore file that looks something like [this](<https://github.com/github/gitignore/blob/main/Unity.gitignore>) in your root directory (should be on the same level of your “Assets” folder). This forbids unwanted bloated files being sent to GitHub. If it is not there, download it and replace it in the correct folder.\n* [Visual Studio Code](<https://youtu.be/i_23KUAEtUM>)\n* [Github Desktop](<https://www.youtube.com/watch?v=pn1YgU81GUY>)\n* [Command line](<https://education.github.com/git-cheat-sheet-education.pdf>)",
		"commandId": "github",
		"commandName": "Github"
	},
	{
		"question": "I want my mod to do [X] like the mod [Y] does. How do I do that?",
		"categoryId": "getting-started",
		"answer": "Most mods have their source code publicly available on github. You can find it by going to the {manualRepositoryLink} and clicking the Unity Icon to the left of the mod. You will be taken to the repository of the mod. There you can either navigate the project in the browser itself, or download the project and modify it.",
		"commandId": "mod-reference",
		"commandName": "ModReference",
		"images": [{"name": "unityCircle.png", "index": 0}]
		
	},
	{
		"question": "How do I create my manual?",
		"categoryId": "manual",
		"answer": "Download and extract the [manual template](<https://ktane.timwi.de/More/Template%20Manual.zip>). This can be found on the {manualRepositoryLink} under `More` > `Template Manual. `It’s recommended to **always** download the template that is on the Repository of Manual Pages as it will always have the up-to-date version.\n1. **Rename the folder** `Template Manual` to the name of your mod.\n2. **Write the manual**: Inside the `HTML` folder, you will find a `HTML` file called `Module Name`. Rename that to your module name. Open that file in a text editor, (Visual Studio Code is preferred, but not required). This is where you write your manual with HTML.\n    * It's recommended to read `Tutorial (delete when done).html` in your browser as it will show you how to use some HTML.\n    * More tutorials\n        * [HTML](<https://youtu.be/HD13eq_Pmp8>)\n      * [CSS](<https://www.youtube.com/watch?v=wRNinF7YQqQ>)\n      * [Javascript](<https://www.youtube.com/watch?v=Ihy0QziLDf0&list=PLZPZq0r_RZOO1zkgO4bIdfuLpizCeHYKv>) (will rarely be used for basic manuals)\n    * [Video demonstration](<https://youtu.be/YobuGSBl3i0?t=10097>)\n3. **Verify your pages don't exceed the page boundaries.** This can be done by pressing Alt + P in the browser to enable developer mode. If you see red on at the top/bottom of your page, you are exceeding the boundaries, and should move your content to a new page. It's okay if there is a little red, but there shouldn't be any over the words/pictures.\n{breakMessage}    * **Good**{breakMessage}    * **Bad**{breakMessage}4. **Make your SVG (image in the top right of the manual)**: A module svg's can be made in [inkscape](<https://inkscape.org>). A template of the svg can be found in the `HTML\\img\\Component` folder. Rename `Module Name.svg` to the name of the mod. Be sure to change the appropriate HTML in your manual to have this name change as well. Otherwise it will not show up in the manual.\n     * [Inkscape tutorial](<https://www.youtube.com/watch?v=fzk-suGcqrc&ab_channel=LogosByNick>)\n5. **Make the JSON**\n   * Go to the {manualRepositoryLink} -> `Tools` -> `Create new module`. Fill out the information and press `Generate JSON`. Please verify that no other mod shares any of the following information:\n      * Name\n      * Module ID\n      * Sort key\n      * Steam ID\n    * Copy the information to your clipboard\n    * In the manual template, open the `JSON` folder. Open `Module Name.json` in your text editor and paste the content you copied\n    * Rename `Module Name.json` to your actual module name.\n    * [Video demonstration](<https://youtu.be/YobuGSBl3i0?t=11850>)\n6. **Lint your manual**: Zip the entire manual folder (what was originally called `Template Manual`), and send it to <@{logBotId}> with the message `!lint` via a dm. The bot will check if there is anything wrong with your manual (including any images and the JSON). If you see any warnings, fix them, and lint the new version of the manual. Continue to do this until the bot reacts with :thumbsup:. See {add-manual} to see how you can upload your manual to the repository of manuals.",
		"commandId": "create-manual",
		"commandName": "CreateManual",
		"images": [{"name": "badBoundaries.png", "index": 2}, {"name": "goodBoundaries.png", "index": 1}]
	},
	{
		"question": "How do I add my manual to the repository of manuals?",
		"categoryId": "manual",
		"answer": "Note: This answer also applies if you are making edits to a manual existing on the repo\n\n1. **Verify your manual is linted**. Run {create-manual} for more details.\n2. **Make your manual public for a repo contributor to see**. People who have the repo maintainer role have direct push access to the {ktaneContentRepositoryLink}. They (or another repo contributor) will look at your manual, make any necessary edits and upload it to the repository. There are two ways to give a maintainer your manual:\n    * **Send it to <#{repoRequestsId}>**\n        * If it's a new manual, upload the zip to <#{repoRequestsId}> with a message saying it's a new module.\n     * If you're updating the manual, and only the HTML file changed, only that file needs to be sent to <#{repoRequestsId}>. If it's more than one file, send the entire zip with a message saying which files have changed.\n    * **Make a Pull Request**\n        * If you are familiar with git, you can clone the {ktaneContentRepositoryLink}, and make a pull request with your added manual. You can read through the {maintainerResponsibilities} checklist in order to verify that your manual is valid. Since not many maintainers look at pull requests on GitHub, it's recommended you link your PR into <#{repoRequestsId}> along with a message briefly explaining what the PR is. It is expected that you do not touch the PR after it is published. If you need to make a change, close the PR, make the change, and make a new one.\n{breakMessage}3. **Wait for a maintainer to upload it to the repository.**\n    * You will know if your module is being worked on if it has the reaction :bip:. Please do not delete the request if it has that reaction. If there is something that you missed that you want added to the manual, make a thread to the original request with a message describing the new changes.\n    * Be patient as being a maintainer is a volunteer position. See {request-delay} on how to make requests be handled faster. See {become-maintainer} on how to become a maintainer.",
		"commandId": "add-manual",
		"commandName": "AddManual"
	},
	{
		"question": "I would like to make changes on my manual that is already on the Repository of Manuals.",
		"categoryId": "manual",
		"answer": "There are two ways:\n1. **Make a request in** <#{repoRequestsId}> of what you want changed. Be specific so repo contributors can handle the request without needing to know the manual\n    * Example: `Simpleton: Add the following sentence after the first one: \"This module cannot strike you\"`\n2. **Modify the manual yourself**.\n    1. **Get the up-to-date version of the manual.** It can be found on the {ktaneContentRepositoryLink}. It's possible that a maintainer cleaned up your manual before publishing it to the repo. Always update your manual before making changes even if you don't think any changes have been made.\n        1. Open the Ktane Content repository in your browser and navigate to the [HTML folder](https://github.com/Timwi/KtaneContent/tree/master/HTML). \n      2. Type in the name of the manual followed by .`html` and select the correct option. Example gif trying to find `Not Colored Squares.html`\n      3. Press the download button in the top right of the file and replace the old version of the mod{breakMessage}2. **Make your changes**\n 3. **Lint your manual** the same way you did while creating the manual.\n 4. **Publish your changes for review**. These are the same steps as uploading a new manual. Run {add-manual} and look at step two for more details.",
		"commandId": "change-manual",
		"commandName": "ChangeManual",
		"images": [{"name": "gitSearch.gif", "index": 0}, {"name": "gitDownload.png", "index": 0}]
	},
	{
		"question": "How long does it take for a request to be fulfilled? Can I speed up the process in any way?",
		"categoryId": "manual",
		"answer": "Being a contributor the repository is an unpaid voluntary position. They are not obligated to get requests done within a certain amount of time. Although you cannot make a contributor get to a request faster, you can make the process of reviewing the request faster by following the {maintainerResponsibilities} checklist. Although it is not necessary to follow all of the steps, the more that are done, the faster the request will be handled.",
		"commandId": "request-delay",
		"commandName": "RequestDelay"
	},
	{
		"question": "How do I become a maintainer?",
		"categoryId": "manual",
		"answer": "To become a maintainer, you must show that you have experience with git and handling requests competently. So you must become a contributor first.\nAs a contributor, It's recommended having a fork of the {ktaneContentRepositoryLink} so you can easily make PRs. You can then make PRs of requests in <#{repoRequestsId}> (see {add-manual} and {change-manual}). Be sure to bip (react to the request with :bip:) in order to notify other contributors that you are working on the request. Once you make your PR for a request, react to the request with :solved: in order to notify others that you have completed the request. Once you have handled enough requests that you feel comfortable doing it, you can then message a maintainer, and they will have a discussion with others if you would be a good candidate. The more requests you handle correctly, the higher your chances of becoming a maintainer.",
		"commandId": "become-maintainer",
		"commandName": "BecomeMaintainer"
	},
	{
		"question": "My mod works fine in Unity, but doesn’t in the game.",
		"categoryId": "errors",
		"answer": "Open the log in the [Logfile Analyzer](https://ktane.timwi.de/More/Logfile%20Analyzer.html) and check if there is a button in the top left called “View Exceptions”. If there is, clicking on said button will show you an exception that was thrown while the mod was running. Fixing the exception will most likely make the mod work in the game.\nSome common exceptions:\n- **Exception: NullReferenceException: Object reference not set to an instance of an object at: SelectableManager.HandleInteract()**\n    - Verify that none of your buttons (objects that have the KMSelectable component, excluding the mod itself) have any children in the inspector.  The children variable should have a size of 0. The only time your buttons should have a size greater than 0 is if their OnInteract delegate returns true. See {on-interact-delegate} for more info.    \n**Good**{breakMessage}\n**Bad**{breakMessage}\nOnce you fix the issue(s), update the prefab and rebuild your mod and retest. If you don’t see anything wrong with your project in Unity, update the prefab and rebuild anyway. It’s possible that you changed something without building again. If you are still having issues, ask for help in <#{modCreationId}>.",
		"commandId": "mod-not-working",
		"commandName": "ModNotWorking",
		"images": [{"name": "children.png", "index": 1}, {"name": "noChildren.png", "index": 0}]
	},
	{
		"question": "My text is going through the back of the bomb",
		"categoryId": "errors",
		"answer": "* [Text Version of answer](<https://discord.com/channels/160061833166716928/726791283007291474/726794741168996443>)\n* [Video Version of answer](<https://www.youtube.com/watch?v=YobuGSBl3i0&t=1554s>)",
		"commandId": "text-see-through",
		"commandName": "TextSeeThrough"
	},
	{
		"question": "I’m trying to build my mod, but I'm getting the error- Failed to build AssetBundle: No assets have been tagged for inclusion in the mod.bundle AssetBundle.",
		"categoryId": "errors",
		"answer": "Select your prefab in the project window. In the bottom right corner, you will see a dropdown with the name `AssetBundle`, verify the selected option is `mod.bundle`. If you do not see it, make it. You should not see the error building again.",
		"commandId": "mod-building-error",
		"commandName": "ModBuildingError",
		"images": [{"name": "modBundle.png", "index": 0}]
	},
	{
		"question": "I can’t hear my sound effects",
		"categoryId": "errors",
		"answer": "* **If you can’t hear it in the Unity, but can in the game**, open the TestHarness’ inspector, and drag/drop your clips inside the variable that says “Audio Clips”{breakMessage}* **If you can’t hear it in the game, but can in Unity, **verify that the sound effects are added in `mod.bundle` The steps to do so are the same as adding the prefab to `mod.bundle`. See {mod-building-error} for more information.",
		"commandId": "no-sound",
		"commandName": "NoSound",
		"images": [{"name": "audio clips.png", "index": 0}]
	},
	{
		"question": "Why do I have to return true or false while adding a delegate to KMSelectable.OnInteract?",
		"categoryId": "misc",
		"answer": "The [wiki](<https://github.com/Qkrisi/ktanemodkit/wiki/KMSelectable>) states the return value of the delegate specifies “ whether it should drill into children”. If you think of the module as a [tree](<https://en.wikipedia.org/wiki/Tree_(abstract_data_type)#:~:text=In%20computer%20science%2C%20a%20tree,a%20set%20of%20connected%20nodes.>), with the module being the root node, you can move to and from other children. A good example of this is the mod [Quadruple Simpleton Squared](<https://github.com/KTANE-MODS/Quadruple-Simpleton-Squared>). The root node is the mod itself, but if we select the top left quadrant of the mod, that will be the current node since the delegate returns true. If we select the top left button, the interaction will occur but the current node will still be the top left quadrant since the delegate of the button returns false. When we right click, the current node becomes the current node’s parent. In this case, the current node would be the module again.\nIf you do not want any sections of your mod, all your buttons work as standard buttons, then you should have all of your KMSelectable OnInteract delegates return false and have no children. You can read a discussion about this [here](<https://discord.com/channels/160061833166716928/201105291830493193/1289045915117551637>).",
		"commandId": "on-interact-delegate",
		"commandName": "OnInteractDelegate",
		"images": [{"name": "tree.png", "index": 0}]

	}
]

//the categories of the FAQ 
const categories = [
	{
		"name": "General",
		"id": "general",
		"commandName": "general",
		"description": "General questions about the bot"
	},
	{
		"name": "Getting Started",
		"id": "getting-started",
		"commandName": "getting-started",
		"description": "Set up questions getting into modding."
	},
	{
		"name": "Manual",
		"id": "manual",
		"commandName": "manual",
		"description": "Questions related to manuals and their publication."
	},
	{
		"name": "Common Errors",
		"id": "errors",
		"commandName": "errors",
		"description": "Common problems when creating a mod"
	},
	{
		"name": "Misc",
		"id": "misc",
		"commandName": "misc",
		"description": "Misc questions"
	}
]

//what to replace placeholder information with
const placeholderInfo = {
    modCreationId: "201105291830493193",
    repoDiscussionId: "640557658482540564",
    repoRequestsId: "612414629179817985",
    logBotId: "317798455110139916",
    ktaneContentRepositoryLink: "[Ktane Content repository](<https://github.com/Timwi/KtaneContent>)",
    manualRepositoryLink: "[Repository of Manual Pages](<https://ktane.timwi.de>)",
    maintainerResponsibilities: "[Repo Maintainer Responsibilities](<https://docs.google.com/document/d/10rabFJES6avb8ime3Cw5LCd9p0663PbqVqzUrfehYac/edit?usp=sharing>)",
}

/**
 * Replace placeholders text with their actual data
 * @param {string} text The original text
 * @param {string} name The user name of the user
 * @returns {string} The new text without the placeholders
 */
const replacePlaceholders = (text) => {
    //replace channel ids
    text = text.replaceAll("{modCreationId}", placeholderInfo.modCreationId);

    text = text.replaceAll("{repoDiscussionId}", placeholderInfo.repoDiscussionId);

    text = text.replaceAll("{repoRequestsId}", placeholderInfo.repoRequestsId);

    //replace links
    text = text.replaceAll("{ktaneContentRepositoryLink}", placeholderInfo.ktaneContentRepositoryLink);

    text = text.replaceAll("{manualRepositoryLink}", placeholderInfo.manualRepositoryLink);

    text = text.replaceAll("{maintainerResponsibilities}", placeholderInfo.maintainerResponsibilities);

    //ping roles/people
    text = text.replaceAll("{logBotId}", placeholderInfo.logBotId);

    
    //get rid of the any command ids with their actual name
    const commandObjects = questions.map(q => {return {id: q.commandId, name: q.commandName, question: q.question, categoryId: q.categoryId}});
    const categoryObject = categories.map(q => {return {id: q.id, commandName: q.commandName, name: q.name}});
    for(const obj of commandObjects) {
		const questionMax = 30;
		const shortQuestion = truncateText(obj.question, questionMax);
        text = text.replaceAll(`{${obj.id}}`, `**'${shortQuestion}' command (in ${categoryObject.find(c => c.id === obj.categoryId).name}) category**`);
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


CommandSelect_ChannelID = 0;
CommandSelect_MessageID = []

/**
 * Creates string selection object(s) with the values being the question(s) within a certain category. The same as GetMessages in tp.js
 * @param categoryId the id of the category of questions
 * @param message
 * @param client
 * @param SendMessages if the the string selection(s) will be sent
 * @returns the string selection(s)
 */
async function setSelections(categoryId, message, client, SendMessages = true, isCommand = true) {
    const maxQuestions = 25;
    let messages = [];
    let rows = [];
    let datas = [];
    let modules = [];

	if(SendMessages)
	{
		CommandSelect_ChannelID = message.channel.id
		CommandSelect_ChannelID = []
	}
	const categoryObj = categories.find(c => c.id === categoryId);
	const targetedQuestions = questions.filter(q => q.categoryId === categoryId);

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
            let action_row = { "type": 1, "components": [{ "type": 3, "custom_id": `faq${categoryObj.name.replaceAll(" ", "")} ${row_i++}_${i}`, "options": [], "placeholder": "Choose a question"}] }
            for (const module of row)
                action_row.components[0].options.push(module)
            data.components.push(action_row)
        }
        datas.push([data, files, send])
        if (SendMessages)
            await send(data, msg => CommandSelect_MessageID.push(msg.id))
    }

	if(SendMessages && !isCommand)
		await message.delete()
	return datas
}



exports.sendQuestion = sendQuestion
exports.setSelections = setSelections
exports.questions = questions
exports.categories = categories