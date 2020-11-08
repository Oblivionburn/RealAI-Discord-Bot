var Sequelize = require('sequelize');

module.exports = 
{
    async add_Pre_Words(message, table, existing_words, new_words, distances)
    {
        try 
        {
            for (var i = 0; i < new_words.length; i++)
            {
                await table.findOne({ where: { word: existing_words[i], pre_word: new_words[i], distance: distances[i] } })
                    .then(result => 
                    {
                        if (!result) 
                        {
                            table.create({ word: existing_words[i], pre_word: new_words[i], distance: distances[i] });
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
    async discourage_PreWords(table_words, table_prewords, existing_word, pre_word)
    {
        try
        {
            var preword_results = await table_prewords.findAll({ where: { word: existing_word, distance: 1 } })
            if (preword_results)
            {
                for (var i = 0; i < preword_results.length; i++)
                {
                    var existing_pre_word = preword_results[i].pre_word;
                    if (existing_pre_word != pre_word)
                    {
                        var words_result = await table_words.findOne({ where: { word: existing_pre_word, distance: 1 } });
                        if (words_result)
                        {
                            if (words_result.frequency < 3)
                            {
                                preword_results[i].frequency = preword_results[i].frequency - 1;
                                if (preword_results[i].frequency == 0)
                                {
                                    await table_prewords.destroy({ where: { word: existing_word, pre_word: existing_pre_word, distance: 1 } });
                                }
                                else
                                {
                                    await table_prewords.update({ frequency: Sequelize.literal('frequency - 1') }, { where: { word: existing_word, pre_word: existing_pre_word, distance: 1 } });
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
    async remove_Pre_Word(table, message, existing_word, existing_pre_word)
    {
        await table.destroy({ where: { word: existing_word, pre_word: existing_pre_word } })
            .then(message.channel.send(`Pre-word "${existing_pre_word}" for "${existing_word}" has been removed from the database.`));
    },
    async remove_Pre_Words(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All pre-words have been removed from the database.`));
    },
    async remove_Blacklisted(table, existing_word)
    {
        var results = await table.findAll({ attributes: ['word', 'pre_word'] });
        if (results != null &&
            results != '')
        {
            for (var i = 0; i < results.length; i++)
            {
                if (results[i].word == existing_word)
                {
                    await table.destroy({ where: { word: results[i].word } })
                }
                else if (results[i].pre_word == existing_word)
                {
                    await table.destroy({ where: { pre_word: results[i].pre_word } })
                }
            }
        }
    },
    async get_Pre_Words_All(table, message)
    {
        try
        {
            var result = await table.findAll({ attributes: ['word', 'pre_word', 'frequency', 'distance'] });
            if (result != null &&
                result != '')
            {
                for (var i = 0; i < result.length; i++)
                {
                    message.channel.send(`Pre-Word: "${result[i].pre_word}" -> Word: "${result[i].word}", Frequency: ${result[i].frequency}, Distance: ${result[i].distance}`);
                }

                message.channel.send(`(end transmission)`);
            }
            else
            {
                return message.channel.send('No pre-words found in the database.');
            }
        }
        catch (error)
        {
            console.error(error);
        }
    },
    async get_Pre_Words(table, message, existing_pre_word)
    {
        var result = await table.findAll({ where: { word: existing_pre_word } });
        if (result != null &&
            result != '')
        {
            for (var i = 0; i < result.length; i++)
            {
                message.channel.send(`Pre-Word: "${result[i].pre_word}" -> Word: "${result[i].word}", Frequency: ${result[i].frequency}, Distance: ${result[i].distance}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`Could not find pre-word "${existing_pre_word}" in the database.`);
        }
    },
    async get_Pre_Words_Matching(table, message, existing_pre_word, existing_word)
    {
        var result = await table.findAll({ where: { word: existing_word, pre_word: existing_pre_word } });
        if (result != null &&
            result != '')
        {
            for (var i = 0; i < result.length; i++)
            {
                message.channel.send(`Pre-Word: "${result[i].pre_word}" -> Word: "${result[i].word}", Frequency: ${result[i].frequency}, Distance: ${result[i].distance}`);
            }

            message.channel.send(`(end transmission)`);
        }
        else
        {
            message.channel.send(`Could not find "${existing_pre_word}" as pre-word for "${existing_word}" in the database.`);
        }
    },
    async get_Pre_Words_For(table, existing_word)
    {
        return await table.findAll({ where: { word: existing_word } });
    },
    async get_Pre_Words_Max(message, table, words, current_word)
    {
        try
        {
            var results = await table.findAll({ where: { word: current_word, distance: 1 } })
            if (results)
            {
                //message.channel.send(`Getting pre-words for "${current_word}"...`);

                //Get the max frequency in the results
                var selected = results[0];
                var max = results[0].frequency;
                
                for (var i = 0; i < results.length; i++)
                {
                    //message.channel.send(`Pre-Word: "${results[i].pre_word}", Frequency: ${results[i].frequency}`);
                    if (results[i].frequency >= max)
                    {
                        max = results[i].frequency;
                        selected = results[i];
                    }
                }

                //message.channel.send(`Max Frequency: ${selected.frequency}`);

                //Get highest frequency pre_word with a distance of 2 for the previous word
                var reinforced = selected;
                //message.channel.send(`Reinforcing pre-word: "${reinforced.pre_word}"`);

                if (words.length > 1)
                {
                    //message.channel.send(`Getting pre-words 2 before for "${words[1]}"...`);

                    var previous_words = await table.findAll({ where: { word: words[1], distance: 2 } });
                    if (previous_words)
                    {
                        var highest = previous_words[0];
                        for (var i = 0; i < previous_words.length; i++)
                        {
                            //message.channel.send(`Pre-Word: "${previous_words[i].pre_word}", Frequency: ${previous_words[i].frequency}`);
                            if (previous_words[i].frequency >= highest.frequency)
                            {
                                highest = previous_words[i];
                            }
                        }

                        reinforced = highest;
                        //message.channel.send(`Now reinforcing pre-word: "${reinforced.pre_word}"`);

                        max += reinforced.frequency;
                        //message.channel.send(`Adjusted max: ${max}`);
                    }
                }

                //Randomly select one, with a bias towards those with higher frequency
                for (var i = 0; i < results.length; i++)
                {
                    //message.channel.send(`Choose "${results[i].pre_word}"?`);

                    //Gen random number between 0 and max frequency
                    var random = Math.floor(Math.random() * (max + 1));
                    //message.channel.send(`Random number: ${random}`);

                    //Get frequency
                    var value = results[i].frequency;
                    //message.channel.send(`Frequency of "${results[i].pre_word}" is ${value}`);

                    //Add bias towards reinforced word
                    if (results[i].pre_word == reinforced.pre_word)
                    {
                        //message.channel.send(`"${results[i].pre_word}" matches reinforced pre-word "${reinforced.pre_word}"`);
                        value += reinforced.frequency;

                        //message.channel.send(`Adjusted weight for "${results[i].pre_word}": ${value}`);
                    }

                    if (value >= random)
                    {
                        //message.channel.send(`${value} is greater than random value ${random}`);

                        selected = results[i];
                        //message.channel.send(`"${selected.pre_word}" has been chosen.`);

                        break;
                    }
                }

                return selected.pre_word;
            }
        }
        catch (error)
        {
            console.error(error);
        }

        return null;
    },
    async get_Pre_WordCount(table, existing_word, existing_pre_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pre_word } })
        if (result != null &&
            result != '')
        {
            return result.frequency;
        }

        return 0;
    },
    async decrease_Pre_WordCount(table, message, existing_word, existing_pre_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pre_word } })
        if (result != null &&
            result != '')
        {
            result.decrement('frequency');
            message.channel.send(`"${result.pre_word}" -> "${result.word}": ${result.frequency - 1}`);
        }
        else
        {
            message.channel.send(`Could not find pre-word "${existing_pre_word}" for "${existing_word}" in the database.`);
        }
    },
    async increase_Pre_WordCount(table, message, existing_word, existing_pre_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pre_word } })
        if (result != null &&
            result != '')
        {
            result.increment('frequency');
            message.channel.send(`"${result.pre_word}" -> "${result.word}": ${result.frequency + 1}`);
        }
        else
        {
            message.channel.send(`Could not find pre-word "${existing_pre_word}" for "${existing_word}" in the database.`);
        }
    }
}