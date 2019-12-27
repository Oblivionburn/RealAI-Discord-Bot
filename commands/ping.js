module.exports = 
{
	name: 'ping',
	cooldown: 5,
	description: 'Ping!',
	async execute(brain, message, args) 
	{
		message.channel.send('Pong.');
	}
};