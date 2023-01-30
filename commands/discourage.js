var Brain_PreWords = require('../brain/brain_pre_words.js');
var Brain_ProWords = require('../brain/brain_pro_words.js');
var Brain_Users = require('../brain/brain_users.js');
var Util = require('../brain/util.js');

module.exports = 
{
    name: 'discourage',
    description: 'Decreases frequency of all pre/pro words used to generate the last response, and decreases frequency of topic on last input.',
    async execute(brain, message, args) 
    {
        try
		{
            //message.channel.send(`Getting last response...`);
			var last_response = await Brain_Users.get_User_LastResponse(brain.Users, message.author.id);
            if (last_response)
            {
                //message.channel.send(`Found last response: "${last_response}"`);
                
                //Insert spaces before special characters and split message into separate elements based on spaces
                var word_array = Util.GapSpecials(last_response).split(/ +/);
                //message.channel.send(`Word Array: "${word_array}"`);

                //Remove the first element if it's empty/null
                if (!word_array[0])
                {
                    word_array.shift();
                }

                //message.channel.send(`Getting Pre-Words...`);
                //Get PreWords
                var pre_words = [];
                for (var i = 0; i < word_array.length; i++)
                {
                    var result = await Brain_PreWords.get_Pre_Word_AtDistance(brain.PreWords, message, word_array[i], 1);
                    if (result)
                    {
                        pre_words.push(result);
                    }
                }

                //Decrement PreWords
                for (var i = 0; i < words.length; i++)
                {
                    //message.channel.send(`Decrementing Pre-Word "${pre_words[i]}" for Word "${words[i]}"`);
                    await Brain_PreWords.decrease_Pre_WordCount(brain.PreWords, message, word_array[i], pre_words[i]);
                }

                //message.channel.send(`Getting Pro-Words...`);
                //Get ProWords
                var words = [];
                var pro_words = [];

                for (var i = 0; i < word_array.length - 1; i++)
                {
                    for (var j = i + 1; j <= word_array.length - 1; j++)
                    {
                        if (word_array[i] &&
                            word_array[j])
                        {
                            //message.channel.send(`Found Pro-Word "${word_array[j]}" for Word "${word_array[i]}"`);
                            words.push(word_array[i]);
                            pro_words.push(word_array[j]);
                        }
                    }
                }

                //Decrement ProWords
                for (var i = 0; i < words.length; i++)
                {
                    //message.channel.send(`Decrementing Pro-Word "${pro_words[i]}" for Word "${words[i]}"`);
                    await Brain_ProWords.decrease_Pro_WordCount(brain.ProWords, message, words[i], pro_words[i]);
                }

                message.channel.send(`(discouraged last response: "${last_response}")`);

                //message.channel.send(`Removing last response for user...`);
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