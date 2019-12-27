var Brain_PreWords = require('../brain/brain_pre_words.js');

module.exports = 
{
    name: 'database_PreWords',
    description: 'Gets all pre-words or a single pre-word from the database.',
    usage: 'blank or [Pre-Word] or [Pre-word] [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_PreWords.get_Pre_Words_Matching(brain.PreWords, message, args[0], args[1]);
        }
        else if (args.length > 0)
        {
            await Brain_PreWords.get_Pre_Words(brain.PreWords, message, args[0]);
        }
        else
        {
            await Brain_PreWords.get_Pre_Words_All(brain.PreWords, message);
        }
    }
};