var Brain_Users = require('../brain/brain_users.js');

module.exports = 
{
	name: 'new_session',
	cooldown: 5,
	aliases: ['new', 'new_conversation'],
	description: 'Starts a new session/conversation',
	async execute(brain, message, args) 
	{
		try
		{
			await Brain_Users.remove_User_LastResponse(brain.Users, message.author.username);
			message.channel.send(`(new session started with ${message.author.username})`);
		}
		catch (error)
		{
			console.error(error);
		}
	}
};