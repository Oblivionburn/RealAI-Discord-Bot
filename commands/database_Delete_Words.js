var Brain_Words = require('../brain/brain_words.js');

module.exports = 
{
    name: 'database_Delete_Words',
    description: 'Deletes the word or all words from the database.',
    usage: 'blank or [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Words.remove_Word(brain.Words, message, args[0]);
        }
        else
        {
            await Brain_Words.remove_Words(brain.Words, message);
        }
    }
};