var Sequelize = require('sequelize');

module.exports = 
{
    async add_Pre_Words(message, table, words, pre_words, distances)
    {
        try 
        {
            for (var i = 0; i < pre_words.length; i++)
            {
                await table.findOne({ where: { word: words[i], pre_word: pre_words[i], distance: distances[i] } })
                    .then(result => 
                    {
                        if (!result) 
                        {
                            table.create({ word: words[i], pre_word: pre_words[i], distance: distances[i] });
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
    async remove_Pre_Words(table, message, existing_pre_word)
    {
        await table.destroy({ where: { pre_word: existing_pre_word } })
            .then(message.channel.send(`Pre-word "${existing_pre_word}" has been removed from the database.`));
    },
    async remove_Pre_Word(table, message, existing_word, existing_pre_word)
    {
        await table.destroy({ where: { word: existing_word, pre_word: existing_pre_word } })
            .then(message.channel.send(`Pre-word "${existing_pre_word}" for "${existing_word}" has been removed from the database.`));
    },
    async remove_Pre_Words_All(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All pre-words have been removed from the database.`));
    },
    async remove_Blacklisted(table, existing_word)
    {
        var results = await table.findAll({ attributes: ['word', 'pre_word'] });
        if (results)
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
            if (result)
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
        if (result)
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
        if (result)
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
    async get_Pre_Words_Max(message, table, words)
    {
        var chosen_word = null;

        try
        {
            if (words.length > 0)
            {
                var possible_words = [];
                var possible_word_priority = [];
                var data_rows = [];
                var count = 1;
                
                for (var w = 0; w < words.length; w++)
                {
                    var current_word = words[w];

                    //message.channel.send(`Getting pre-words for "${current_word}" at distance ${count}...`);
                    var results = await table.findAll({ where: { word: current_word, distance: count } })
                    if (results)
                    {
                        for (var i = 0; i < results.length; i++)
                        {
                            //message.channel.send(`Pre-Word: "${results[i].pre_word}", Frequency: ${results[i].frequency}`);
                            data_rows.push(results[i]);
                        }
                        
                        count++;
                    }
                }

                for (var i = 0; i < data_rows.length; i++)
                {
                    var word = data_rows[i].word;
                    var pre_word = data_rows[i].pre_word;
                    var frequency = data_rows[i].frequency;
                    var distance = data_rows[i].distance;
    
                    if (distance == 1)
                    {
                        //Get options
                        //message.channel.send(`Adding possible word at Distance 1: Pre-word "${pre_word}"; Frequency ${frequency}`);
                        possible_words.push(pre_word);
                        possible_word_priority.push(frequency);
                    }
                    else if (possible_words.length > 0)
                    {
                        //Reinforce options that match farther distances
                        for (var p = 0; p < possible_words.length; p++)
                        {
                            if (possible_words[p] == pre_word)
                            {
                                //message.channel.send(`Reinforcing possible Pre-Word at Distance ${distance} from Word "${word}": "${possible_words[p]}"`);
                                possible_word_priority[p]++;
                                break;
                            }
                        }
                    }
                }

                //Get max priority from options
                var max = 0;
                for (var p = 0; p < possible_word_priority.length; p++)
                {
                    var priority = possible_word_priority[p];
                    if (priority > max)
                    {
                        max = priority;
                    }
                }
                //message.channel.send(`Max frequency: ${max}`);

                //Get words at max priority
                var priority_words = [];
                for (var p = 0; p < possible_words.length; p++)
                {
                    var word = possible_words[p];
                    var priority = possible_word_priority[p];

                    if (priority == max)
                    {
                        //message.channel.send(`Possible word at max frequency: ${word}`);
                        priority_words.push(word);
                    }
                }

                if (priority_words.length > 1)
                {
                    //message.channel.send(`Found more than one possible word, selecting one at random...`);
                    //If there's more than one, pick at random
                    var choice = Math.floor(Math.random() * (priority_words.length + 1));
                    chosen_word = priority_words[choice];
                }
                else
                {
                    chosen_word = priority_words[0];
                }

                //message.channel.send(`Chosen Pre-Word: ${chosen_word}`);
            }
        }
        catch (error)
        {
            console.error(error);
        }

        return chosen_word;
    },
    async get_Pre_WordCount(table, existing_word, existing_pre_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pre_word } })
        if (result)
        {
            return result.frequency;
        }

        return 0;
    },
    async decrease_Pre_WordCount(table, message, existing_word, existing_pre_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pre_word } })
        if (result)
        {
            result.decrement('frequency');
            //message.channel.send(`"${result.pre_word}" -> "${result.word}": ${result.frequency - 1}`);
        }
        else
        {
            //message.channel.send(`Could not find pre-word "${existing_pre_word}" for "${existing_word}" in the database.`);
        }
    },
    async increase_Pre_WordCount(table, message, existing_word, existing_pre_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pre_word } })
        if (result)
        {
            result.increment('frequency');
            //message.channel.send(`"${result.pre_word}" -> "${result.word}": ${result.frequency + 1}`);
        }
        else
        {
            //message.channel.send(`Could not find pre-word "${existing_pre_word}" for "${existing_word}" in the database.`);
        }
    }
}