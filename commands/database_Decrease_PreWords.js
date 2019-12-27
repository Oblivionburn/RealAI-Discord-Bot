var Brain_PreWords = require('../brain/brain_pre_words.js');

module.exports = 
{
    name: 'database_Decrease_PreWords',
    description: 'Decreases the count of the pre-word in the database.',
    usage: '[Word] [Pre-word]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_PreWords.decrease_Pre_WordCount(brain.PreWords, message, args[0], args[1]);
        }
        else
        {
            message.channel.send(`That command requires a word and its pre-word.`);
        }
    }
};