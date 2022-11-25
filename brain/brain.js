var Sequelize = require('sequelize');

class Brain
{
    constructor()
    {
        this.Database = new Sequelize('database', 'user', 'password', 
        {
            host: '0.0.0.0',
            dialect: 'sqlite',
            logging: false,
            storage: 'database.sqlite',
        });

        this.Users = this.Database.define('users', 
        {
            user_id:
            {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            user_name:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            },
            last_input:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            },
            last_response:
            {
                type: Sequelize.STRING,
                allowNull: false,
            },
            time_stamp:
            {
                type: Sequelize.DATE,
                defaultValue: new Date(),
                allowNull: false
            }
        });

        this.Inputs = this.Database.define('inputs', 
        {
            input:
            {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            frequency:
            {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                allowNull: false
            }
        });

        this.Outputs = this.Database.define('outputs', 
        {
            input:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            },
            output:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            },
            frequency:
            {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                allowNull: false
            },
            indexes:
            [{
                unique: true,
                fields: ['input', 'output']
            }]
        });

        this.Topics = this.Database.define('topics', 
        {
            input:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            },
            topic:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            },
            frequency:
            {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                allowNull: false
            },
            indexes:
            [{
                unique: true,
                fields: ['input', 'topic']
            }]
        });

        this.Words = this.Database.define('words', 
        {
            word: 
            { 
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            frequency: 
            {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                allowNull: false
            }
        });

        this.PreWords = this.Database.define('pre_words', 
        {
            word:
            { 
                type: Sequelize.STRING,
                allowNull: false
            },
            pre_word:
            { 
                type: Sequelize.STRING,
                allowNull: false
            },
            frequency:
            {
                type: Sequelize.INTEGER,
                defaultValue: 30,
                allowNull: false
            },
            distance:
            {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            indexes:
            [{
                unique: true,
                fields: ['word', 'pre_word', 'distance']
            }]
        });

        this.ProWords = this.Database.define('pro_words', 
        {
            word:
            { 
                type: Sequelize.STRING,
                allowNull: false
            },
            pro_word:
            { 
                type: Sequelize.STRING,
                allowNull: false
            },
            frequency:
            {
                type: Sequelize.INTEGER,
                defaultValue: 30,
                allowNull: false
            },
            distance:
            {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            indexes:
            [{
                unique: true,
                fields: ['word', 'pro_word', 'distance']
            }]
        });

        this.WordsBlackList = this.Database.define('words_blacklist', 
        {
            word:
            { 
                type: Sequelize.STRING,
                allowNull: false,
            }
        });
    }

    init_Brain()
    {
        this.Words.sync();
        this.Inputs.sync();
        this.PreWords.sync();
        this.ProWords.sync();
        this.Topics.sync();
        this.Outputs.sync();
        this.Users.sync();
        this.WordsBlackList.sync();
    }

    async wipe(message)
    {
        await this.Words.destroy({ where: {} })
            .then(this.Inputs.destroy({ where: {} }))
            .then(this.PreWords.destroy({ where: {} }))
            .then(this.ProWords.destroy({ where: {} }))
            .then(this.Users.destroy({ where: {} }))
            .then(this.Topics.destroy({ where: {} }))
            .then(this.Outputs.destroy({ where: {} }))
            .then(this.WordsBlackList.destroy({ where: {} }))
            .then(message.channel.send(`Everything has been removed from the database.`));
    }

    async wipe_Word(message, existing_word)
    {
        await this.Words.destroy({ where: { word: existing_word } })
            .then(this.Inputs.destroy({ where: { input: { [Sequelize.Op.like]: '%' + existing_word + '%' } } }))
            .then(this.PreWords.destroy({ where: { [Sequelize.Op.or]: [{ pre_word: existing_word }, { word: existing_word }] } }))
            .then(this.ProWords.destroy({ where: { [Sequelize.Op.or]: [{ pro_word: existing_word }, { word: existing_word }] } }))
            .then(this.Topics.destroy({ where: { [Sequelize.Op.or]: [{ topic: existing_word }, { input: { [Sequelize.Op.like]: '%' + existing_word + '%' } }] } }))
            .then(this.Outputs.destroy({ where: { [Sequelize.Op.or]: [{ output: { [Sequelize.Op.like]: '%' + existing_word + '%' } }, { input: { [Sequelize.Op.like]: '%' + existing_word + '%' } }] } }))
            .then(message.channel.send(`Everything containing "${existing_word}" has been removed from the database.`));
    }
}

module.exports = Brain;