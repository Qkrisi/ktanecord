const {FakeArg} = require("../utils.js")
const setcs = require("./setcs.js")

module.exports.run = (client, message, args) => {
	s = args._[0]
	other = args._.slice(1)
	arg = new FakeArg(other.join(" "))
	arg.boss = s
	setcs.run(client, message, arg)
}
