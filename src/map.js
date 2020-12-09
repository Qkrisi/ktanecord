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
    ["...?", "Punctuation Marks"]
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
    "321242389106786314",
    "345587926681518080"
]

module.exports.aliases = aliases
module.exports.manualOverride = manualOverride
module.exports.subjectOverrides = subjectOverrides
module.exports.profileWhitelist = profileWhitelist
