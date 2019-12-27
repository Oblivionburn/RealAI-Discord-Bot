var Brain_Words = require('../brain/brain_words.js');

module.exports = 
{
    name: 'database_Increase_Words',
    description: 'Increases the count of the word in the database.',
    usage: '[Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Words.increase_WordCount(brain.Words, message, args[0]);
        }
        else
        {
            message.channel.send(`That command requires a word.`);
        }
    }
};