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
    async remove_Pro_Words(table, message, existing_pro_word)
    {
        await table.destroy({ where: { pro_word: existing_pro_word } })
            .then(message.channel.send(`Pro-word "${existing_pro_word}" has been removed from the database.`));
    },
    async remove_Pro_Word(table, message, existing_word, existing_pro_word)
    {
        await table.destroy({ where: { word: existing_word, pro_word: existing_pro_word } })
            .then(message.channel.send(`Pro-word "${existing_pro_word}" for "${existing_word}" has been removed from the database.`));
    },
    async remove_Pro_Words_All(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All pro-words have been removed from the database.`));
    },
    async remove_Blacklisted(table, existing_word)
    {
        var results = await table.findAll({ attributes: ['word', 'pro_word'] });
        if (results)
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
            if (result)
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
        if (result)
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
        if (result)
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
    async get_Pro_Words_Max(message, table, words, current_word, predicted_word)
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
                
                for (var w = words.length - 1; w >= 0; w--)
                {
                    var current_word = words[w];

                    //message.channel.send(`[Debug] Getting pro-words for "${current_word}" at distance ${count}...`);
                    var results = await table.findAll({ where: { word: current_word, distance: count } })
                    if (results)
                    {
                        for (var i = 0; i < results.length; i++)
                        {
                            //message.channel.send(`[Debug] Pro-Word: "${results[i].pro_word}", Frequency: ${results[i].frequency}`);
                            data_rows.push(results[i]);
                        }
                        
                        count++;
                    }
                }

                for (var i = 0; i < data_rows.length; i++)
                {
                    var word = data_rows[i].word;
                    var pro_word = data_rows[i].pro_word;
                    var frequency = data_rows[i].frequency;
                    var distance = data_rows[i].distance;
    
                    if (distance == 1)
                    {
                        //Get options
                        //message.channel.send(`[Debug] Adding possible word at Distance 1: Pro-word "${pro_word}"; Frequency ${frequency}`);
                        possible_words.push(pro_word);
                        possible_word_priority.push(frequency);
                    }
                    else if (possible_words.length > 0)
                    {
                        //Reinforce options that match farther distances
                        for (var p = 0; p < possible_words.length; p++)
                        {
                            if (possible_words[p] == predicted_word)
                            {
                                //message.channel.send(`[Debug] Reinforcing predicted Pro-Word at Distance ${distance} from Word "${word}": "${possible_words[p]}"`);
                                possible_word_priority[p]++;
                            }

                            if (possible_words[p] == pro_word)
                            {
                                //message.channel.send(`[Debug] Reinforcing possible Pro-Word at Distance ${distance} from Word "${word}": "${possible_words[p]}"`);
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
                //message.channel.send(`[Debug] Max frequency: ${max}`);

                //Get words at max priority
                var priority_words = [];
                for (var p = 0; p < possible_words.length; p++)
                {
                    var word = possible_words[p];
                    var priority = possible_word_priority[p];

                    if (priority == max)
                    {
                        //message.channel.send(`[Debug] Possible word at max frequency: ${word}`);
                        priority_words.push(word);
                    }
                }

                if (priority_words.length > 1)
                {
                    //message.channel.send(`[Debug] Found more than one possible word, selecting one at random...`);
                    //If there's more than one, pick at random
                    var choice = Math.floor(Math.random() * (priority_words.length + 1));
                    chosen_word = priority_words[choice];
                }
                else
                {
                    chosen_word = priority_words[0];
                }

                //message.channel.send(`[Debug] Chosen Pro-Word: ${chosen_word}`);
            }
        }
        catch (error)
        {
            console.error(error);
        }

        return chosen_word;
    },
    async get_Pro_WordCount(table, existing_word, existing_pro_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pre_word: existing_pro_word } })
        if (result)
        {
            return result.frequency;
        }
        
        return 0;
    },
    async decrease_Pro_WordCount(table, message, existing_word, existing_pro_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pro_word: existing_pro_word } })
        if (result)
        {
            result.decrement('frequency');
            //message.channel.send(`"${result.pro_word}" <- "${result.word}": ${result.frequency - 1}`);
        }
        else
        {
            //message.channel.send(`Could not find pro-word "${existing_pro_word}" for "${existing_word}" in the database.`);
        }
    },
    async increase_Pro_WordCount(table, message, existing_word, existing_pro_word)
    {
        var result = await table.findOne({ where: { word: existing_word, pro_word: existing_pro_word } })
        if (result)
        {
            result.increment('frequency');
            //message.channel.send(`"${result.pro_word}" <- "${result.word}": ${result.frequency + 1}`);
        }
        else
        {
            //message.channel.send(`Could not find pro-word "${existing_pro_word}" for "${existing_word}" in the database.`);
        }
    }
}