var Brain_ProWords = require('../brain/brain_pro_words.js');

module.exports = 
{
    name: 'database_Delete_ProWords',
    description: 'Deletes the pro-word or all pro-words from the database.',
    usage: 'blank or [Word] [Pro-word]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_ProWords.remove_Pro_Word(brain.ProWords, message, args[0], args[1]);
        }
        else
        {
            await Brain_ProWords.remove_Pro_Words(brain.ProWords, message);
        }
    }
};