var Brain_WordsBlackList = require('../brain/brain_words_blacklist.js');

module.exports = 
{
    name: 'database_Blacklist',
    description: 'Gets all words or a single word from the blacklist.',
    usage: 'blank or [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_WordsBlackList.get_Word(brain.Words, message, args[0]);
        }
        else
        {
            await Brain_WordsBlackList.get_Words(brain.Words, message);
        }
    }
};