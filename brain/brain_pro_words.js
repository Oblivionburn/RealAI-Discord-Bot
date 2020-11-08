module.exports = 
{
    async add_Pro_Words(message, table, existing_words, new_words, distances)
    {
        try 
        {
            for (var i = 0; i < new_words.length; i++)
            {
                await table.findOne({ where: { word: existing_words[i], pro_word: new_words[i], distance: distances[i] } })
                    .then(result => 
                    {
                        if (!result)
                        {
                            table.create({ word: existing_words[i], pro_word: new_words[i], distance: distances[i] });
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
    async discourage_ProWords(table_words, table_prowords, existing_word, pro_word)
    {
        try
        {
            var proword_results = await table_prowords.findAll({ where: { word: existing_word, distance: 1 } })
            if (proword_results)
            {
                for (var i = 0; i < proword_results.length; i++)
                {
                    var existing_pro_word = proword_results[i].pro_word;
                    if (existing_pro_word != pro_word)
                    {
                        var words_result = await table_words.findOne({ where: { word: existing_pro_word, distance: 1 } });
                        if (words_result)
                        {
                            if (words_result.frequency < 3)
                            {
                                proword_results[i].frequency = proword_results[i].frequency - 1;
                                if (proword_results[i].frequency == 0)
                                {
                                    await table_prowords.destroy({ where: { word: existing_word, pro_word: existing_pro_word, distance: 1 } });
                                }
                                else
                                {
                                    await table_prowords.update({ frequency: Sequelize.literal('frequency - 1') }, { where: { word: existing_word, pro_word: existing_pro_word, distance: 1 } });
                                }
                            }
                        }
                    }
                }
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
    async remove_Blacklisted(table, existing_word)
    {
        var results = await table.findAll({ attributes: ['word', 'pro_word'] });
        if (results != null &&
            results != '')
        {
            for (var i = 0; i < results.length; i++)
            {
                if (results[i].word == existing_word)
                {
                    await table.destroy({ where: { word: results[i].word } })
                }
                else if (results[i].pro_word == existing_word)
                {
                    await table.destroy({ where: { pro_word: results[i].pro_word } })
                }
            }
        }
    },
    async get_Pro_Words_All(table, message)
    {
        try
        {
            var result = await table.findAll({ attributes: ['word', 'pro_word', 'frequency', 'distance'] });
            if (result != null &&
                result != '')
            {
                for (var i = 0; i < result.length; i++)
                {
                    message.channel.send(`Word: "${result[i].word}" -> Pro-Word: "${result[i].pro_word}", Frequency: ${result[i].frequency}, Distance: ${result[i].distance}`);
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
        var result = await table.findAll({ where: { word: existing_pro_word } });
        if (result != null &&
            result != '')
        {
            for (var i = 0; i < result.length; i++)
            {
                message.channel.send(`Word: "${result[i].word}" -> Pro-Word: "${result[i].pro_word}", Frequency: ${result[i].frequency}, Distance: ${result[i].distance}`);
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
                message.channel.send(`Word: "${result[i].word}" -> Pro-Word: "${result[i].pro_word}", Frequency: ${result[i].frequency}, Distance: ${result[i].distance}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_pro_word}" as pro-word for "${existing_word}" in the database.`);
        }
    },
    async get_Pro_Words_Max(message, table, words, current_word)
    {
        try
        {
            var results = await table.findAll({ where: { word: current_word, distance: 1 } })
            if (results)
            {
                //message.channel.send(`Getting pro-words for "${current_word}"...`);

                //Get the max frequency in the results
                var selected = results[0];
                var max = results[0].frequency;

                for (var i = 0; i < results.length; i++)
                {
                    //message.channel.send(`Pro-Word: "${results[i].pro_word}", Frequency: ${results[i].frequency}`);
                    if (results[i].frequency >= max)
                    {
                        max = results[i].frequency;
                        selected = results[i];
                    }
                }

                //message.channel.send(`Max Frequency: ${selected.frequency}`);

                //Get highest frequency pro_word with a distance of 2 for the previous word
                var reinforced = selected;
                //message.channel.send(`Reinforcing pro-word: "${reinforced.pro_word}"`);

                if (words.length > 1)
                {
                    //message.channel.send(`Getting pro-words 2 after for "${words[words.length - 2]}"...`);

                    var previous_words = await table.findAll({ where: { word: words[words.length - 2], distance: 2 } });
                    if (previous_words)
                    {
                        var highest = previous_words[0];
                        for (var i = 0; i < previous_words.length; i++)
                        {
                            //message.channel.send(`Pro-Word: "${previous_words[i].pro_word}", Frequency: ${previous_words[i].frequency}`);

                            if (previous_words[i].frequency >= highest.frequency)
                            {
                                highest = previous_words[i];
                            }
                        }

                        reinforced = highest;
                        //message.channel.send(`Now reinforcing pro-word: "${reinforced.pro_word}"`);

                        max += reinforced.frequency;
                        //message.channel.send(`Adjusted max: ${max}`);
                    }
                }

                //Randomly select one, with a bias towards those with higher frequency
                for (var i = 0; i < results.length; i++)
                {
                    //message.channel.send(`Choose "${results[i].pro_word}"?`);

                    //Gen random number between 0 and max frequency
                    var random = Math.floor(Math.random() * (max + 1));
                    //message.channel.send(`Random number: ${random}`);

                    //Get frequency
                    var value = results[i].frequency;
                    //message.channel.send(`Frequency of "${results[i].pro_word}" is ${value}`);

                    //Add bias towards reinforced word
                    if (results[i].pro_word == reinforced.pro_word)
                    {
                        //message.channel.send(`"${results[i].pro_word}" matches reinforced pro-word "${reinforced.pro_word}"`);

                        value += reinforced.frequency;
                        //message.channel.send(`Adjusted weight: ${value}`);
                    }

                    if (value >= random)
                    {
                        //message.channel.send(`${value} is greater than random value ${random}`);

                        selected = results[i];
                        //message.channel.send(`"${selected.pro_word}" has been chosen.`);

                        break;
                    }
                }

                return selected.pro_word;
            }
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