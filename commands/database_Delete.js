module.exports = 
{
    name: 'database_Delete',
    description: 'Deletes everything from the database.',
    usage: '',
    async execute(brain, message, args) 
    {
        await brain.wipe(message);
    }
};