var Brain_Inputs = require('../brain/brain_inputs.js');

module.exports = 
{
    name: 'database_Inputs_FirstWord',
    description: 'Gets all inputs starting with a particular word.',
    usage: '[Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Inputs.get_InputsWithFirstWord_ForCommand(brain.Inputs, message, args[0]);
        }
    }
};