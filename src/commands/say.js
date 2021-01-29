const {profileWhitelist} = require("../map.js")

module.exports.run = (client, message, args, SkipCheck = false) => {
	if(!SkipCheck && !profileWhitelist.includes(message.author.id)) return
	client.channels.forEach(channel => {
		if(channel.id==args._[0])
		{
			channel.send(args._.slice(1).join(" "))
			return
		}
	});
}
	
