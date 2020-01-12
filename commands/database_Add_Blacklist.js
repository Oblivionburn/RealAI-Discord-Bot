var Brain_WordsBlackList = require('../brain/brain_words_blacklist.js');

module.exports = 
{
    name: 'database_Add_Blacklist',
    description: 'Adds a word to the blacklist.',
    usage: '[Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_WordsBlackList.add_Words(brain.Words, message, args[0]);
        }
    }
};