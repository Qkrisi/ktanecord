const { categories } = require('./questions');

const aliases = new Map([
    ['fmn', 'MemoryV2'],
    ['fe', 'HexiEvilFMN'],
    ['rpsls', 'RockPaperScissorsLizardSpockModule'],
    ['ttk', 'TurnTheKey'],
    ['ttks', 'TurnTheKeyAdvanced'],
    ['cgol', 'GameOfLifeCruel'],
    ['golc', 'GameOfLifeCruel'],
    ['cpk', 'CruelPianoKeys'],
    ['fer', 'ForeignExchangeRates'],
    ['mah', 'ModuleAgainstHumanity'],
    ['wof', 'WhosOnFirst'],
    ['homework', 'KritHomework'],
    ['mtc', 'monsplodeCards'],
    ['xray', 'XRayModule'],
    ['set', 'SetModule'],
    ['sync125', 'sync125_3'],
    ['schlag', 'qSchlagDenBomb'],
    ['morsemaze', 'MorseAMaze'],
    ['morseamaze', 'MorseAMaze'],
    ['jackolantern', 'jackOLantern'],
    ['101', 'OneHundredAndOneDalmatiansModule'],
    ['bitwise', 'BitOps'],
    ['boolean venn', 'booleanVennModule'],
    ['ft', 'forgetThis'],
    ['jv', 'jewelVault'],
    ['l&r', 'leftandRight'],
    ['lr', 'leftandRight'],
    ['lnr', 'leftandRight'],
    ['s&k', 'sonicKnuckles'],
    ['snk', 'sonicKnuckles'],
    ['sk', 'sonicKnuckles'],
    ['knuckles', 'sonicKnuckles'],
    ['sth', 'sonic'],
    ['sh', 'sonic'],
    ['hedgehog', 'sonic'],
    ['loot', 'SplittingTheLootModule'],
    ['mouse', 'MouseInTheMaze'],
    ['mousemaze', 'MouseInTheMaze'],
    ['graffiti', 'graffitiNumbers'],
    ['jack', 'jackOLantern'],
    ['ucn', 'qkUCN'],
    ['fta', 'forgetThemAll'],
    ['fen', 'forgetEnigma'],
    ['fun', 'forgetUsNot'],
    ['fp', 'qkForgetPerspective'],
    ['fmw', 'ForgetMeNow'],
    ['fml', 'forgetMeLater'],
    ['fin', 'forgetItNot'],
    ['sf', 'simonForgets'],
    ['bamb', 'bamboozlingButton'],
    ['bama', 'bamboozledAgain'],
    ['ba', 'bamboozledAgain'],
    ['bbg', 'bamboozlingButtonGrid'],
    ['btk', 'bamboozlingTimeKeeper'],
    ['mmc', 'Mastermind Cruel'],
    ['mms', 'Mastermind Simple'],
    ['scf', 'sevenChooseFour'],
    ['fcm', 'Krit4CardMonte'],
    ['π', 'pieModule']
])

const manualOverride = new Map([
    ["A>N<D", "A_N_D"],
    ["...?", "Punctuation Marks"],
    ["Kahoot!", "Kahoot"]
])

const subjectOverrides = new Map([
    ['Friendship', 'On the Magic of Friendship'],
    ['7', 'The Subject of 7'],
    ['14', '14'],
    ['Hexamaze', 'On the Subject of Hexamazes'],
    ['Light Cycle', 'On the Subject of Light Cycles'],
    ['Zoo', 'On the Subject of Zoos'],
    ['X-Ray', 'On the Subject of X-Rays'],
    ['Symbol Cycle', 'On the Subject of Symbol Cycles'],
    ['Polyhedral Maze', 'On the Subject of Polyhedral Mazes'],
    ['Marble Tumble', 'On the Subject of Marble Tumbles'],
    ['Black Hole', 'On the Subject of Black Holes'],
    ['Pattern Cube', 'On the Subject of Pattern Cubes'],
    ['Kudosudoku', 'On the Subject of Kudosudokus'],
    ['Binary Puzzle', 'On the Subject of Binary Puzzles'],
])

const profileWhitelist = [
	"345587926681518080",		//Qkrisi
    "321242389106786314"		//Cyber28
]

const ScoreWhitelist = [
	"121400102148505600",		//Rexkix
//	"297565910326181909"		//DireKrow
]

const Interactions = [
	{
		data:{
			name:"help",
			description:"Show KTaNE Bot help",
			options:[
				{
					type:5,
					name:"admin",
					description:"Show KTaNE Bot help for server admins"
				},
				{
					type:5,
					name:"cs",
					description:"Show KTanE Bot help for community scores"
				}
			]
		}
	},
	{
		data:{
			name:"ping",
			description:"Show bot ping"
		}
	},
	{
		data:{
			name:"faq",
			description:"Check to see if your question related to mod creation is answered",
			options: [
				{
					type: 3,
					name: "category",
					description: "The name of the category the question falls under",
					choices: categories.map(c =>  { return {name: c.name.toLowerCase().replaceAll(" ", "-"), value: c.id} })
				}
			],
			autocomplete: true
		}
	},
	{
		data:{
			name:"repo",
			description:"Show information about a KTaNE module",
			options:[
				{
					type:3,
					name:"module",
					description:"Show information about the specified module",
				},
				{
					type:5,
					name:"random",
					description:"Shows information about a random module"
				}
			]
		}
	},
	{
		data:{
			name:"score",
			description:"Show scores of a module",
			options:[
				{
					type:3,
					name:"module",
					description:"Module to show scores of",
					required:true
				},
				{
					type:5,
					name:"mobile",
					description:"Mobile-friendly response"
				}
			]
		}
	},
	{
		data:{
			name:"tp",
			description:"Commands related to Twitch Plays",
			options:[
				{
					type:1,
					name:"stats",
					description:"Show statistics of player",
					options:[
						{
							type:3,
							name:"player",
							description:"Player to show statistics of"
						},
						{
							type:3,
							name:"streamer",
							description:"Name of the streamer"
						}
					]
				},
				{
					type:1,
					name:"streamers",
					description:"Shows a list of available streamers"
				},
				{
					type:1,
					name:"current",
					description:"Shows the status of the current streamers"
				},
				{
					type:1,
					name:"data",
					description:"Shows the statistics of the specified streamer",
					options:[
						{
							type:3,
							name:"streamer",
							description:"Streamer to show statistics of"
						}
					]
				}
			]
		},
	},
	{
		data:{
			name:"match",
			description:"Search for modules matching a regular expression",
			options:[
				{
					type:3,
					name:"pattern",
					description:"RegEx pattern to search for (full or simple)",
					required:true
				}
			]
		}
	},
	{
		data:{
			name:"contact",
			description:"Shows contact information of a modder",
			options:[
				{
					type:3,
					name:"modder",
					description:"Name of the modder",
					required:true
				}
			]
		}
	},
	{
		data:{
			name:"setcs",
			description:"Set community score of a module",
			options:[
				{
					type:3,
					name:"module",
					description:"Identifier of the module",
					required:true
				},
				{
					type:3,
					name:"value",
					description:"Value",
					required:true
				},
				{
					type:3,
					name:"reason",
					description:"Reasoning behind the value",
					required:true
				}
			]
		}
	},
	{
		data:{
			name:"setbosscs",
			description:"Set community score (general and boss) of a module",
			options:[
				{
					type:3,
					name:"module",
					description:"Identifier of the module",
					required:true
				},
				{
					type:3,
					name:"value",
					description:"General score value",
					required:true
				},
				{
					type:3,
					name:"ppm",
					description:"Points per module value",
					required:true
				},
				{
					type:3,
					name:"reason",
					description:"Reasoning behind the value",
					required:true
				}
			]
		}
	},
	{
		data:{
			name:"clearcs",
			description:"(Maintainer only) clear community score of a module",
			options:[
				{
					type:3,
					name:"module",
					description:"Identifier of the module",
					required:true
				}
			]
		}
	},
	{
		data:{
			name:"comment",
			description:"Comment on a module's community score",
			options:[
				{
					type:3,
					name:"module",
					description:"Idenfitifer of the module",
					required:true
				},
				{
					type:3,
					name:"comment",
					description:"Comment to add",
					required:true
				}
			]
		}
	},
	{
		data:{
			name:"getcs",
			description:"Get community scores and reasons of a module",
			options:[
				{
					type:3,
					name:"module",
					description:"Identifier of the module",
					required:true
				}
			]
		}
	},
	{
		data:{
			name: "idea",
			description: "Show a random or specified mod idea",
			options:[
				{
					type:3,
					name:"name",
					description:"Name of the idea",
				},
				{
					type:5,
					name:"InProgress",
					description:"Include ideas in progress"
				},
				{
					type:5,
					name:"NotReady",
					description:"Include not ready ideas"
				},
				{
					type:5,
					name:"unknown",
					description:"Include ideas with unknown state"
				},
				{
					type:5,
					name:"IsReady",
					description:"Include ready ideas"
				}
			]
		}
	},
	{
	    data: {
		name: "profile",
		description: "Show profile statistics",
		options: [
		    {
			type: 11,
			name: "profile",
			description: "The JSON file of the profile",
			required: true
		    }
		]
	    }
	},
	{
	    data:{
		type: 3,
		name: "Contact info",
	    }
	},
	{
	    data: {
		type: 2,
		name: "Contact info"
	    }
	}
]

const MessageFlags = {
    EPHEMERAL: 1 << 6	//Only the person who sent the interaction can see the response
}

module.exports.aliases = aliases
module.exports.manualOverride = manualOverride
module.exports.subjectOverrides = subjectOverrides
module.exports.profileWhitelist = profileWhitelist
module.exports.ScoreWhitelist = ScoreWhitelist
module.exports.Interactions = Interactions
module.exports.MessageFlags = MessageFlags
