var Brain_Words = require('../brain/brain_words.js');

module.exports = 
{
    name: 'database_Decrease_Words',
    description: 'Decreases the count of the word in the database.',
    usage: '[Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Words.decrease_WordCount(brain.Words, message, args[0]);
        }
        else
        {
            message.channel.send(`That command requires a word.`);
        }
    }
};