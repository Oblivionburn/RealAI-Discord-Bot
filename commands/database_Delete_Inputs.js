var Brain_Inputs = require('../brain/brain_inputs.js');

module.exports = 
{
    name: 'database_Delete_Inputs',
    description: 'Deletes the input or all inputs from the database.',
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
            await Brain_Inputs.remove_Input(brain.Inputs, message, args_message.trim());
        }
        else
        {
            await Brain_Inputs.remove_Inputs(brain.Inputs, message);
        }
    }
};