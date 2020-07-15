module.exports = 
{
    allCharactersSame(original_string) 
    { 
        for (var i = 1; i < original_string.length; i++)
        {
            if (original_string[i] != original_string[0])
            {
                return false;
            }
        }

        return true; 
    },
    SpecialCharacters()
    {
        return ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '=', '+', '[', ']', '{', '}', ';', ':', '<', '>', '?', '/', '|', '\\', ',', '.'];
    },
    GapSpecials(original_string)
    {
        var new_string = "";
        for (var i = 0; i < original_string.length; i++)
        {
            if (this.SpecialCharacters().includes(original_string[i]))
            {
                new_string += " " + original_string[i];
            }
            else if (original_string[i] != '"')
            {
                new_string += original_string[i];
            }
        }

        return new_string;
    },
    RulesCheck(message, original_string)
    {
        try
        {
            if (original_string.length > 0)
            {
                var new_string = original_string;

                //Capitalize first word
                var first_letter = new_string[0];
                if (first_letter != first_letter.toUpperCase())
                {
                    new_string = first_letter.toUpperCase() + new_string.slice(1);
                }

                //Remove spaces before special characters
                for (var i = 1; i < new_string.length; i++)
                {
                    if (this.SpecialCharacters().includes(new_string[i]) &&
                        new_string[i - 1] == ' ')
                    {
                        new_string = new_string.substring(0, i - 1) + new_string[i];
                    }
                }

                //Remove special characters at the end that aren't ending punctuation
                var ending_exclusion = ['~', '@', '#', '$', '^', '&', '(', '=', '[', '{', ';', '<', '/', '|', '\\', ','];
                while (ending_exclusion.includes(new_string[new_string.length - 1]))
                {
                    new_string = new_string.substring(0, new_string.length - 1);
                }

                //Set ending punctuation
                var last_letter = new_string[new_string.length - 1];
                if (!this.SpecialCharacters().includes(last_letter))
                {
                    new_string += ".";
                }

                return new_string;
            }
        }
        catch (error)
        {
            console.error(error);
        }

        return null;
    },
    async LearnEndingPunctuation(Brain_Inputs, table, message, original_string)
    {
        //Set ending punctuation
        var words = this.GapSpecials(original_string).split(/ +/);
        if (words.length > 0)
        {
            var first_word = words[0];
            if (first_word.length > 0)
            {
                var question_end = 0;
                var period_end = 0;
                var exclamation_end = 0;

                var inputs = await Brain_Inputs.get_InputsWithFirstWord(table, message, first_word);
                if (inputs)
                {
                    for (var i = 0; i < inputs.length; i++)
                    {
                        var input = inputs[i];
                        var input_words = this.GapSpecials(input).split(/ +/);
                        var last_word = input_words[input_words.length - 1];
    
                        if (last_word == "?")
                        {
                            question_end++;
                        }
                        else if (last_word == ".")
                        {
                            period_end++;
                        }
                        else if (last_word == "!")
                        {
                            exclamation_end++;
                        }
                    }
    
                    if (question_end >= period_end &&
                        question_end >= exclamation_end)
                    {
                        return "?";
                    }
                    else if (exclamation_end >= period_end &&
                            exclamation_end >= question_end)
                    {
                        return "!";
                    }
                }
                else
                {
                    return ".";
                }
            }
        }

        return null;
    }
}