module.exports = 
{
    async add_Topic(table, new_input, new_topic)
    {
        try 
        {
            await table.findOne({ where: { input: new_input, topic: new_topic } })
                .then(result => 
                {
                    if (!result) 
                    {
                        table.create(
                        { 
                            input: new_input, 
                            topic: new_topic 
                        });
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
    async remove_Topic(table, message, existing_input, existing_topic)
    {
        await table.destroy({ where: { input: existing_input, topic: existing_topic } })
            .then(message.channel.send(`"${existing_topic}" topic for "${existing_input}" has been removed from the database.`));
    },
    async remove_Topics(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All topics have been removed from the database.`));
    },
    async get_Topics_All(table, message)
    {
        var wordString = "";

        var results = await table.findAll({ attributes: ['input', 'topic', 'frequency'] });
        for (var i = 0; i < results.length; i++)
        {
            wordString += `"${results[i].input}" -> "${results[i].topic}": ${results[i].frequency}\n`;
        }

        if (wordString.length > 0)
        {
            return message.channel.send(`${wordString}`);
        }
        else
        {
            return message.channel.send('No topics found in the database.');
        }
    },
    async get_Topics(table, message, existing_topic)
    {
        var results = await table.findAll({ where: { topic: existing_topic } })
        if (results != null &&
            results != '')
        {
            var wordString = "";
            for (var i = 0; i < results.length; i++)
            {
                wordString += `"${results[i].input}" -> "${results[i].topic}": ${results[i].frequency}\n`;
            }

            message.channel.send(`${wordString}`);
        }
        else
        {
            message.channel.send(`Could not find topic "${existing_topic}" in the database.`);
        }
    },
    async get_Topics_Input(table, message, existing_input)
    {
        var results = await table.findAll({ where: { input: existing_input } })
        if (results != null &&
            results != '')
        {
            var wordString = "";
            for (var i = 0; i < results.length; i++)
            {
                wordString += `"${results[i].input}" -> "${results[i].topic}": ${results[i].frequency}\n`;
            }

            message.channel.send(`${wordString}`);
        }
        else
        {
            message.channel.send(`Could any topics for "${existing_input}" in the database.`);
        }
    },
    async get_Inputs_With_Topic(table, existing_topic)
    {
        var results = await table.findAll({ where: { topic: existing_topic } })
        if (results != null &&
            results != '')
        {
            var inputs = [];
            for (var i = 0; i < results.length; i++)
            {
                inputs.push(results[i].input)
            }

            return inputs;
        }

        return null;
    },
    async get_Topics_For_Input(table, existing_input)
    {
        var results = await table.findAll({ where: { input: existing_input } })
        if (results != null &&
            results != '')
        {
            var topics = [];
            for (var i = 0; i < results.length; i++)
            {
                topics.push(results[i].topic)
            }

            return topics;
        }

        return null;
    },
    async get_TopicCount(table, existing_topic)
    {
        var result = await table.findOne({ where: { topic: existing_topic } })
        if (result != null &&
            result != '')
        {
            return result.frequency;
        }
        
        return 0;
    },
    async get_Topic_Max(table, existing_input)
    {
        try
        {
            return result = await table.findAll({ where: { input: existing_input } })
                .then(results => 
                {
                    if (results != null &&
                        results != '')
                    {
                        var max = results[0];
                        for (var i = 0; i < results.length; i++)
                        {
                            if (results[i].frequency >= max.frequency)
                            {
                                max = results[i];
                            }
                        }

                        return max.topic;
                    }
                });
        }
        catch (error)
        {
            console.error(error);
        }

        return null;
    },
    async decrease_TopicCount(table, message, existing_input, existing_topic)
    {
        var result = await table.findOne({ where: { input: existing_input, topic: existing_topic } })
        if (result != null &&
            result != '')
        {
            result.decrement('frequency');
            message.channel.send(`"${wordList[i].input}" -> "${wordList[i].topic}": ${wordList[i].frequency} -> ${wordList[i].frequency - 1}`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_topic}" in the database.`);
        }
    },
    async increase_TopicCount(table, message, existing_input, existing_topic)
    {
        var result = await table.findOne({ where: { input: existing_input, topic: existing_topic } })
        if (result != null &&
            result != '')
        {
            result.increment('frequency');
            message.channel.send(`"${wordList[i].input}" -> "${wordList[i].topic}": ${wordList[i].frequency} -> ${wordList[i].frequency + 1}`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_topic}" in the database.`);
        }
    }
}