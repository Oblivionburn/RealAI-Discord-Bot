var Brain_PreWords = require('../brain/brain_pre_words.js');

module.exports = 
{
    name: 'database_Delete_PreWords',
    description: 'Deletes pre-words from the database.',
    usage: '"database_Delete_PreWords" for whole table, "database_Delete_PreWords [Pre-word]" for all records with the pre-word, or "database_Delete_PreWords [Word] [Pre-word]" for a specific set',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_PreWords.remove_Pre_Word(brain.PreWords, message, args[0], args[1]);
        }
        else if (args.length > 0)
        {
            await Brain_PreWords.remove_Pre_Words(brain.PreWords, message, args[0]);
        }
        else
        {
            await Brain_PreWords.remove_Pre_Words_All(brain.PreWords, message);
        }
    }
};