var Util = require('./util.js');

module.exports = 
{
    async add_Input(table, new_input)
    {
        try 
        {
            await table.findOne({ where: { input: new_input } })
                .then(result => 
                {
                    if (!result) 
                    {
                        table.create({ input: new_input });
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
    async remove_Input(table, message, existing_input)
    {
        await table.destroy({ where: { input: existing_input } })
            .then(message.channel.send(`"${existing_input}" has been removed from the database.`));
    },
    async remove_Inputs(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All inputs have been removed from the database.`));
    },
    async remove_Blacklisted(table, existing_word)
    {
        var results = await table.findAll({ attributes: ['input'] });
        if (results != null &&
            results != '')
        {
            for (var i = 0; i < results.length; i++)
            {
                if (results[i].input.includes(existing_word))
                {
                    await table.destroy({ where: { input: results[i].input } })
                }
            }
        }
    },
    async get_Input(table, message, existing_input)
    {
        var results = await table.findAll({ where: { input: existing_input } });
        if (results != null &&
            results != '')
        {
            for (var i = 0; i < results.length; i++)
            {
                message.channel.send(`Input: "${results[i].input}", Frequency: ${results[i].frequency}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_input}" in the database.`);
        }
    },
    async get_Inputs(table, message)
    {
        var results = await table.findAll({ attributes: ['input', 'frequency'] });
        if (results != null &&
            results != '')
        {
            var inputString = "";
            for (var i = 0; i < results.length; i++)
            {
                message.channel.send(`Input: "${results[i].input}", Frequency: ${results[i].frequency}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`No inputs found in the database.`);
        }
    },
    async get_InputCount(table, message, existing_input)
    {
        var result = await table.findOne({ where: { input: existing_input } })
        if (result != null &&
            result != '')
        {
            return result.frequency;
        }
        
        return 0;
    },
    async get_InputsWithFirstWord_ForCommand(table, message, word)
    {
        try
        {
            var results = await table.findAll({ attributes: ['input'] });
            if (results != null &&
                results != '')
            {
                var inputs = [];
                for (var i = 0; i < results.length; i++)
                {
                    var input = results[i].input;
                    var words = Util.GapSpecials(input).split(/ +/);
                    if (words.length > 0)
                    {
                        var first_word = words[0];
                        if (first_word == word)
                        {
                            inputs.push(input);
                        }
                    }
                }

                if (inputs.length > 0)
                {
                    for (var i = 0; i < inputs.length; i++)
                    {
                        message.channel.send(`"${inputs[i]}"`);
                    }
                }
                else
                {
                    message.channel.send(`Could not find any inputs starting with "${word}" in the database.`);
                }
            }
        }
        catch (error)
        {
            message.channel.send(`Error: ${error}`);
        }
    },
    async get_InputsWithFirstWord(table, message, word)
    {
        try
        {
            var results = await table.findAll({ attributes: ['input'] });
            if (results != null &&
                results != '')
            {
                var inputs = [];
                for (var i = 0; i < results.length; i++)
                {
                    var input = results[i].input;
                    var words = Util.GapSpecials(input).split(/ +/);
                    if (words.length > 0)
                    {
                        var first_word = words[0];
                        if (first_word == word)
                        {
                            inputs.push(input);
                        }
                    }
                }

                if (inputs.length > 0)
                {
                    return inputs;
                }
            }
        }
        catch (error)
        {
            message.channel.send(`Error: ${error}`);
        }

        return null;
    },
    async decrease_InputCount(table, message, existing_input)
    {
        var found_input = await table.findOne({ where: { input: existing_input } })
        if (found_input)
        {
            found_input.decrement('frequency');
            message.channel.send(`${found_input.input}: ${found_input.frequency - 1}`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_input}" in the database.`);
        }
    },
    async increase_InputCount(table, message, existing_input)
    {
        var found_input = await table.findOne({ where: { input: existing_input } })
        if (found_input)
        {
            found_input.increment('frequency');
            message.channel.send(`${found_input.input}: ${found_input.frequency + 1}`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_input}" in the database.`);
        }
    }
}