var Sequelize = require('sequelize');
var Util = require('./util.js');

module.exports = 
{
    async add_Pre_Words(message, table_outputs, table_prewords, words, clean_message)
    {
        try 
        {
            var previous_output = clean_message;

            for (var d = 1; d < 11; d++)
            {
                //message.channel.send(`[Debug] Getting output matching "${previous_output}"...`);
                var output = await table_outputs.findAll({ where: { output: previous_output }});
                if (output.length > 0)
                {
                    var input = output[0].input;
                    //message.channel.send(`[Debug] Found Output: "${previous_output}" for Input: "${input}"`);

                    var input_words = Util.GapSpecials(input).split(/ +/);
                    //message.channel.send(`[Debug] Broke up input into: "${input_words}"`);

                    for (var i = 0; i < words.length; i++)
                    {
                        if (input_words.length > i)
                        {
                            //message.channel.send(`[Debug] Checking for Word "${words[i]}" with PreWord "${input_words[i]}" at Distance ${[d]}`);

                            await table_prewords.findOne({ where: { word: words[i], pre_word: input_words[i], distance: [d] } })
                                .then(result => 
                                {
                                    if (!result) 
                                    {
                                        table_prewords.create({ word: words[i], pre_word: input_words[i], distance: [d] });
                                        //message.channel.send(`[Debug] Match not found. Added "${input_words[i]}" as pre-word to "${words[i]}" at Distance ${[d]}`);
                                    }
                                    else
                                    {
                                        result.increment('frequency');
                                        //message.channel.send(`[Debug] Found match, increased Frequency by 1.`);
                                    }
                                });
                        }
                    }

                    previous_output = input;
                }
                else
                {
                    //message.channel.send(`[Debug] Found no output match for "${previous_output}".`);
                    break;
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
    async get_Pre_Word_AtDistance(table, message, existing_word, at_distance)
    {
        var result = await table.findAll({ where: { word: existing_word, distance: at_distance } });
        if (result)
        {
            return result[0].pre_word;
        }
        else
        {
            message.channel.send(`Could not find pre-word "${existing_pre_word}" in the database.`);
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
    async get_Word_From_PreWord_Max(message, table_outputs, table_prewords, previous_output, word, index)
    {
        var chosen_word = null;

        try
        {
            if (word)
            {
                var inputs = [];
                for (let i = 0; i < 10; i++)
                {
                    //message.channel.send(`[Debug] Getting output matching "${previous_output}"...`);
                    var output = await table_outputs.findAll({ where: { output: previous_output }});
                    if (output.length > 0)
                    {
                        var input = output[0].input;
                        //message.channel.send(`[Debug] Found Input: "${input}" for Output: "${previous_output}"`);

                        inputs.push(input);
                        previous_output = input;
                    }
                    else
                    {
                        //message.channel.send(`[Debug] Found no output match for "${previous_output}".`);
                        break;
                    }
                }

                var possible_words = [];
                var possible_word_priority = [];
                var data_rows = [];

                //message.channel.send(`[Debug] Getting words for pre-word "${word}" at distance 1...`);
                var results = await table_prewords.findAll({ where: { pre_word: word, distance: 1 } });
                if (results)
                {
                    for (let i = 0; i < results.length; i++)
                    {
                        //message.channel.send(`[Debug] Word: "${results[i].word}", Frequency: ${results[i].frequency}`);
                        data_rows.push(results[i]);
                    }
                }
                else
                {
                    //message.channel.send(`[Debug] No words found.`);
                }
                
                for (let w = 0; w < data_rows.length; w++)
                {
                    var current_word = data_rows[w].word;
                    var frequency = data_rows[w].frequency;

                    //Get options
                    if (!possible_words.includes(current_word))
                    {
                        //message.channel.send(`[Debug] Adding possible word "${current_word}"; Frequency ${frequency}`);
                        possible_words.push(current_word);
                        possible_word_priority.push(frequency);
                    }

                    for (let i = 0; i < inputs.length; i++)
                    {
                        var input = inputs[i];

                        //message.channel.send(`[Debug] Reinforcing word "${current_word}" from input "${input}"...`);

                        var input_words = Util.GapSpecials(input).split(/ +/);
                        //message.channel.send(`[Debug] Broke up input into: ${input_words}`);

                        if (index < input_words.length)
                        {
                            var input_word = input_words[index];
                            //message.channel.send(`[Debug] Found word "${input_word}" at position ${index}`);

                            //message.channel.send(`[Debug] Checking if word "${input_word}" is a pre_word to "${current_word}" at distance ${i + 2}...`);
                            var result = await table_prewords.findOne({ where: { word: current_word, pre_word: input_word, distance: i + 2 } });
                            if (result)
                            {
                                //message.channel.send(`[Debug] Result: True`);
                                possible_word_priority[w]++;
                                //message.channel.send(`[Debug] Priority for "${current_word}" increased by 1`);
                            }
                            else
                            {
                                //message.channel.send(`[Debug] Result: False`);
                            }
                        }
                        else
                        {
                            //message.channel.send(`[Debug] No word found in "${input}" at position ${index}`);
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
                //message.channel.send(`[Debug] Max frequency of possible words: ${max}`);

                //Get words at max priority
                var priority_words = [];
                for (var p = 0; p < possible_words.length; p++)
                {
                    var current_word = possible_words[p];
                    var priority = possible_word_priority[p];

                    if (priority == max)
                    {
                        //message.channel.send(`[Debug] Possible word at max frequency: ${current_word}`);
                        priority_words.push(current_word);
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

                //message.channel.send(`[Debug] Chosen Pre-Word: ${chosen_word}`);
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