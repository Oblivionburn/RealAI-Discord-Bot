var Brain_Inputs = require('../brain/brain_inputs.js');

module.exports = 
{
    name: 'database_Increase_Inputs',
    description: 'Increases the count of the input in the database.',
    usage: '[Input Phrase]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            var args_message = '';
            for (var i = 0; i < args.length; i++)
            {
                args_message += args[i] + ' ';
            }
            await Brain_Inputs.increase_InputCount(brain.Inputs, message, args_message.trim());
        }
        else
        {
            message.channel.send(`That command requires an input phrase.`);
        }
    }
};