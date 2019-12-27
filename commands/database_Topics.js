var Brain_Topics = require('../brain/brain_topics.js');

module.exports = 
{
    name: 'database_Topics',
    description: 'Gets all topics or a single topic from the database.',
    usage: 'blank or [Topic] or [Topic] [Input Phrase]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_Topics.get_Topics_Matching(brain.Topics, message, args[0], args[1]);
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