var Brain_Inputs = require('../brain/brain_inputs.js');

module.exports = 
{
    name: 'database_Inputs',
    description: 'Gets all inputs or a single input from the database.',
    usage: 'blank or [Input Phrase]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            var args_message = '';
            for (var i = 0; i < args.length; i++)
            {
                args_message += args[i] + ' ';
            }
            await Brain_Inputs.get_Input(brain.Inputs, message, args_message.trim());
        }
        else
        {
            await Brain_Inputs.get_Inputs(brain.Inputs, message);
        }
    }
};