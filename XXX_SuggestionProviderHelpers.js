
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
	
	splitToParts: function (sentence)
	{
		sentence = XXX_Type.makeString(sentence);
		
		var parts = XXX_String_Pattern.splitToArray(sentence, '\\s*(?:,|\\(|\\)|\\s)\\s*', '');
		
		parts.sort(function(a, b)
		{
			return XXX_String.getCharacterLength(a) - XXX_String.getCharacterLength(b);
		});
				
		parts = XXX_Array.filterOutEmpty(parts);
		
		return parts;
	},
	
	determineMaximumLevenshteinDistance: function (valueCharacterLength)
	{
		var result = 3;
		
		switch (valueCharacterLength)
		{
			case 0:
				result = 0;
				break;
			case 1:
				result = 0;
				break;
			case 2:
				result = 1;
				break;
			case 3:
				result = 1;
				break;
			case 4:
				result = 1;
				break;
			case 5:
				result = 2;
				break;
		}
		
		return result;
	},
	
	matchTypeToNumber: function (matchType)
	{
		var result = 6;
		
		switch (matchType)
		{
			case 'beginsWithFullLiteral':
				result = 1;
				break;
			case 'hasFullLiteral':
				result = 2;
				break;
			case 'hasAllLiteralParts':
				result = 3;
				break;
			case 'hasAtLeastOneLiteralPart':
				result = 4;
				break;
			case 'beginsWithLevenshteinFullLiteral':
				result = 5;
				break;
			default:
				result = 6;
				break;
		}
		
		return result;
	},
	
	sortSuggestions: function (suggestions)
	{
		suggestions.sort(function(a, b)
		{
			return XXX_SuggestionProviderHelpers.matchTypeToNumber(a.matchType) - XXX_SuggestionProviderHelpers.matchTypeToNumber(b.matchType);
		});
		
		return suggestions;
	},
	
	tryMatchingSuggestion: function (valueAskingSuggestions, rawSuggestion)
	{
		var result = false;
		
		var valueAskingSuggestionsLowerCase = XXX_String.convertToLowerCase(valueAskingSuggestions);
		var valueAskingSuggestionsCharacterLength = XXX_String.getCharacterLength(valueAskingSuggestions);
		var rawSuggestionLowerCase = XXX_String.convertToLowerCase(rawSuggestion);
		
		var rawSuggestionLowerCasePosition = XXX_String.findFirstPosition(rawSuggestionLowerCase, valueAskingSuggestionsLowerCase);
		
		if (result === false)
		{
			if (rawSuggestionLowerCasePosition === 0)
			{
				result = {};
				result.matchType = 'beginsWithFullLiteral';
				result.suggestedValue = rawSuggestion;
				result.complement = XXX_String.getPart(rawSuggestion, valueAskingSuggestionsCharacterLength);
				
				result.label = '<b>';
				result.label += XXX_String.getPart(rawSuggestion, 0, valueAskingSuggestionsCharacterLength);
				result.label += '</b>';
				result.label += result.complement;
			}
		}
		
		if (result === false)
		{
			if (rawSuggestionLowerCasePosition > 0)
			{
				result = {};
				result.matchType = 'hasFullLiteral';
				result.suggestedValue = rawSuggestion;
				result.complement = '';
				
				result.label = XXX_String.getPart(rawSuggestion, 0, rawSuggestionLowerCasePosition);
				result.label += '<u>';
				result.label += XXX_String.getPart(rawSuggestion, rawSuggestionLowerCasePosition, valueAskingSuggestionsCharacterLength);
				result.label += '</u>';
				result.label += XXX_String.getPart(rawSuggestion, rawSuggestionLowerCasePosition + valueAskingSuggestionsCharacterLength);
			}
		}
		
		if (result === false)
		{
			if (valueAskingSuggestionsCharacterLength > 2)
			{
				var rawSuggestionLowerCaseBegin = XXX_String.getPart(rawSuggestionLowerCase, 0, valueAskingSuggestionsCharacterLength);
				var rawSuggestionLowerCaseBeginLevenshteinDistance = XXX_String_Levenshtein.getDistance(valueAskingSuggestionsLowerCase, rawSuggestionLowerCaseBegin);
				
				if (rawSuggestionLowerCaseBeginLevenshteinDistance <= this.determineMaximumLevenshteinDistance(valueAskingSuggestionsCharacterLength))
				{
					result = {};
					result.matchType = 'beginsWithLevenshteinFullLiteral';
					result.suggestedValue = rawSuggestion;
					result.complement = XXX_String.getPart(rawSuggestion, valueAskingSuggestionsCharacterLength);
					
					result.label = '<i>~ ';
					result.label += '' + XXX_String.getPart(rawSuggestion, 0, valueAskingSuggestionsCharacterLength) + '';
					result.label += result.complement;
					result.label += '</i>';
				}
			}
		}
		
		if (result === false)
		{
			var label = rawSuggestion;
			var valueAskingSuggestionsLowerCaseParts = this.splitToParts(valueAskingSuggestionsLowerCase);
			
			XXX.debug.labels.push([label, valueAskingSuggestionsLowerCaseParts]);
			
			if (XXX_Array.getFirstLevelItemTotal(valueAskingSuggestionsLowerCaseParts) > 1)
			{
				var foundAllParts = true;
				var foundAtLeastOnePart = false;
				
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(valueAskingSuggestionsLowerCaseParts); i < iEnd; ++i)
				{
					var valueAskingSuggestionsLowerCasePart = valueAskingSuggestionsLowerCaseParts[i];
					
					var valueAskingSuggestionsLowerCasePartPosition = XXX_String.findFirstPosition(XXX_String.convertToLowerCase(label), valueAskingSuggestionsLowerCasePart);
					var valueAskingSuggestionsLowerCasePartCharacterLength = XXX_String.getCharacterLength(valueAskingSuggestionsLowerCasePart);
					
					if (valueAskingSuggestionsLowerCasePartPosition === false)
					{
						foundAllParts = false;
					}
					else
					{
						var tempLabel = XXX_String.getPart(label, 0, valueAskingSuggestionsLowerCasePartPosition);
						tempLabel += '<u>';
						tempLabel += XXX_String.getPart(label, valueAskingSuggestionsLowerCasePartPosition, valueAskingSuggestionsLowerCasePartCharacterLength);
						tempLabel += '</u>';
						tempLabel += XXX_String.getPart(label, valueAskingSuggestionsLowerCasePartPosition + valueAskingSuggestionsLowerCasePartCharacterLength);
						
						label = tempLabel;
						
						foundAtLeastOnePart = true;
					}
				}
				
				if (foundAllParts)
				{
					result = {};
					result.matchType = 'hasAllLiteralParts';
					result.suggestedValue = rawSuggestion;
					result.complement = '';
					result.label = label;
					
				}
				else if (foundAtLeastOnePart)
				{
					result = {};
					result.matchType = 'hasAtLeastOneLiteralPart';
					result.suggestedValue = rawSuggestion;
					result.complement = '';
					result.label = label;
				}
			}
		}
		
		return result;
	},
	
	processRawSuggestions: function (valueAskingSuggestions, rawSuggestions, maximum, dataType)
	{
		maximum = XXX_Default.toPositiveInteger(maximum, 0);
		
		var processedSuggestions = [];
			XXX.debug.labels = [];
					
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(rawSuggestions); i < iEnd; ++i)
		{
			var rawSuggestion = rawSuggestions[i];
			
			var processedSuggestion = {};
			processedSuggestion.valueAskingSuggestions = valueAskingSuggestions;
			processedSuggestion.suggestedValue = rawSuggestion;
			processedSuggestion.complement = '';
			processedSuggestion.label = '';
			
			processedSuggestion.data = {};
			processedSuggestion.data[dataType] = processedSuggestion.suggestedValue;
			processedSuggestion.data.dataType = dataType;
			
			var matchedSuggestion = this.tryMatchingSuggestion(valueAskingSuggestions, rawSuggestion);
			
			if (matchedSuggestion)
			{
				processedSuggestion.matchType = matchedSuggestion.matchType;
				processedSuggestion.suggestedValue = matchedSuggestion.suggestedValue;
				processedSuggestion.complement = matchedSuggestion.complement;
				processedSuggestion.label = matchedSuggestion.label;
				
				processedSuggestions.push(processedSuggestion);
			}
		}
		
		processedSuggestions = XXX_SuggestionProviderHelpers.sortSuggestions(processedSuggestions);	
		
		if (maximum > 0)
		{
			processedSuggestions = XXX_Array.getPart(processedSuggestions, 0, maximum);
		}
		
		return processedSuggestions;
	}
};