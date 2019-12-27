module.exports = 
{
    async add_Output(table, new_input, new_output)
    {
        try 
        {
            await table.findOne({ where: { input: new_input, output: new_output } })
                .then(result => 
                {
                    if (!result) 
                    {
                        table.create({ input: new_input, output: new_output });
                    }
                    else
                    {
                        result.increment('frequency');
                    }
                });
        }
        catch (error) 
        {
            console.error(error);
        }
    },
    async remove_Outputs(table, message, existing_input)
    {
        await table.destroy({ where: { input: existing_input } })
            .then(message.channel.send(`All outputs for "${existing_input}" have been removed from the database.`));
    },
    async remove_Outputs_All(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All outputs have been removed from the database.`));
    },
    async get_Outputs(table, message, existing_input)
    {
        var result = await table.findAll({ where: { input: existing_input } });
        if (result != null &&
            result != '')
        {
            var outputString = "";
            for (var i = 0; i < result.length; i++)
            {
                outputString += `"${result.input}" -> "${result.output}": ${result.frequency}\n`;
            }

            message.channel.send(`${outputString}`);
        }
        else
        {
            message.channel.send(`Could not find any outputs for "${existing_input}" in the database.`);
        }
    },
    async get_Outputs_All(table, message)
    {
        var result = await table.findAll({ attributes: ['input', 'output', 'frequency'] });
        if (result != null &&
            result != '')
        {
            var outputString = "";
            for (var i = 0; i < result.length; i++)
            {
                outputString += `"${result[i].input}" -> "${result[i].output}": ${result[i].frequency}\n`;
            }

            message.channel.send(`${outputString}`);
        }
        else
        {
            message.channel.send(`No outputs found in the database.`);
        }
    },
    async get_Outputs_For_Input(table, message, existing_input)
    {
        var results = await table.findAll({ where: { input: existing_input } });
        if (results != null &&
            results != '')
        {
            var outputs = [];
            for (var i = 0; i < results.length; i++)
            {
                outputs.push(results[i].output);
            }

            return outputs;
        }
        
        return null;
    },
    async get_Outputs_Max(table, existing_input)
    {
        try
        {
            return result = await table.findAll({ where: { input: existing_input } })
                .then(results => 
                {
                    if (results != null &&
                        results != '')
                    {
                        //Get the max frequency of all outputs for the given input
                        var max = results[0];
                        for (var i = 0; i < results.length; i++)
                        {
                            if (results[i].frequency >= max.frequency)
                            {
                                max = results[i];
                            }
                        }

                        //Randomly select one, with a bias towards those with higher frequency
                        for (var i = 0; i < results.length; i++)
                        {
                            //Gen random number between 0 and max frequency
                            var random = Math.floor(Math.random() * (max.frequency + 1));
                            if (results[i].frequency >= random)
                            {
                                max = results[i];
                                break;
                            }
                        }

                        return max.output;
                    }
                });
        }
        catch (error)
        {
            console.error(error);
        }

        return null;
    },
    async get_OutputCount(table, existing_input, existing_output)
    {
        var result = await table.findOne({ where: { input: existing_input, output: existing_output } })
        if (result != null &&
            result != '')
        {
            return result.frequency;
        }
        
        return 0;
    },
    async decrease_OutputCount(table, message, existing_input, existing_output)
    {
        var result = await table.findOne({ where: { input: existing_input, output: existing_output } })
        if (result != null &&
            result != '')
        {
            result.decrement('frequency');
            message.channel.send(`"${result.input}" -> "${result.output}": ${result.frequency} -> ${result.frequency - 1}`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_output}" as output for "${existing_input}" in the database.`);
        }
    },
    async increase_OutputCount(table, message, existing_input, existing_output)
    {
        var result = await table.findOne({ where: { input: existing_input, output: existing_output } })
        if (result != null &&
            result != '')
        {
            result.increment('frequency');
            message.channel.send(`"${result.input}" -> "${result.output}": ${result.frequency} -> ${result.frequency + 1}`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_output}" as output for "${existing_input}" in the database.`);
        }
    }
}