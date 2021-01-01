const {GetModule, FakeArg} = require('../utils.js')
const axios = require('axios')
const config = require('../../config.json')

function GetCallback(message){
	return send => response => {
		let body = response.data
		if(body.error) message.channel.send(`Error: ${body.error}`)
		else if(send) message.channel.send("Score set successfully")
	}
}

function GetErrorCallback(message){
	return error => {
		console.log(error)
		message.channel.send(`An error occurrend while communicating with the scoring server (${error.response.status})`)
	}
}

function ValidateNumber(value, message){
	if(isNaN(value)){
		console.log(value);
		message.channel.send("Please provide a valid number!")
		return undefined
	}
	value = parseFloat(value)
	if(!isFinite(value)){
		message.channel.send("Please provide a finite value!")
		return undefined
	}
	if(value<=0){
		message.channel.send("Scores should be positive!")
		return undefined
	}
	return value
}

module.exports.run = (client, message, args) => {
	if(args.boss) args._.unshift(args.boss)
	let input = args._.join(" ").split(", ")
	if(input.length < (args.boss ? 4 : 3)) return message.channel.send("Too few arguments were given")
	let inputmodule = GetModule(message, new FakeArg(input[0]))
	if(!inputmodule) return
	let value = ValidateNumber(input[1], message)
	if(value==undefined) return
	let reason = input.slice(args.boss ? 3 : 2).join(", ")
	body = {
		"module":inputmodule.Name,
		"discord":message.author.tag,
		"column":args.boss ? "L" : "K",
		"value":value,
		"reason":reason
	}
	let url = `http://${config.tpServerIP}:${config.tpServerPort}/SetCommunityScore`
	let Callback = GetCallback(message)
	let ErrorCallback = GetErrorCallback(message)
	axios.post(url, body).then(Callback(true)).catch(ErrorCallback)
	if(args.boss){
		body["column"]="M"
		value = ValidateNumber(input[2], message)
		if(value==undefined) return
		body["value"]=value
		axios.post(url, body).then(Callback(false)).catch(ErrorCallback)
	}
}
