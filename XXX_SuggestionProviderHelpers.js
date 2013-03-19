
var XXX_SuggestionProviderHelpers = 
{
	limitToMaximum: function (suggestions, maximum)
	{
		maximum = XXX_Default.toPositiveInteger(maximum, 15);
				
		var limitedSuggestions = [];
		
		for (var i = 0, iEnd = XXX_Number.lowest(maximum, XXX_Array.getFirstLevelItemTotal(suggestions)); i < iEnd; ++i)
		{
			limitedSuggestions.push(suggestions[i]);
		}
		
		return limitedSuggestions;
	},
	
	composeSuggestionOptionLabel: function (suggestionOption)
	{
		var label = suggestionOption.label;
		
		if (XXX_String.findFirstPosition(XXX_String.convertToLowerCase(suggestionOption.suggestedValue), XXX_String.convertToLowerCase(suggestionOption.valueAskingSuggestions)) === 0)
		{
			label = '' + suggestionOption.valueAskingSuggestions + '<b>' + suggestionOption.complement + '</b>';
		}
		
		return label;
	},
	
	/*
	
	valueAskingSuggestions
	suggestedValue
		- if match (valueAskingSuggestions + complement)
		- if not (rawSuggestion)
	complement:
		- if match (remainder)
		- if not (empty)
	data:
		- all date related to json submission
	label:
		- if compose method do that
		- if not, try making complement <b> or other suggestion <i>
	typeAhead:
		- if match (suggestedValue)
		- if not (empty)
	
	*/
	
	processRawSuggestions: function (valueAskingSuggestions, rawSuggestions, maximum, dataType)
	{
		maximum = XXX_Default.toPositiveInteger(maximum, 0);
		
		var processedSuggestions = [];
		
		var valueAskingSuggestionsLowerCase = XXX_String.convertToLowerCase(valueAskingSuggestions);
			
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(rawSuggestions); i < iEnd; ++i)
		{
			var rawSuggestion = rawSuggestions[i];
			var rawSuggestionLowerCase = XXX_String.convertToLowerCase(rawSuggestion);
			
			var processedSuggestion = {};
			processedSuggestion.valueAskingSuggestions = valueAskingSuggestions;
			processedSuggestion.suggestedValue = rawSuggestion;
			processedSuggestion.complement = '';
			processedSuggestion.label = '';
			
			processedSuggestion.data = {};
			processedSuggestion.data[dataType] = processedSuggestion.suggestedValue;
			processedSuggestion.data.dataType = dataType;
			
			// TODO build to generate label, correct lower/uppercase stuff and filtering
			// TODO levenshtein
			// TODO position not begin in front, but also in part/end, underline
			
			if (XXX_String.findFirstPosition(rawSuggestionLowerCase, valueAskingSuggestionsLowerCase) === 0)
			{
				processedSuggestion.complement = XXX_String.getPart(rawSuggestion, XXX_String.getCharacterLength(valueAskingSuggestions));
				processedSuggestion.suggestedValue = processedSuggestion.valueAskingSuggestions + processedSuggestion.complement;
				
				processedSuggestions.push(processedSuggestion); // TODO make setting if it's strict filtering or not, otherwise, push outside
			}
			
			if (maximum > 0 && XXX_Array.getFirstLevelItemTotal(processedSuggestions) == maximum)
			{
				break;
			}
		}
		
		return processedSuggestions;
	}
};