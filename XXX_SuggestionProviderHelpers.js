
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
	
	getSourceSwitchBoard: function (source)
	{
		
		var characterLength = XXX_String.getCharacterLength(source);
		
		var result =
		{
			source: source,
			sourceLowerCase: XXX_String.convertToLowerCase(source),
			characterLength: characterLength,
			characterSwitches: [],
			characterHitPercentage: 0,
			characterHitPercentageStep: 100 / characterLength,
			termHits: 0
		};
		
		if (characterLength > 0)
		{
			for (var i = 0, iEnd = characterLength; i < iEnd; ++i)
			{
				result.characterSwitches.push({character: XXX_String.getPart(source, i, 1), characterSwitch: false});
			}
		}
		
		return result;
	},
	
	updateSourceSwitchBoardForTerm: function (sourceSwitchBoard, term)
	{
		var searchOffset = 0;
		var termLowerCase = XXX_String.convertToLowerCase(term);
		var termCharacterLength = XXX_String.getCharacterLength(term);
		
		while (true)
		{
			var termPosition = XXX_String.findFirstPosition(sourceSwitchBoard.sourceLowerCase, termLowerCase, searchOffset);
			
			if (termPosition !== false)
			{
				for (var i = termPosition, iEnd = termPosition + termCharacterLength; i < iEnd; ++i)
				{
					if (!sourceSwitchBoard.characterSwitches[i].characterSwitch)
					{
						sourceSwitchBoard.characterSwitches[i].characterSwitch = true;
						
						sourceSwitchBoard.characterHitPercentage += sourceSwitchBoard.characterHitPercentageStep;
					}
				}
				
				searchOffset += termPosition + termCharacterLength;
				
				sourceSwitchBoard.termHits += 1;
			}
			else
			{
				break;
			}
		}
		
		return sourceSwitchBoard;
	},
	
	composeLabelFromSourceSwitchBoard: function (sourceSwitchBoard, wrapTag)
	{
		var result = '';
		
		var isWrapped = false;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(sourceSwitchBoard.characterSwitches); i < iEnd; ++i)
		{
			var characterSwitch = sourceSwitchBoard.characterSwitches[i];
			
			if (characterSwitch.characterSwitch)
			{
				if (!isWrapped)
				{
					result += '<' + wrapTag + '>';
					
					isWrapped = true;
				}
			}
			else
			{
				if (isWrapped)
				{
					result += '</' + wrapTag + '>';
					
					isWrapped = false;
				}
			}
			
			result += characterSwitch.character;
		}
		
		return result;
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
			var valueAskingSuggestionsParts = XXX_String_Search.splitToTerms(valueAskingSuggestions);
			var valueAskingSuggestionsLowerCaseParts = XXX_String_Search.splitToTerms(valueAskingSuggestionsLowerCase);
			
			XXX.debug.labels.push([label, valueAskingSuggestionsLowerCaseParts]);
			
			if (XXX_Array.getFirstLevelItemTotal(valueAskingSuggestionsLowerCaseParts) > 1)
			{
				var foundAllParts = true;
				var foundAtLeastOnePart = false;
				
				var sourceSwitchBoard = this.getSourceSwitchBoard(label);
				
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(valueAskingSuggestionsLowerCaseParts); i < iEnd; ++i)
				{
					sourceSwitchBoard = this.updateSourceSwitchBoardForTerm(sourceSwitchBoard, valueAskingSuggestionsParts[i]);
					
					
					
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
							
				label = this.composeLabelFromSourceSwitchBoard(sourceSwitchBoard, 'b');
				
				
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
			XXX.debug.characterSwitches = [];
					
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