var Brain_ProWords = require('../brain/brain_pro_words.js');

module.exports = 
{
    name: 'database_ProWords',
    description: 'Gets all pro-words or a single pro-word from the database.',
    usage: 'blank or [Pro-word] or [Pro-word] [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_ProWords.get_Pro_Words_Matching(brain.ProWords, message, args[0], args[1]);
        }
        else if (args.length > 0)
        {
            await Brain_ProWords.get_Pro_Words(brain.ProWords, message, args[0]);
        }
        else
        {
            await Brain_ProWords.get_Pro_Words_All(brain.ProWords, message);
        }
    }
};