var Brain_ProWords = require('../brain/brain_pro_words.js');

module.exports = 
{
    name: 'database_Delete_ProWords',
    description: 'Deletes pro-words from the database.',
    usage: '"database_Delete_ProWords" for whole table, "database_Delete_ProWords [Pro-word]" for all records with the pro-word, or "database_Delete_ProWords [Word] [Pro-word]" for a specific set',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_ProWords.remove_Pro_Word(brain.ProWords, message, args[0], args[1]);
        }
        else if (args.length > 0)
        {
            await Brain_ProWords.remove_Pro_Words(brain.ProWords, message, args[0]);
        }
        else
        {
            await Brain_ProWords.remove_Pro_Words_All(brain.ProWords, message);
        }
    }
};