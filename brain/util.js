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
                        new_string[i - 1] === ' ')
                    {
                        new_string = new_string.substring(0, i - 1) + new_string.substring(i);
                    }
                }

                //Remove special characters at the end that aren't ending punctuation
                var ending_exclusion = ['~', '@', '#', '$', '^', '&', '(', '=', '[', '{', ';', '<', '/', '|', '\\', ','];
                while (ending_exclusion.includes(new_string[new_string.length - 1]))
                {
                    new_string = new_string.substring(0, new_string.length - 2);
                }

                //Set ending punctuation
                var ending_punctuation = ['.', '!', '?'];
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
    }
}