var Brain_PreWords = require('../brain/brain_pre_words.js');

module.exports = 
{
    name: 'database_Delete_PreWords',
    description: 'Deletes the pre-word or all pre-words from the database.',
    usage: 'blank or [Word] [Pre-word]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_PreWords.remove_Pre_Word(brain.PreWords, message, args[0], args[1]);
        }
        else
        {
            await Brain_PreWords.remove_Pre_Words(brain.PreWords, message);
        }
    }
};