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
        var real_message = message.content;

        var botUser_PC = `<@!${client.user.id}>`;
        var botUser_Mobile = `<@${client.user.id}>`;

        //Check if message is not coming from another bot
        if (message.author.bot) { return; }

        console.log(message.content);

        if (real_message)
        {
            var direct = false;

            //Get message after bot's tag
            if (real_message.startsWith(botUser_PC))
            {
                direct = true;
                real_message = real_message.slice(botUser_PC.length).trim();
            }
            else if (real_message.startsWith(botUser_Mobile))
            {
                direct = true;
                real_message = real_message.slice(botUser_Mobile.length).trim();
            }
            else if (real_message.startsWith("_"))
            {
                direct = true;
                real_message = real_message.slice(1).trim();
            }
            
            real_message = Util.RemoveSpecials(real_message);

            var using_command = false;

            //Check for it being a command
            if (real_message.length > 1 &&
                real_message.startsWith(prefix))
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
                        if (commandName.includes('Delete'))
                        {
                            try
                            {
                                if (message.member.highestRole.hasPermission('ADMINISTRATOR'))
                                {
                                    await command.execute(brain, message, args);
                                }
                                else
                                {
                                    message.channel.send(`You do not have permission to use that command.`);
                                }
                            }
                            catch (error)
                            {
                                message.channel.send(error.message);
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
                                message.channel.send(error.message);
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
                if (words &&
                    direct)
                {
                    //Format input to store as output and last response for the user
                    var clean_message = Util.RulesCheck(message, real_message.trim());

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

        //Replace any blacklisted words
        for (var i = 0; i < words.length; i++)
        {
            var blacklisted = await Brain_Words_Blacklist.check_Word(brain.WordsBlackList, words[i]);
            if (blacklisted)
            {
                words.splice(i, 1);
                real_message = real_message.replace(words[i], "[redacted]");
                i--;
            }
        }

        if (words.length > 0)
        {
            //Add individual words/counts
            await Brain_Words.add_Words(brain.Words, words);

            //Format the message to add as input
            var clean_message = Util.RulesCheck(message, real_message.trim());
            await Brain_Inputs.add_Input(brain.Inputs, clean_message);

            //Add output if there was a last_response stored for the user
            var last_response = await Brain_Users.get_User_LastResponse(brain.Users, message.author.id);
            //message.channel.send(`Found last response: "${last_response}"`);

            if (last_response)
            {
                await Brain_Outputs.add_Output(brain.Outputs, last_response, clean_message);
            }

            //Add pre-words and pro-words
            await AddPreWords(message, words, clean_message);
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

async function AddPreWords(message, word_array, clean_message)
{
    try
    {
        if (word_array)
        {
            await Brain_PreWords.add_Pre_Words(message, brain.Outputs, brain.PreWords, word_array, clean_message);
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
        //Generate a new response
        var generated = await GenerateResponse(message, input, words);
        if (generated)
        {
            return generated;
        }
    }
    catch (error)
    {
        console.error(error);
    }

    return "";
}

async function GenerateResponse(message, input, words)
{
    var words_found = true;
    var current_word = "";
    var predicted_word = "";
    var response_words = [];
    var response = "";
    var count = 0;

    try
    {
        if (count < words.length)
        {
            current_word = await Brain_PreWords.get_Word_From_PreWord_Max(message, brain.Outputs, brain.PreWords, input, words[count], count);
            if (!current_word)
            {
                current_word = words[count];
            }

            response_words.push(current_word);
            count++;
        }

        while (words_found)
        {
            if (count < words.length)
            {
                predicted_word = await Brain_PreWords.get_Word_From_PreWord_Max(message, brain.Outputs, brain.PreWords, input, words[count], count);
                count++;
            }
            else
            {
                predicted_word = "";
            }
            
            var pro_word = await Brain_ProWords.get_Pro_Words_Max(message, brain.ProWords, response_words, current_word, predicted_word);
            if (pro_word)
            {
                response_words.push(pro_word);

                if (Util.EndingPunctuation().includes(pro_word))
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