var Brain_Topics = require('../brain/brain_topics.js');

module.exports = 
{
    name: 'database_Delete_Topics',
    description: 'Deletes the topic or all topics from the database.',
    usage: 'blank or [Topic]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Topics.remove_Topic(brain.Topics, message, args[0]);
        }
        else
        {
            await Brain_Topics.remove_Topics(brain.Topics, message);
        }
    }
};