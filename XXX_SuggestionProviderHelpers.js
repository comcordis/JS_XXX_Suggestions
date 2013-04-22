
var XXX_SuggestionProviderHelpers = 
{	
	composeSuggestionOptionLabel: function (suggestionOption)
	{
		var label = suggestionOption.label;
		
		if (suggestionOption.suggestedValue == label)
		{
			
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
	
	
	
	sortSuggestions: function (suggestions)
	{
		suggestions.sort(function(a, b)
		{
			return XXX_String_Search.compareMatchStatistics(a.matchStatistics, b.matchStatistics);
		});
		
		return suggestions;
	},
	
	
	
	/*
	
	Features:
		- Unicode / UTF-8 compatible
		- Case sensitivity or not
		- E accent to e etc. 
		- Entropy
		- Levenshtein distance as a percentage
			percentage = (1 - levenshteinDistance / longestWordCharacterLength) × 100
			
			- Ignore results where the percentage match is less than 50%.
    		- Treat the percentages as ordinary numbers, and sum them to create a "total match" between the search terms and document.
    			- E.g. 2 words of 80% result in 160, which is a better match than 1 word of 100%
    	- Term frequency
    	- Term hit ratio
    	- Character hit ratio
    	- Mark characters as matching individually
    		- Have a wrapping functions which wraps all those characters.
    	- Have a html tag aware highlighting wrapping function
    	- Single or Multiple words
    	- AND, OR etc.
    				
			matchTypes:
				- exact b
				- otherCase b + i
				- levenshtein i
			
			b = exact positions
			i = similar (levenshtein)
			u = exact different positions
			
			splitToTerms
				- term
				- separator
				
			Positions for terms
				Levenshtein
			
				Levenshtein multiple terms:
					- character hit percentage, longest characterLength - distance
							
			Cachable parts:
			Live parts:
			
	*/
		
	tryMatchingSuggestion: function (source, querySearchMatcher)
	{
		var result = false;
		
		var sourceSearchMatcher = XXX_String_Search.getSearchMatcher(source);
		
		sourceSearchMatcher = XXX_String_Search.matchSourceSearchMatcherWithQuerySearchMatcher(sourceSearchMatcher, querySearchMatcher);
		
		if (sourceSearchMatcher.matchStatistics.bestMatchType !== false)
		{
			result = {};
			result.suggestedValue = sourceSearchMatcher.full.rawValue;
			result.complement = '';
			result.label = '';
			
			result.label += sourceSearchMatcher.matchStatistics.termMode + '|';
			result.label += sourceSearchMatcher.matchStatistics.bestMatchType + '|';
			result.label += sourceSearchMatcher.matchStatistics.termHitTotal + '|';
			result.label += sourceSearchMatcher.matchStatistics.identicalCharacterHitTotal + '|';
			result.label += sourceSearchMatcher.matchStatistics.similarCharacterHitTotal + '|';
			result.label += sourceSearchMatcher.matchStatistics.levenshteinDistanceTotal + '|';
			result.label += sourceSearchMatcher.matchStatistics.offset + '|';
			result.label += XXX_String_Search.composeLabelFromSourceSearchMatcher(sourceSearchMatcher);
			result.matchStatistics = sourceSearchMatcher.matchStatistics;
		}
		
		return result;
	},
	
	processRawSuggestions: function (valueAskingSuggestions, rawSuggestions, maximum, dataType)
	{
		maximum = XXX_Default.toPositiveInteger(maximum, 0);
		
		
		
		
		var querySearchMatcher = XXX_String_Search.getSearchMatcher(valueAskingSuggestions, true);
		
		var processedSuggestions = [];
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(rawSuggestions); i < iEnd; ++i)
		{
			var rawSuggestion = rawSuggestions[i];
			
			
			var matchedSuggestion = this.tryMatchingSuggestion(rawSuggestion, querySearchMatcher);
			
			if (matchedSuggestion !== false)
			{
				var processedSuggestion = {};
				processedSuggestion.valueAskingSuggestions = valueAskingSuggestions;
				processedSuggestion.suggestedValue = matchedSuggestion.suggestedValue;
				processedSuggestion.complement = matchedSuggestion.complement;
				processedSuggestion.label = matchedSuggestion.label;
				processedSuggestion.matchStatistics = matchedSuggestion.matchStatistics;
				
				processedSuggestion.data = {};
				processedSuggestion.data[dataType] = processedSuggestion.suggestedValue;
				processedSuggestion.data.dataType = dataType;
				
				processedSuggestions.push(processedSuggestion);
			}
		}
		
		XXX_JS.errorNotification(1, 'Hello');
		
		processedSuggestions = XXX_SuggestionProviderHelpers.sortSuggestions(processedSuggestions);	
		
		if (maximum > 0)
		{
			processedSuggestions = XXX_Array.getPart(processedSuggestions, 0, maximum);
		}
		
		return processedSuggestions;
	}
};