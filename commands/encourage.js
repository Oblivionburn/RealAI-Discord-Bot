var Brain_PreWords = require('../brain/brain_pre_words.js');
var Brain_ProWords = require('../brain/brain_pro_words.js');
var Brain_Topics = require('../brain/brain_topics.js');
var Brain_Users = require('../brain/brain_users.js');
var Util = require('../brain/util.js');

module.exports = 
{
    name: 'encourage',
    description: 'Increases frequency of all pre/pro words used to generate the last response, and increases frequency of topic on last input.',
    async execute(brain, message, args) 
    {
        try
		{
			var last_response = await Brain_Users.get_User_LastResponse(brain.Users, message.author.id);
            if (last_response)
            {
                //Insert spaces before special characters and split message into separate elements based on spaces
                var word_array = Util.GapSpecials(last_response).split(/ +/);

                //Remove the first element if it's empty/null
                if (!word_array[0])
                {
                    word_array.shift();
                }

                //Get PreWords
                var words = [];
                var pre_words = [];

                for (var i = 1; i < word_array.length; i++)
                {
                    for (var j = i - 1; j >= 0; j--)
                    {
                        if (word_array[i] &&
                            word_array[j])
                        {
                            words.push(word_array[i]);
                            pre_words.push(word_array[j]);
                        }
                    }
                }

                //Increment PreWords
                for (var i = 0; i < words.length; i++)
                {
                    await Brain_PreWords.increase_Pre_WordCount(brain.PreWords, message, words[i], pre_words[i]);
                }

                //Get ProWords
                words = [];
                var pro_words = [];

                for (var i = 0; i < word_array.length - 1; i++)
                {
                    for (var j = i + 1; j <= word_array.length - 1; j++)
                    {
                        if (word_array[i] &&
                            word_array[j])
                        {
                            words.push(word_array[i]);
                            pro_words.push(word_array[j]);
                        }
                    }
                }

                //Increment ProWords
                for (var i = 0; i < words.length; i++)
                {
                    await Brain_ProWords.increase_Pro_WordCount(brain.ProWords, message, words[i], pro_words[i]);
                }

                var last_input = await Brain_Users.get_User_LastInput(brain.Users, message.author.id);
                if (last_input)
                {
                    //Increment Topics
                    var topics = Brain_Topics.get_Topics_For_Input(brain.Topics, last_input);
                    if (topics)
                    {
                        for (var i = 0; i < topics.length; i++)
                        {
                            await Brain_Topics.increase_TopicCount(brain.Topics, message, last_input, topics[i]);
                        }
                    }
                }

                message.channel.send(`(encouraged last response: "${last_response}")`);

                await Brain_Users.remove_User_LastResponse(brain.Users, message.author.id);
                message.channel.send(`(new session started with ${message.author.username})`);
            }
            else
            {
                message.channel.send(`(last response not found)`);
            }
		}
		catch (error)
		{
			console.error(error);
		}
    }
};