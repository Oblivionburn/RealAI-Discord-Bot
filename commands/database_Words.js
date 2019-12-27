var Brain_Words = require('../brain/brain_words.js');

module.exports = 
{
    name: 'database_Words',
    description: 'Gets all words or a single word from the database.',
    usage: 'blank or [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Words.get_Word(brain.Words, message, args[0]);
        }
        else
        {
            await Brain_Words.get_Words(brain.Words, message);
        }
    }
};