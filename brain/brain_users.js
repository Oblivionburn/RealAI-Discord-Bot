var Sequelize = require('sequelize');

module.exports = 
{
    async add_User(table, user_id, user_name, new_input, new_response)
    {
        try 
        {
            await table.findOne({ where: { user_id: user_id } })
                .then(result => 
                {
                    if (!result) 
                    {
                        table.create(
                        {
                            user_id: user_id,
                            user_name: user_name,
                            last_input: new_input,
                            last_response: new_response
                        });
                    }
                    else
                    {
                        result.update(
                        {
                            last_input: new_input,
                            last_response: new_response,
                            time_stamp: new Date()
                        });
                    }
                });
        }
        catch (error) 
        {
            console.error(error);
        }
    },
    async remove_User(table, message, user_name)
    {
        await table.destroy({ where: { user_name: user_name } })
            .then(message.channel.send(`${user_name} has been removed from the database.`));
    },
    async remove_User(table, message)
    {
        await table.destroy({ where: {} })
            .then(message.channel.send(`All users have been removed from the database.`));
    },
    async get_User(table, message, existing_user)
    {
        var result = await table.findAll({ where: { user_name: existing_user } });
        if (result != null &&
            result != '')
        {
            var userString = "";
            for (var i = 0; i < result.length; i++)
            {
                userString += `**User Name: ${result[i].user_name}**\n`;
                userString += `User ID: ${result[i].user_id}\n`;
                userString += `Last Input: ${result[i].last_input}\n`;
                userString += `Last Response: ${result[i].last_response}\n`;
                userString += `Last Updated: ${result[i].time_stamp}\n`;
            }

            message.channel.send(`${userString}`);
        }
        else
        {
            message.channel.send(`Could not find ${existing_user} in the database.`);
        }
    },
    async get_Users(table, message)
    {
        var result = await table.findAll({ attributes: ['user_id', 'user_name', 'last_input', 'last_response', 'time_stamp'] });
        if (result != null &&
            result != '')
        {
            var userString = "";
            for (var i = 0; i < result.length; i++)
            {
                userString += `**User Name: ${result[i].user_name}**\n`;
                userString += `User ID: ${result[i].user_id}\n`;
                userString += `Last Input: ${result[i].last_input}\n`;
                userString += `Last Response: ${result[i].last_response}\n`;
                userString += `Last Updated: ${result[i].time_stamp}\n`;
            }

            message.channel.send(`${userString}`);
        }
        else
        {
            message.channel.send(`No users found in the database.`);
        }
    },
    async get_User_LastResponse(table, existing_id)
    {
        try
        {
            var result = await table.findOne({ where: { user_id: existing_id } });
            if (result != null &&
                result != '')
            {
                var now = Date.now();
                var delay = new Date(new Date(result.time_stamp).getTime() + 60000);

                if (delay >= now)
                {
                    return result.last_response;
                }
            }
        }
        catch (error)
        {
            console.error(error);
        }

        return null;
    },
    async remove_User_LastResponse(table, existing_id)
    {
        try
        {
            await table.findOne({ where: { user_id: existing_id } })
                .then(result => 
                {
                    if (result) 
                    {
                        result.update({ last_response: '' });
                    }
                });
        }
        catch (error)
        {
            console.error(error);
        }
    }
}