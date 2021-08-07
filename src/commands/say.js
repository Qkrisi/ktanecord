const {profileWhitelist} = require("../map.js")

module.exports.run = (client, message, args, SkipCheck = false) => {
	if(!SkipCheck && !profileWhitelist.includes(message.author.id)) return
	for(const channel of client.channels.cache.values())
	{
		if(channel.id==args._[0])
		{
			channel.send(args._.slice(1).join(" "))
			return
		}
	}
}
	
