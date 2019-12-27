var Brain_ProWords = require('../brain/brain_pro_words.js');

module.exports = 
{
    name: 'database_Increase_ProWords',
    description: 'Increases the count of the pro-word in the database.',
    usage: '[Word] [Pro-word]',
    async execute(brain, message, args) 
    {
        if (args.length > 1)
        {
            await Brain_ProWords.increase_Pro_WordCount(brain.ProWords, message, args[0], args[1]);
        }
        else
        {
            message.channel.send(`That command requires a word and its pro-word.`);
        }
    }
};