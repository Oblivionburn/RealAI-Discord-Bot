var Brain_Outputs = require('../brain/brain_outputs.js');

module.exports = 
{
    name: 'database_Delete_Outputs',
    description: 'Deletes the outputs for a given input or deletes all outputs from the database.',
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
            await Brain_Outputs.remove_Outputs(brain.Outputs, message, args_message.trim());
        }
        else
        {
            await Brain_Outputs.remove_Outputs_All(brain.Outputs, message);
        }
    }
};