module.exports = 
{
    async add_Pro_Words(table, existing_words, new_words, debug)
    {
        try 
        {
            for (var i = 0; i < new_words.length; i++)
            {
                await table.findOne({ where: { word: existing_words[i], pro_word: new_words[i] } })
                    .then(result => 
                    {
                        if (!result) 
                        {
                            table.create({ word: existing_words[i], pro_word: new_words[i] });
                        }
                        else
                        {
                            result.increment('frequency');
                        }
                    });
            }
        }
        catch (error) 
        {
            console.error(error);
        }
    },
    async remove_Pro_Word(table, message, existing_word, existing_pro_word)
    {
        await table.destroy({ where: { word: existing_word, pro_word: existing_pro_word } })
            .then(message.channel.send(`Pro-word "${existing_pro_word}" for "${existing_word}" has been removed from the database.`));
    },
    async remove_Pro_Words(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All pro-words have been removed from the database.`));
    },
    async get_Pro_Words_All(table, message)
    {
        try
        {
            var result = await table.findAll({ attributes: ['word', 'pro_word', 'frequency'] });
            if (result != null &&
                result != '')
            {
                for (var i = 0; i < result.length; i++)
                {
                    message.channel.send(`"${result[i].pro_word}" <- "${result[i].word}": ${result[i].frequency}`);
                }

                message.channel.send(`(end transmission)`);
            }
            else
            {
                message.channel.send(`No pro-words found in the database.`);
            }
        }
        catch (error)
        {
            console.error(error);
        }
    },
    async get_Pro_Words(table, message, existing_pro_word)
    {
        var result = await table.findAll({ where: { pro_word: existing_pro_word } });
        if (result != null &&
            result != '')
        {
            for (var i = 0; i < result.length; i++)
            {
                message.channel.send(`"${result[i].pro_word}" <- "${result[i].word}": ${result[i].frequency}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`Could not find pro-word "${existing_pro_word}" in the database.`);
        }
    },
    async get_Pro_Words_Matching(table, message, existing_pro_word, existing_word)
    {
        var result = await table.findAll({ where: { word: existing_word, pro_word: existing_pro_word } });
        if (result != null &&
            result != '')
        {
            for (var i = 0; i < result.length; i++)
            {
                message.channel.send(`"${result[i].pro_word}" <- "${result[i].word}": ${result[i].frequency}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_pro_word}" as pro-word for "${existing_word}" in the database.`);
        }
    },
    async get_Pro_Words_Max(table, existing_word)
    {
        try
        {
            return result = await table.findAll({ where: { word: existing_word } })
                .then(results => 
                {
                    if (results != null &&
                        results != '')
                    {
                        //Get the max frequency of all pre-words for the given word
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

                        return max.pro_word;
                    }
                });
        }
        catch (error)
        {
            console.error(error);
        }

        return null;
    },
    async get_Pro_WordCount(table, existing_word, existing_pro_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pro_word } })
        if (result != null &&
            result != '')
        {
            return result.frequency;
        }
        
        return 0;
    },
    async decrease_Pro_WordCount(table, message, existing_word, existing_pro_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pro_word: existing_pro_word } })
        if (result != null &&
            result != '')
        {
            result.decrement('frequency');
            message.channel.send(`"${result.pro_word}" <- "${result.word}": ${result.frequency - 1}`);
        }
        else
        {
            message.channel.send(`Could not find pro-word "${existing_pro_word}" for "${existing_word}" in the database.`);
        }
    },
    async increase_Pro_WordCount(table, message, existing_word, existing_pro_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pro_word: existing_pro_word } })
        if (result != null &&
            result != '')
        {
            result.increment('frequency');
            message.channel.send(`"${result.pro_word}" <- "${result.word}": ${result.frequency + 1}`);
        }
        else
        {
            message.channel.send(`Could not find pro-word "${existing_pro_word}" for "${existing_word}" in the database.`);
        }
    }
}