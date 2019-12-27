var Brain_Users = require('../brain/brain_users.js');

module.exports = 
{
    name: 'database_Users',
    description: 'Gets all users or a single user from the database.',
    usage: 'blank or [User Name]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await Brain_Users.get_User(brain.Users, message, args[0]);
        }
        else
        {
            await Brain_Users.get_Users(brain.Users, message);
        }
    }
};