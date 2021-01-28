const {FakeArg} = require("../utils.js")
const setcs = require("./setcs.js")

module.exports.run = (client, message, args) => {
	let c = true
	Object.keys(args).forEach(key => {
		if(c && parseFloat(key))
		{
			message.channel.send("Scores should be positive!")
			c = false
		}
	})
	if(!c) return
	s = args._[0]
	other = args._.slice(1)
	arg = new FakeArg(other.join(" "))
	arg.boss = s
	setcs.run(client, message, arg)
}
