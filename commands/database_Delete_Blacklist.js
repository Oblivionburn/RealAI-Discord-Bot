var Brain_WordsBlackList = require('../brain/brain_words_blacklist.js');

module.exports = 
{
    name: 'database_Delete_Blacklist',
    description: 'Deletes the word or all words from the blacklist.',
    usage: 'blank or [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_WordsBlackList.remove_Word(brain.WordsBlackList, message, args[0]);
        }
        else
        {
            await Brain_WordsBlackList.remove_Words(brain.WordsBlackList, message);
        }
    }
};