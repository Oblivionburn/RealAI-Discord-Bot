module.exports = 
{
    name: 'database_Delete',
    description: 'Deletes everything from the database.',
    usage: 'blank or [Word]',
    async execute(brain, message, args) 
    {
        if (args.length > 0)
        {
            await brain.wipe_Word(message, args[0]);
        }
        else
        {
            await brain.wipe(message);
        }
    }
};