const profileWhitelist = require('../map.js').profileWhitelist

const clean = text => {
	if (typeof(text) === "string")
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
	else
		return text
}

function censor(censor) {
	 var i = 0;

	return function (key, value) {
	if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
		return '[Circular]';

	if (i >= 29)
		return '[Unknown]';

	++i;

	return value;
  }
}


module.exports.run = (client, message, args) => {
	if (!profileWhitelist.includes(message.author.id)) return
	try {
		let code = message.content.slice(5) // .help 5 chars
		let splitted = code.split("\n")
		if (splitted[0] == " `js" && splitted[splitted.length-1] == "`") {
			splitted.shift()
			splitted.pop()
			code = splitted.join("\n")
		}
		let evaled = eval(code)
		if (typeof evaled !== "string") evaled = require("util").inspect(evaled)
		message.channel.send(clean(evaled), {code:"xl"})
	} catch (err) {
		message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
	}
}
