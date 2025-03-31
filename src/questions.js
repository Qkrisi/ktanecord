//the categories of the FAQ section
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

//the questions of the FAQ section
const questions = [
	{
		"question": "What is this?",
		"categoryId": "general",
		"answer": "This bot's purpose is to answer frequently asked questions about modding KTANE. Its goal is to alleviate answering duplicate questions in <#{modCreationId}> and <#{repoDiscussionId}>. Please try to see if your question(s) are answered here before asking there. Navigate through the categories below to see which section your question falls under. Please report any bugs or suggestions to the developers.",
		"commandId": "help",
		"commandName": "help",
        "priority": 0,
	},
	{
		"question": "I have a question that is not answered here. What should I do?",
		"categoryId": "general",
		"answer": "First, verify that your question has truly not been answered here. Sometimes, we gloss things over at a first glance. If the question still hasn’t been answered, ask it in <#{modCreationId}>, but be specific as it makes other people help you quicker.",
		"commandId": "question-not-here",
		"commandName": "QuestionNotHere",
        "priority": 1,
	},
	{
		"question": "How do I get into modding?",
		"categoryId": "getting-started",
		"answer": "1. Download the [KTANE Modkit](<https://github.com/Qkrisi/ktanemodkit>)\n2. Download [Unity Hub](<https://unity.com/download>) (optional for Windows)\n3. Install [Unity version 2017.4.22f1](<https://unity.com/releases/editor/whats-new/2017.4.22>)\n4. Install an IDE\n5. Add a plugin template (Optional)\nSee other {getting-started} if you require assistance with how to start modding.",
		"commandId": "modding-start",
		"commandName": "ModdingStart",
        "priority": 2,
		"longAnswer": true

	},
	{
		"question": "I don’t know how to start learning C#/Unity. How do I know when I learned enough to start modding?",
		"categoryId": "getting-started",
		"answer": "* C# resources:\n\t- [Video Tutorials](<https://www.youtube.com/playlist?list=PL82C6-O4XrHcblXkHA4dLcnb_ipVkKHch>)\n  * [C# documentation](<https://learn.microsoft.com/en-us/dotnet/csharp/>)   \n  * [Codewars](https://www.codewars.com): Website that allows people to solve a variety of coding problems in various ranges of difficulty. Good to practice C# (or any other language) skills\n* Unity Resources:\n    * [Unity Tutorial](<https://www.youtube.com/watch?v=XtQMytORBmM>)\n   * [Unity Workshop](<https://youtu.be/XcK0Y_PVyu8>):  very similar to the first video teaching-wise, but you can try figuring out how to do both projects on your own for more practice\n  * [Unity Documentation](<https://docs.unity.com>)\nThere isn’t a real answer to what is “enough” to start modding. You will learn new things as you continue using the tools. If you need to ask a question on how to do something, try googling it to see if someone else has asked the question before. If not, or you don’t understand the answer, you can try following what other people did in their mods (look at {mod-reference} for more details). If you need more assistance, ask your question in <#{modCreationId}>.",
		"commandId": "c-sharp-tutorials",
		"commandName": "CSharpTutorials",
        "priority": 3,
	},
	{
		"question": "Are there any modding tutorials I can follow?",
		"categoryId": "getting-started",
		"answer": "Yes! There are several tutorials, though some of the information is outdated, the general steps are the same. Be sure to look at the [modkit wiki](<https://github.com/Qkrisi/ktanemodkit/wiki>) to see if something has been updated. It is also a good resource for understanding some methods/classes the modkit provides.\n### Regular Mods\n* [Deaf's video](<https://youtu.be/YobuGSBl3i0>) is very condensed and possibly best if for people who are proficient in C#/Unity.\n* [Royal_Flu$h's series](<https://www.youtube.com/watch?v=Uwmm9iqAlV4&list=PL-1P5EmkkFxrwWW6z0uZ5nBdRImsReOQ0&index=6>) takes a slower pace. Explaining the different aspects of module creation in more detail. Better for beginners.\n### Needy Mods\n* [Deaf's needy video](<https://youtu.be/jnqxzVZYPHg>) assume that you have watched his regular modding tutorial first\n### Boss Modules\n* At the time of writing this (October 12th, 2024), there aren’t any noticeable tutorials for bosses. As for now, it’s recommended to look at the most simple form of a boss (Forget It Not)’s [source code](<https://github.com/VFlyer/FlyersOtherModules/blob/master/Assets/ForgetItNot/ForgetItNotHandler.cs>) as a reference. ",
		"commandId": "mod-tutorials",
		"commandName": "ModTutorials",
        "priority": 4,
	},
	{
		"question": "I don’t have time to look through tutorials/documentations that are this long. Is there a faster way to get started?",
		"categoryId": "getting-started",
		"answer": "Short answer is no. If you want to get into a position of making your modules on your own, you will need to put in the effort of learning. It’s okay if you don’t get it right away as everyone learns at their own pace, but there isn’t a shortcut.\nIf you feel intimidated by the learning process, start small and grow from there. Try making a basic mod; recreate The Simpleton for example, and use what you learned in order to make your “dream” module. If you don’t like a certain aspect of mod creating: scripting, modeling, manual making, etc., you can ping the appropriate roles in <#{modCreationId}> to see if anyone wants to collaborate.\n* Proofreader: People who can read your manual to verify it makes sense grammatically and logically\n* 3D Creator: People who know how to model\n* Mod Creator: Everyone else. Mainly people who can implement the entire mod, or just TP (Twitch Plays)",
		"commandId": "shortcut",
		"commandName": "Shortcut",
        "priority": 5,
	},
	{
		"question": "What is GitHub? Is it necessary to get into modding?",
		"categoryId": "getting-started",
		"answer": "GitHub is a website that holds your code. Think of it like Google Drive. Although GitHub is not required, it is definitely recommended as it allows you to work on your project on different devices and lets other people see and collaborate with your work. Here are the steps to set up git/Github.\n\n1. Create a GitHub account\n2. Install git. Follow this tutorial for installing it on [windows](<https://www.youtube.com/watch?v=8HhEupU4iGU>). Other OS tutorials can be found easily\n3. Figure out which application you want to use in order to use git. There are several applications that have git controls inside of them. For basic purposes, you will need to know how to:\n    * create a new **repository** (project on github)\n    * **clone** (download a project that is on Github)\n    * **commit** (save your changes)\n   * **push** (“upload” your commits/changes)\n    * **pull** (“download” your commits/changes)\n\nHere are some tutorials explaining some of the git terminology including how to publish an existing Unity project to Github. Before you are about to publish your code to GitHub, verify you have a .gitignore file that looks something like [this](<https://github.com/github/gitignore/blob/main/Unity.gitignore>) in your root directory (should be on the same level of your “Assets” folder). This forbids unwanted bloated files being sent to GitHub. If it is not there, download it and replace it in the correct folder.\n* [Visual Studio Code](<https://youtu.be/i_23KUAEtUM>)\n* [Github Desktop](<https://www.youtube.com/watch?v=pn1YgU81GUY>)\n* [Command line](<https://education.github.com/git-cheat-sheet-education.pdf>)",
		"commandId": "github",
		"commandName": "Github",
        "priority": 6,
	},
	{
		"question": "I want my mod to do [X] like the mod [Y] does. How do I do that?",
		"categoryId": "getting-started",
		"answer": "Most mods have their source code publicly available on github. You can find it by going to the {manualRepositoryLink} and clicking the Unity Icon to the left of the mod. You will be taken to the repository of the mod. There you can either navigate the project in the browser itself, or download the project and modify it.",
		"commandId": "mod-reference",
		"commandName": "ModReference",
        "priority": 7,
		
	},
	{
		"question": "How do I create my manual?",
		"categoryId": "manual",
		"answer": "Download and extract the [manual template](<https://ktane.timwi.de/More/Template%20Manual.zip>). This can be found on the {manualRepositoryLink} under `More` > `Template Manual`. It’s recommended to **always** download the template that is on the Repository of Manual Pages as it will always have the up-to-date version.\n1. Rename the folder `Template Manual` to the name of your mod.\n2. Write the manual\n3. Verify your pages don't exceed the page boundaries.\n4. Make your SVG (image in the top right of the manual)\n5. Make the JSON\n6. Lint your manual\nSee {add-manual} to see how you can upload your manual to the repository of manuals.",
		"commandId": "create-manual",
		"commandName": "CreateManual",
        "priority": 0,
		"longAnswer": true
	},
	{
		"question": "How do I add my manual to the repository of manuals?",
		"categoryId": "manual",
		"answer": "Note: This answer also applies if you are making edits to a manual existing on the repo\n\n1. Verify your manual is linted. Run {create-manual} for more details.\n2. Make your manual public for a repo contributor to see. Either send it to <#{repoRequestsId}> or make a pull request\n3. Wait for a maintainer to upload it to the repository.",
		"commandId": "add-manual",
		"commandName": "AddManual",
        "priority": 1,
		"longAnswer": true
	},
	{
		"question": "I would like to make changes on my manual that is already on the Repository of Manuals.",
		"categoryId": "manual",
		"answer": "There are two ways:\n1. **Make a request in** <#{repoRequestsId}> of what you want changed. Be specific so repo contributors can handle the request without needing to know the manual\n    * Example: `Simpleton: Add the following sentence after the first one: \"This module cannot strike you\"`\n2. **Modify the manual yourself**.\n    1. **Get the up-to-date version of the manual.** It can be found on the {ktaneContentRepositoryLink}.\n	2. **Make your changes**\n   3. **Lint your manual** the same way you did while creating the manual.\n  4. **Publish your changes for review**. These are the same steps as uploading a new manual. Run {add-manual} and look at step two for more details.",
		"commandId": "change-manual",
		"commandName": "ChangeManual",
        "priority": 2,
		"longAnswer": true
	},
	{
		"question": "How long does it take for a request to be fulfilled? Can I speed up the process in any way?",
		"categoryId": "manual",
		"answer": "Being a contributor the repository is an unpaid voluntary position. They are not obligated to get requests done within a certain amount of time. Although you cannot make a contributor get to a request faster, you can make the process of reviewing the request faster by following the {maintainerResponsibilities} checklist. It's not necessary to follow all of the steps, but the more that are done correctly, the faster the request will be handled.",
		"commandId": "request-delay",
		"commandName": "RequestDelay",
        "priority": 3,
	},
	{
		"question": "How do I become a maintainer?",
		"categoryId": "manual",
		"answer": "To become a maintainer, you must show that you have experience with git and handling requests competently. So you must become a contributor first.\nAs a contributor, It's recommended having a fork of the {ktaneContentRepositoryLink} so you can easily make PRs. You can then make PRs of requests in <#{repoRequestsId}> (see {add-manual} and {change-manual}). Be sure to bip (react to the request with :bip:) in order to notify other contributors that you are working on the request. Once you make your PR for a request, react to the request with :solved: in order to notify others that you have completed the request. Once you have handled enough requests that you feel comfortable doing it, you can then message a maintainer, and they will have a discussion with others if you would be a good candidate. The more requests you handle correctly, the higher your chances are of becoming a maintainer.",
		"commandId": "become-maintainer",
		"commandName": "BecomeMaintainer",
        "priority": 4,
	},
	{
		"question": "My text is going through the back of the bomb",
		"categoryId": "errors",
		"answer": "* [Text Version of answer](<https://discord.com/channels/160061833166716928/726791283007291474/726794741168996443>)\n* [Video Version of answer](<https://www.youtube.com/watch?v=YobuGSBl3i0&t=1554s>)",
		"commandId": "text-see-through",
		"commandName": "TextSeeThrough",
        "priority": 0,
	},
	{
		"question": "My logs aren't appearing in the Log File Analyzer",
		"categoryId": "errors",
		"answer": "If you want the following to be shown in the LFA:\n\n- Hello World\n\nVerify that your print statement looks like this:\n```cs\nDebug.Log(\"[{InsertModNameHere} #{InsertModuleIdHere}] Hellow World\");```\nOR\n\n```cs\nDebug.LogFormat(\"[{0} #{1}] Hellow World\", InsertModNameHere, InsertModuleIdHere);\n```\nThe `[{InsertModNameHere} #{InsertModuleIdHere}]` format is what the LFA looks for in order to parse the information into the correct section.\n\nIt's highly recommend making your own log function, so you don't have to spell the mod name and id every single time:\n```cs\npublic void Log(string message) \n{\n\tDebug.Log($\"[InsertModNameHere #{InsertModuleIdHere}] {message}\"); \n}\n```\nOf course replace `InsertModNameHere` with the name of your module and `InsertModuleIdHere` with the actual variable name that holds your mod id",
		"commandId": "lfa-not-showing",
		"commandName": "lfaNotShowing",
        "priority": 1,
	},
	{
		"question": "My mod works fine in Unity, but doesn’t in the game.",
		"categoryId": "errors",
		"answer": "Open the log in the {logFileAnalyzerLink} and check if there is a button in the top left called “View Exceptions”. If there is, clicking on said button will show you an exception that was thrown while the mod was running. Fixing the exception will most likely make the mod work in the game.\nSome common exception(s):\n- **Exception: NullReferenceException: Object reference not set to an instance of an object at: SelectableManager.HandleInteract()**\n    - Verify that none of your buttons (objects that have the KMSelectable component, excluding the mod itself) have any children in the inspector.  The children variable should have a size of 0. The only time your buttons should have a size greater than 0 is if their OnInteract delegate returns true. See {on-interact-delegate} for more info.\nOnce you fix the issue(s), update the prefab and rebuild your mod and retest. If you don’t see anything wrong with your project in Unity, update the prefab and rebuild anyway. It’s possible that you changed something without building again. If you are still having issues, ask for help in <#{modCreationId}>.",
		"commandId": "mod-not-working",
		"commandName": "ModNotWorking",
        "priority": 2,
		"longAnswer": true
	},
	{
		"question": "Failed to build AssetBundle: No assets have been tagged for inclusion in the mod.bundle AssetBundle",
		"categoryId": "errors",
		"answer": "Select your prefab in the project window. In the bottom right corner, you will see a dropdown with the name `AssetBundle`, verify the selected option is `mod.bundle`. If you do not see it, make it. You should not see the error building again.",
		"commandId": "mod-building-error",
		"commandName": "ModBuildingError",
        "priority": 3,
		"longAnswer": true

	},
	{
		"question": "I can’t hear my sound effects",
		"categoryId": "errors",
		"answer": "* **If you can’t hear it in the Unity, but can in the game**, open the TestHarness’ inspector, and drag/drop your clips inside the variable that says “Audio Clips”\n* **If you can’t hear it in the game, but can in Unity, **verify that the sound effects are added in `mod.bundle` The steps to do so are the same as adding the prefab to `mod.bundle`. See {mod-building-error} for more information.",
		"commandId": "no-sound",
		"commandName": "NoSound",
        "priority": 4,
		"longAnswer": true
	},
	{
		"question": "Why do I have to return true or false while adding a delegate to KMSelectable.OnInteract?",
		"categoryId": "misc",
		"answer": "The [wiki](<https://github.com/Qkrisi/ktanemodkit/wiki/KMSelectable>) states the return value of the delegate specifies “whether it should drill into children”. If you think of the module as a [tree](<https://en.wikipedia.org/wiki/Tree_(abstract_data_type)#:~:text=In%20computer%20science%2C%20a%20tree,a%20set%20of%20connected%20nodes.>), with the module being the root node, you can move to and from other children. A good example of this is the mod [Quadruple Simpleton Squared](<https://github.com/KTANE-MODS/Quadruple-Simpleton-Squared>). The root node is the mod itself, but if we select the top left section of the mod, that will be the current node since the delegate returns true. If we select the top left button, the interaction will occur but the current node will still be the top left section since the delegate of the button returns false. When we right click, the current node becomes the module again.\nIf you do not want any sections of your mod, all your buttons work as standard buttons, then you should have all of your KMSelectable OnInteract delegates return false and have no children. You can read a discussion about this [here](<https://discord.com/channels/160061833166716928/201105291830493193/1289045915117551637>).",
		"commandId": "on-interact-delegate",
		"commandName": "OnInteractDelegate",
        "priority": 2,
		"longAnswer": true
	},
	{
		"question": 'How do I get my logging to be "fancy" to have images and dropdowns?',
		"categoryId": "misc",
		"answer": "The {logFileAnalyzerLink} (\"LFA\" for short) is a section on the {manualRepositoryLink} that parses the `output_log.txt` file. The file (or log) pertains all of the logs lines from each mod. By default it will take each log line and make them their own bullet point. See {lfa-not-showing} for more info. Anything else you see in a log is done by the LFA parser and needs to be added through the {ktaneContentRepositoryLink}\n\n**Note**: Although LFA support is a feature that improves digestion of information, it shouldn't be relied on as an good logging alternative. If your mod does not provide the necessary information (e.g calculation numbers), it cannot be added though LFA.\n### If you would like to request a mod to have LFA support\n- Go to the <#{lfaSupportThread}>\n- Write the name of the module you want LFA support added to. Bonus points if you provide any additional information, logs, and/or sketches as that makes the contributor's job easier\n- Do note that LFA is a niche portion of contribution, so do expect long wait times before your request gets done\n### If you would like to implement LFA support to a mod\n-  Adding LFA support counts as being a repo contributor (see {become-maintainer} for more details), so you will claim the request in <#{lfaSupportThread}>.\n- There are many things you can do for LFA, but the main ones are adding dropdowns and making svgs. It's recommended you ctrl + f and look at examples to figure out what you want to do. Here are some examples:\n   - Add dropdowns: `Directional Button`\n   - Add nested drop downs: `Character Slots`\n   - Add grid of squares in a svg: `Directional Button`\n   - Edit a dropdown that has already been pushed: `Forget Us Not`",
		"commandId": "add-lfa",
		"commandName": "AddLfa",
        "priority": 1,
		"longAnswer": true
	},
    {
        "question": "What is colorblind support, and how do I add it to my mod?",
        "categoryId": "misc",
        "answer": "Colorblind support allows players with different types of color vision to play the game without visual impairments hindering their experience. While it's not required for a mod to have colorblind support, it's recommended as not having it will limit its visibility.\n\nTo add support, you must add a component called `KMColorblindMode` to the game object that has your mod script. You will be able to access a boolean called `ColorblindModeActive`. This boolean tells if the colorblind mode is enabled. You can then use it to make checks if certain game object (such as text) should appear. Example:\n```cs\n//assume objects has been assigned through the inspector\n[SerializeField]\nTextMesh colorBlindText;\n[SerializeField]\nKMColorblindMode colorblindScript;\n void Awake()\n{\n  //shows the text if it's true, hides it if it's false\n  colorBlindText.SetActive(colorblindScript.ColorblindModeActive);\n}```",
        "commandId": "colorblind-support",
		"commandName": "colorblindSupport",
        "priority": 0

    }
]

module.exports.categories = categories
module.exports.questions = questions