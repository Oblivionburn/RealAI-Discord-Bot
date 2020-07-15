//Required libs
var Discord = require('discord.js');
var fs = require('fs');

//Required files
var { token, prefix, debug } = require('./config.json');
var Brain = require('./brain/brain.js');
var Brain_Inputs = require('./brain/brain_inputs.js');
var Brain_Outputs = require('./brain/brain_outputs.js');
var Brain_Words = require('./brain/brain_words.js');
var Brain_PreWords = require('./brain/brain_pre_words.js');
var Brain_ProWords = require('./brain/brain_pro_words.js');
var Brain_Users = require('./brain/brain_users.js');
var Brain_Topics = require('./brain/brain_topics.js');
var Util = require('./brain/util.js');
var Brain_Words_Blacklist = require('./brain/brain_words_blacklist.js');

//Setup client
var client = new Discord.Client();
client.commands = new Discord.Collection();
var cooldowns = new Discord.Collection();

//Import commands
var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (var file of commandFiles) 
{
	var command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

//Setup database
var brain = new Brain();

//Start bot
client.once('ready', () => 
{
    brain.init_Brain();
    console.log('Ready!'); 
});

//Log in to server
client.login(token);
console.log('Logged in!');

if (debug)
{
    console.log('Debugging On');
}

//Listen for messages
client.on('message', async message => 
{
    try
    {
        var users = message.mentions.users;
        var roles = message.mentions.roles;

        var taggedUser = users.first();
        var botUser_PC = `<@!${client.user.id}>`;
        var botUser_Mobile = `<@${client.user.id}>`;

        //Check if tagged the bot
        if (!message.content.startsWith(botUser_PC) && !message.content.startsWith(botUser_Mobile)) { return; }

        //Check if message is not coming from another bot
        if (message.author.bot) { return; }

        console.log(message.content);

        if (taggedUser.id === client.user.id)
        {
            //Get message after bot's tag
            var real_message = "";
            if (message.content.startsWith(botUser_PC))
            {
                real_message = message.content.slice(botUser_PC.length).trim();
            }
            else if (message.content.startsWith(botUser_Mobile))
            {
                real_message = message.content.slice(botUser_Mobile.length).trim();
            }
            
            //Strip out mentions of users
            if (users.size > 1)
            {
                for (var [string, User] of users)
                {
                    var id = User.id;
                    if (id != client.user.id)
                    {
                        var user_pc = "<@!" + id + ">";
                        while (real_message.includes(user_pc))
                        {
                            real_message = real_message.replace(user_pc, "");
                        }

                        var user_mobile = "<@" + id + ">";
                        while (real_message.includes(user_mobile))
                        {
                            real_message = real_message.replace(user_mobile, "");
                        }
                    }
                }
            }

            //Strip out mentions of roles
            if (roles.size > 0)
            {
                for (var [string, Role] of roles)
                {
                    var id = Role.id;

                    var role_pc = "<@&" + id + ">";
                    while (real_message.includes(role_pc))
                    {
                        real_message = real_message.replace(role_pc, "");
                    }

                    var role_mobile = "<@" + id + ">";
                    while (real_message.includes(role_mobile))
                    {
                        real_message = real_message.replace(role_mobile, "");
                    }
                }
            }

            if (real_message)
            {
                var using_command = false;

                //Check for it being a command
                if (real_message.length > 1 &&
                   (real_message.startsWith(prefix) && !Util.SpecialCharacters().includes(real_message[1])))
                {
                    //Get command name and args
                    var args = real_message.slice(prefix.length).trim().split(/ +/);
                    var commandName = args.shift();
    
                    //Get command using name or alias
                    var command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                    if (command)
                    {
                        using_command = true;
    
                        //Handle command cooldown
                        if (!cooldowns.has(command.name)) 
                        {
                            cooldowns.set(command.name, new Discord.Collection());
                        }
    
                        var now = Date.now();
                        const timestamps = cooldowns.get(command.name);
                        const cooldownAmount = command.cooldown * 1000;
    
                        if (timestamps.has(message.author.id)) 
                        {
                            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
                            if (now < expirationTime) 
                            {
                                const timeLeft = (expirationTime - now) / 1000;
                                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
                            }
                        }
    
                        timestamps.set(message.author.id, now);
                        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
                        //Check for existing command
                        if (client.commands.has(command.name))
                        {
                            //Restrict database commands
                            if (commandName.includes('database') &&
                                !commandName.includes('help'))
                            {
                                if (message.member.highestRole.hasPermission('ADMINISTRATOR'))
                                {
                                    try 
                                    {
                                        await command.execute(brain, message, args);
                                    }
                                    catch (error) 
                                    {
                                        console.error(error);
                                    }
                                }
                                else
                                {
                                    message.channel.send(`You do not have permission to use that command.`);
                                }
                            }
                            else 
                            {
                                try 
                                {
                                    //Execute normal command
                                    await command.execute(brain, message, args);
                                }
                                catch (error) 
                                {
                                    console.error(error);
                                }
                            }
                        }
                        else
                        {
                            message.channel.send(`I'm sorry ${message.author.username}, I'm afraid I can't do that.`);
                        }
                    }
                    else
                    {
                        message.channel.send(`I'm sorry ${message.author.username}, I'm afraid I can't do that.`);
                    }
                }
    
                if (!using_command)
                {
                    //Add input/words/pre-words/pro-words to database
                    var words = await AddData(message, real_message);
                    if (words)
                    {
                        //Format input to store as output and last response for the user
                        var clean_message = Util.RulesCheck(message, real_message.trim());
    
                        //Add outputs if there was a last_response stored for the user
                        var last_response = await Brain_Users.get_User_LastResponse(brain.Users, message.author.id);
                        if (last_response)
                        {
                            await Brain_Outputs.add_Output(brain.Outputs, last_response, clean_message);
                        }
    
                        //Respond
                        var response = await Respond(message, clean_message, words);
                        if (response)
                        {
                            message.channel.send(response, {tts: message.tts});
    
                            //Update user with last response
                            await Brain_Users.add_User(brain.Users, message.author.id, message.author.username, clean_message, response);
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
});

async function AddData(message, real_message)
{
    try
    {
        //Insert spaces before special characters and split message into separate elements based on spaces
        var words = Util.GapSpecials(real_message).split(/ +/);

        //Remove the first element if it's empty/null
        if (!words[0])
        {
            words.shift();
        }

        //Remove any blacklisted words
        for (var i = 0; i < words.length; i++)
        {
            var blacklisted = await Brain_Words_Blacklist.check_Word(brain.WordsBlackList, words[i]);
            if (blacklisted)
            {
                words.splice(i, 1);
                real_message = real_message.replace(words[i], "");
                i--;
            }
        }

        if (words.length > 0)
        {
            //Format the message to add as input
            var clean_message = Util.RulesCheck(message, real_message.trim());
            await Brain_Inputs.add_Input(brain.Inputs, clean_message);

            //Add individual words/counts
            await Brain_Words.add_Words(brain.Words, words);

            //Add pre-words and pro-words
            await AddPreWords(message, words);
            await AddProWords(message, words);

            return words;
        }
    }
    catch (error)
    {
        console.error(error);
    }

    return null;
}

async function AddPreWords(message, word_array)
{
    var words = [];
    var pre_words = [];
    var distances = [];

    try
    {
        for (var i = 1; i < word_array.length; i++)
        {
            var count = 1;
            for (var j = i - 1; j >= 0; j--)
            {
                if (word_array[i] &&
                    word_array[j])
                {
                    words.push(word_array[i]);
                    pre_words.push(word_array[j]);
                    distances.push(count);
                    count++;
                }
            }
        }
    
        if (words)
        {
            await Brain_PreWords.add_Pre_Words(message, brain.PreWords, words, pre_words, distances);

            for (var i = 0; i < words.length; i++)
            {
                await Brain_PreWords.discourage_PreWords(brain.Words, brain.PreWords, words[i], pre_words[i]);
            }
        }
    }
    catch (error)
    {
        console.error(error);
    }
}

async function AddProWords(message, word_array)
{
    var words = [];
    var pro_words = [];
    var distances = [];

    try
    {
        for (var i = 0; i < word_array.length - 1; i++)
        {
            var count = 1;
            for (var j = i + 1; j <= word_array.length - 1; j++)
            {
                if (word_array[i] &&
                    word_array[j])
                {
                    words.push(word_array[i]);
                    pro_words.push(word_array[j]);
                    distances.push(count);
                    count++;
                }
            }
        }
    
        if (words)
        {
            await Brain_ProWords.add_Pro_Words(message, brain.ProWords, words, pro_words, distances);

            for (var i = 0; i < words.length; i++)
            {
                await Brain_ProWords.discourage_ProWords(brain.Words, brain.ProWords, words[i], pro_words[i]);
            }
        }
    }
    catch (error)
    {
        console.error(error);
    }
}

async function Respond(message, input, words)
{
    try
    {
        //Get the topic based on which word has the lowest count
        var topic = await Brain_Words.get_Word_Min(brain.Words, message, words);
        if (topic)
        {
            //Add topic for this input
            await Brain_Topics.add_Topic(brain.Topics, input, topic);

            var output_pool = [];

            //Get inputs with a matching topic
            var inputs = await Brain_Topics.get_Inputs_With_Topic(brain.Topics, topic);
            if (inputs.length > 0)
            {
                for (var i = 0; i < inputs.length; i++)
                {
                    //Get the outputs for each input
                    var output = await Brain_Outputs.get_Outputs_Max(brain.Outputs, inputs[i]);
                    if (output)
                    {
                        //Add to possible outputs
                        output_pool.push(output);
                    }
                }
            }

            var response = "";

            if (output_pool.length > 0)
            {
                //Pick topic based output at random
                var random = Math.floor(Math.random() * output_pool.length);
                response = output_pool[random];
            }

            //Get direct outputs for the input
            if (!response)
            {
                var direct_output = await Brain_Outputs.get_Outputs_Max(brain.Outputs, input);
                if (direct_output)
                {
                    response = direct_output;
                }
            }
            
            //Generate a new response
            if (!response)
            {
                var generated = await GenerateResponse(message, topic);
                if (generated)
                {
                    response = generated;
                }
            }

            if (response)
            {
                var current_ending = response[response.length - 1];
                var new_ending = await Util.LearnEndingPunctuation(Brain_Inputs, brain.Inputs, message, response);
                if (new_ending &&
                    new_ending != current_ending)
                {
                    //Remove all special characters at the end
                    var specials = Util.SpecialCharacters();
                    if (specials.includes(response[response.length - 1]))
                    {
                        response = response.substring(0, response.length - 1);
                    }

                    //Add learned ending puncutation
                    response += new_ending;
                }
            }
            
            return response;
        }
    }
    catch (error)
    {
        console.error(error);
    }

    return null;
}

async function GenerateResponse(message, topic)
{
    var words_found = true;
    var current_pre_word = topic;
    var current_pro_word = topic;
    var response_words = [];
    var response = "";

    try
    {
        response_words.push(topic);

        while (words_found)
        {
            current_pre_word = await Brain_PreWords.get_Pre_Words_Max(message, brain.PreWords, response_words, current_pre_word);
            if (current_pre_word)
            {
                if (words_found)
                {
                    response_words.unshift(current_pre_word);
                }

                //Check for repeating chunk of response
                var dup_found = false;
                var dup_startIndex = 0;
                var dup_wordCount = 0;

                if (response_words.length >= 4)
                {
                    for (var length = 4; length <= response_words.length; length += 2)
                    {
                        var count = Math.floor(length / 2);

                        for (var i = 0; i <= response_words.length - length; i++)
                        {
                            var first_chunk = "";
                            var second_chunk = "";

                            for (var c = i; c < count + i; c++)
                            {
                                first_chunk += response_words[c];
                                second_chunk += response_words[count + c];
                            }

                            if (first_chunk == second_chunk)
                            {
                                dup_found = true;
                                dup_startIndex = i;
                                dup_wordCount = count;
                                break;
                            }
                        }

                        if (dup_found)
                        {
                            break;
                        }
                    }
                }

                if (dup_found)
                {
                    response_words.splice(dup_startIndex, dup_wordCount);
                    break;
                }
            }
            else
            {
                words_found = false;
            }
        }
    
        words_found = true;
        while (words_found)
        {
            current_pro_word = await Brain_ProWords.get_Pro_Words_Max(message, brain.ProWords, response_words, current_pro_word);
            if (current_pro_word)
            {
                if (words_found)
                {
                    response_words.push(current_pro_word);
                }

                if (Util.SpecialCharacters().includes(current_pro_word))
                {
                    break;
                }

                //Check for repeating chunk of response
                var dup_found = false;
                var dup_startIndex = 0;
                var dup_wordCount = 0;

                if (response_words.length >= 4)
                {
                    for (var length = 4; length <= response_words.length; length += 2)
                    {
                        var count = Math.floor(length / 2);

                        for (var i = 0; i <= response_words.length - length; i++)
                        {
                            var first_chunk = "";
                            var second_chunk = "";

                            for (var c = i; c < count + i; c++)
                            {
                                first_chunk += response_words[c];
                                second_chunk += response_words[count + c];
                            }

                            if (first_chunk == second_chunk)
                            {
                                dup_found = true;
                                dup_startIndex = i;
                                dup_wordCount = count;
                                break;
                            }
                        }

                        if (dup_found)
                        {
                            break;
                        }
                    }
                }

                if (dup_found)
                {
                    response_words.splice(dup_startIndex, dup_wordCount);
                    break;
                }
            }
            else
            {
                words_found = false;
            }
        }
    
        for (var i = 0; i < response_words.length; i++)
        {
            response += response_words[i] + " ";
        }
    
        response = Util.RulesCheck(message, response.trim());
    }
    catch (error)
    {
        console.error(error);
    }

    return response;
}