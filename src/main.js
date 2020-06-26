const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('../config.json')
const fetch = require('wumpfetch')
const larg = require('larg')
const aliases = require('./map.js').aliases
const profileWhitelist = require('./map.js').profileWhitelist
const lookup = require('./lookup')

let ktaneModules = new Map()
let modIDs = []

function getKtaneModules() {
    fetch({ url: 'https://ktane.timwi.de/json/raw', parse: 'json' }).send().then(res => {
        let tmp = res.body.KtaneModules
        let symbolBan = new Set()
        for (const m of tmp) {
            symbolBan.add(m.Name.toLowerCase())
            symbolBan.add(m.ModuleID)
            ktaneModules.set(m.ModuleID, m)
            modIDs.push(m.ModuleID)
            ktaneModules.set(m.Name.toLowerCase(), m)
            if (m.Name.toLowerCase().startsWith("the ")) ktaneModules.set(m.Name.toLowerCase().substr(4), m)
            if (m.Symbol != undefined && !aliases.has(m.Symbol) && !ktaneModules.has(m.Symbol) && !symbolBan.has(m.Symbol)) ktaneModules.set(m.Symbol, m)
        }
        console.log('fetching complete')
    })
}

client.on('ready', () => {
    console.log(`Hello world!\nLogged in as ${client.user.tag}\nI am in ${client.guilds.size} servers`)
    client.user.setActivity(`${config.token}help | try ${config.token}repo`)
    if (config.prod) {
        const DBL = require('dblapi.js')
        const d = new DBL(config.dblToken, client)
        d.on('posted', _ => {
            console.log('posted server count to dbl')
        })
        d.on('error', e => {
            console.log(e)
        })
    }
    getKtaneModules()
    setInterval(() => {
        getKtaneModules()
        console.log('Updated ktaneModules!')
    }, 1800000)
})

client.on('message', message => {
    if (message.author.bot) return
    lookup(ktaneModules, message)
    if (!message.content.startsWith(config.token)) return
    if (!profileWhitelist.includes(message.author.id) && message.content.length > 600) return // why is this here

    let args = larg(message.content.slice(config.token.length).split(' '))

    try {
        if (args._[0].includes('.') || args._[0].includes('/')) return
        let commandFile = require(`./commands/${args._[0]}.js`)
        args._.shift()
        commandFile.run(client, message, args)
    } catch (err) {
        console.log(err)
    }
})

client.login(config.discord)

module.exports.ktaneModules = ktaneModules
module.exports.modIDs = modIDs
