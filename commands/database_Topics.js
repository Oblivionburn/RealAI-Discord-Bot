var Brain_Topics = require('../brain/brain_topics.js');

module.exports = 
{
    name: 'database_Topics',
    description: 'Gets a single topic or all topics for a phrase from the database.',
    usage: 'blank or [Topic] or [Input Phrase]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            var args_message = '';
            for (var i = 0; i < args.length; i++)
            {
                args_message += args[i] + ' ';
            }
            await Brain_Topics.get_Topics_Input(brain.Topics, message, args_message.trim());
        }
        else if (args.length > 0)
        {
            await Brain_Topics.get_Topics(brain.Topics, message, args[0]);
        }
        else
        {
            await Brain_Topics.get_Topics_All(brain.Topics, message);
        }
    }
};