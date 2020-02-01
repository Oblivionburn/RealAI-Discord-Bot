var Brain_Inputs = require('./brain_inputs.js');
var Brain_Outputs = require('./brain_outputs.js');
var Brain_Words = require('./brain_words.js');
var Brain_PreWords = require('./brain_pre_words.js');
var Brain_ProWords = require('./brain_pro_words.js');
var Brain_Topics = require('./brain_topics.js');

module.exports = 
{
    async add_Words(brain, table, new_words)
    {
        try 
        {
            for (var i = 0; i < new_words.length; i++)
            {
                await table.findOne({ where: { word: new_words[i] } })
                    .then(result => 
                    {
                        if (!result) 
                        {
                            table.create({ word: new_words[i] })
                                .then(Brain_Inputs.remove_Blacklisted(brain.Inputs, new_words[i]))
                                .then(Brain_Outputs.remove_Blacklisted(brain.Outputs, new_words[i]))
                                .then(Brain_Words.remove_Blacklisted(brain.Words, new_words[i]))
                                .then(Brain_PreWords.remove_Blacklisted(brain.PreWords, new_words[i]))
                                .then(Brain_ProWords.remove_Blacklisted(brain.ProWords, new_words[i]))
                                .then(Brain_Topics.remove_Blacklisted(brain.Topics, new_words[i]));

                            message.channel.send(`"${new_words[i]}" has been added to the blacklist.`);
                        }
                        else
                        {
                            message.channel.send(`"${new_words[i]}" is already blacklisted.`);
                        }
                    })
            }
        }
        catch (error) 
        {
            console.error(error);
        }
    },
    async remove_Word(table, message, existing_word)
    {
        await table.destroy({ where: { word: existing_word } })
            .then(message.channel.send(`"${existing_word}" has been removed from the blacklist.`));
    },
    async remove_Words(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All words have been removed from the blacklist.`));
    },
    async get_Word(table, message, existing_word)
    {
        var results = await table.findAll({ where: { word: existing_word } })
        if (results != null &&
            results != '')
        {
            for (var i = 0; i < results.length; i++)
            {
                message.channel.send(`"${results[i].word}" is currently blacklisted.`);
            }
        }
        else
        {
            message.channel.send(`Could not find "${existing_word}" in the blacklist.`);
        }
    },
    async get_Words(table, message)
    {
        var results = await table.findAll({ attributes: ['word'] });
        if (results != null &&
            results != '')
        {
            for (var i = 0; i < results.length; i++)
            {
                message.channel.send(`"${results[i].word}"\n`);
            }
        }
        else
        {
            return message.channel.send('No words found in the blacklist.');
        }
    },
    async check_Word(table, existing_word)
    {
        var results = await table.findAll({ where: { word: existing_word } });
        if (results != null &&
            results != '')
        {
            return true;
        }

        return false;
    },
    async remove_Word()
    {

    }
}