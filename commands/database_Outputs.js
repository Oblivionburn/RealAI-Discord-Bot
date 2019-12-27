var Brain_Outputs = require('../brain/brain_outputs.js');

module.exports = 
{
    name: 'database_Outputs',
    description: 'Gets all outputs or a single output from the database.',
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
            await Brain_Outputs.get_Outputs(brain.Outputs, message, args_message.trim());
        }
        else
        {
            await Brain_Outputs.get_Outputs_All(brain.Outputs, message);
        }
    }
};