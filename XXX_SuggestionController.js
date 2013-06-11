/*

Arrow right:
	- If at last position:
		- If no more complement:
			- do nothing X
		- If still a complement:
			- user the complement X
	- If at previous position:
		- next character X
	
Enter:
	- Literal without complement X

Backspace:
	- Always 1 character backwards deleted X
	
Delete:
	- Always 1 character forwards deleted X
	
Arrow left:
	- Just previous character X

Up arrow:
	- If suggestion:
		- If no selection ,last suggestion X
		- If selection, previous suggestion X
		- If first suggestion, original value to complete X
	- If no suggestions:
		- Beginning of original value to complete X
	
Down arrow:
	- If suggestions:
		- If no suggestion, first suggestion X
		- If selection, next suggestion X
		- If last suggestion, original value to complete X
	- If no suggestions: X
		- End of original value to complete X
	
Mouse over:
	- Alleen selected index veranderen X
	
Mouse click:
	- Set value X
	- Confirm suggestion X

* Multiple spaces are filtered out as 1 space X
* Values are trimmed at begin X

Zodra die geen suggesties meer kan vinden, pakt die de eerste suggestie van de laatste als uitgangspunt voor het resultaat

Als alle woorden in de resultaten met valueAskingSuggestions begint, dan typeahead

Als er maar 1 result is en dat is hetzelfde als het huidige, dan geen result.


Last known result? Anders melding, we begrijpen uw locatie niet bla bla. X

*/
	
var XXX_SuggestionController = function (input, suggestionProvider, example)
{
	this.ID = XXX.createID();
	
	this.requestSuggestionsDelay = 40;
	this.requestSuggestionsDelayInstance = false;
	
	this.valueAskingSuggestions = '';
	this.filteredValueAskingSuggestions = '';
	this.previousCaretPosition = -1;
	
	this.example = example;
	
	this.elements = {};
	
	this.elements.input = XXX_DOM.get(input);
	this.elements.suggestionProvider = suggestionProvider;
	this.elements.parent = XXX_DOM.getParent(this.elements.input);
	
		
	XXX_CSS.setStyle(this.elements.input, 'background-color', 'transparent');
	
	
	var hiddenInputDataName = '';
	if (XXX_Type.isValue(this.elements.input.name))
	{
		hiddenInputDataName += this.elements.input.name;
	}
	else if (XXX_Type.isValue(this.elements.input.id))
	{
		hiddenInputDataName += this.elements.input.id;
	}
	hiddenInputDataName += '_data';
	
	var hiddenInputData = XXX_DOM.get(hiddenInputDataName);
	
	if (!hiddenInputData)
	{
		hiddenInputData = XXX_DOM.createElementNode('input');
		hiddenInputData.type = 'hidden';
		hiddenInputData.name = hiddenInputDataName;
		
		XXX_DOM.appendChildNode(this.elements.parent, hiddenInputData);
	}
	this.elements.hiddenInputData = hiddenInputData;
	
	
	this.eventDispatcher = new XXX_EventDispatcher();
	
	XXX_CSS.setClass(this.elements.input, 'suggestionController_valueAskingSuggestions');
		
	this.elements.suggestionOptionSelection = new XXX_SuggestionOptionSelection(this.elements.parent, this);
			
	var XXX_SuggestionController_instance = this;
	
	XXX_DOM_NativeHelpers.nativeSelectionHandling.enable(this.elements.input);
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'keyDown', function (nativeEvent)
	{
		XXX_SuggestionController_instance.keyDownHandler(nativeEvent);
	});
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'keyUp', function (nativeEvent)
	{
		XXX_SuggestionController_instance.keyUpHandler(nativeEvent);
	});
		
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'blur', function (nativeEvent)
	{
		XXX_SuggestionController_instance.elements.suggestionOptionSelection.hide();
		XXX_SuggestionController_instance.tryEnablingExample();
	});
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'focus', function (nativeEvent)
	{
		XXX_SuggestionController_instance.elements.suggestionOptionSelection.show();
		XXX_SuggestionController_instance.elements.suggestionOptionSelection.rerender();
		XXX_SuggestionController_instance.tryDisablingExample();
	});
	
	this.tryEnablingExample();
};


XXX_SuggestionController.prototype.tryDisablingExample = function ()
{
	var value = XXX_DOM_NativeHelpers.nativeCharacterLineInput.getValue(this.elements.input);
	
	if (value == this.example)
	{
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.input, '');
		
		//XXX_CSS.removeClass(this.elements.input, 'XXX_TextInputExample_example');
	}
};

XXX_SuggestionController.prototype.tryEnablingExample = function ()
{
	var value = XXX_DOM_NativeHelpers.nativeCharacterLineInput.getValue(this.elements.input);
	
	if (value == '')
	{
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.input, this.example);
		
		//XXX_CSS.addClass(this.elements.input, 'XXX_TextInputExample_example');
	}
};


XXX_SuggestionController.prototype.getData = function ()
{
	var result = false;
	
	var selectedSuggestionOption = this.elements.suggestionOptionSelection.getSelectedSuggestionOption();
			
	if (selectedSuggestionOption)
	{
		result = selectedSuggestionOption.data;
	}
	
	return result;
};

XXX_SuggestionController.prototype.propagateDataFromSelectedSuggestionOption = function ()
{
	var selectedSuggestionOption = this.elements.suggestionOptionSelection.getSelectedSuggestionOption();
			
	if (selectedSuggestionOption)
	{
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.hiddenInputData, XXX_String_JSON.encode(selectedSuggestionOption.data));
		
		this.setValue(selectedSuggestionOption.suggestedValue);		
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.focus(this.elements.input);
	}
	else
	{
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.hiddenInputData, '');
	}
	
	this.eventDispatcher.dispatchEventToListeners('change', this);
};

XXX_SuggestionController.prototype.resetDataFromSelectedSuggestionOption = function ()
{
	XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.hiddenInputData, '');
	
	//this.eventDispatcher.dispatchEventToListeners('change', this);
};

XXX_SuggestionController.prototype.keyUpHandler = function (nativeEvent)
{
	var requestSuggestions = false;
	
	var caretPosition = XXX_DOM_NativeHelpers.nativeSelectionHandling.getCaretPosition(this.elements.input);
	var value = XXX_DOM_NativeHelpers.nativeCharacterLineInput.getValue(this.elements.input);
	var valueCharacterLength = XXX_String.getCharacterLength(value);
	var caretIsAtEnd = caretPosition == valueCharacterLength;
	var previousCaretWasAtEnd = this.previousCaretPosition == valueCharacterLength;
	
	if (XXX_Device_Keyboard.isKey(nativeEvent, 'upArrow'))
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
		
		// If no suggestion options, set caret to beginning
		if (this.elements.suggestionOptionSelection.getSuggestionOptionTotal() == 0)
		{
			XXX_DOM_NativeHelpers.nativeSelectionHandling.setCaretPosition(this.elements.input, 0);
		}
		else
		{
			this.elements.suggestionOptionSelection.selectPreviousSuggestionOption();
			this.elements.suggestionOptionSelection.rerender();
			
			var selectedSuggestionOption = this.elements.suggestionOptionSelection.getSelectedSuggestionOption();
			
			if (selectedSuggestionOption)
			{
				this.setValue(selectedSuggestionOption.suggestedValue);
			}
			else
			{
				this.setValue(this.valueAskingSuggestions);
			}
			
			this.propagateDataFromSelectedSuggestionOption();
		}	
	}
	else if (XXX_Device_Keyboard.isKey(nativeEvent, 'downArrow'))
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
		
		if (this.elements.suggestionOptionSelection.getSuggestionOptionTotal() == 0)
		{
			XXX_DOM_NativeHelpers.nativeSelectionHandling.setCaretPosition(this.elements.input, valueCharacterLength);
		}
		else
		{
			if (!caretIsAtEnd)
			{
				XXX_DOM_NativeHelpers.nativeSelectionHandling.setCaretPosition(this.elements.input, valueCharacterLength);
			}
			else
			{			
				this.elements.suggestionOptionSelection.selectNextSuggestionOption();
				this.elements.suggestionOptionSelection.rerender();
				
				var selectedSuggestionOption = this.elements.suggestionOptionSelection.getSelectedSuggestionOption();
				
				if (selectedSuggestionOption)
				{
					this.setValue(selectedSuggestionOption.suggestedValue);
				}
				else
				{
					this.setValue(this.valueAskingSuggestions);
				}
			
				this.propagateDataFromSelectedSuggestionOption();
			}
		}
	}
	else if (XXX_Device_Keyboard.isKey(nativeEvent, 'leftArrow'))
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();	
	}
	else if (XXX_Device_Keyboard.isKey(nativeEvent, 'rightArrow'))
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
		
		if (caretIsAtEnd && previousCaretWasAtEnd)
		{
			var firstSuggestionOption = this.elements.suggestionOptionSelection.getFirstSuggestionOption();
		
			if (firstSuggestionOption)
			{
				if (firstSuggestionOption.suggestedValue != this.filteredValueAskingSuggestions)
				{
					this.setValue(firstSuggestionOption.suggestedValue);
					
					requestSuggestions = true;
				}
			}
		}
	}
	else if (XXX_Device_Keyboard.isKey(nativeEvent, 'enter'))
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
	
		XXX_DOM_NativeHelpers.nativeSelectionHandling.setCaretPosition(this.elements.input, valueCharacterLength);
			
		this.propagateDataFromSelectedSuggestionOption();
		
		this.elements.suggestionOptionSelection.resetSuggestionOptions();
		this.elements.suggestionOptionSelection.hide();
	}
	else if (XXX_Device_Keyboard.isKey(nativeEvent, 'backspace'))
	{	
		this.resetDataFromSelectedSuggestionOption();
		
		requestSuggestions = true;
	}
	else if (XXX_Device_Keyboard.isKey(nativeEvent, 'delete'))
	{
		this.resetDataFromSelectedSuggestionOption();
		
		requestSuggestions = true;
	}
	else if
	(
		XXX_Device_Keyboard.isKey(nativeEvent, 'space') ||
		XXX_Device_Keyboard.isKeyClass(nativeEvent, 'alpha') ||
		XXX_Device_Keyboard.isKeyClass(nativeEvent, 'integer') ||
		XXX_Device_Keyboard.isKeyClass(nativeEvent, 'operator') ||
		XXX_Device_Keyboard.isKeyClass(nativeEvent, 'punctuation')
	)
	{
		this.resetDataFromSelectedSuggestionOption();
		
		requestSuggestions = true;
	}
		
	if (requestSuggestions)
	{
		this.cancelPreviousSuggestions();
		
		if (this.requestSuggestionsDelay > 0)
		{
			this.startRequestSuggestionsDelay();
		}
		else
		{
			this.requestSuggestions();
		}
	}
	
	this.previousCaretPosition = caretPosition;
};

XXX_SuggestionController.prototype.keyDownHandler = function (nativeEvent)
{
	if (XXX_Device_Keyboard.isKey(nativeEvent, 'enter'))
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
	}
};

XXX_SuggestionController.prototype.startRequestSuggestionsDelay = function ()
{
	if (this.requestSuggestionsDelayInstance)
	{
		XXX_Timer.cancelDelay(this.requestSuggestionsDelayInstance);
	}
	
	var XXX_SuggestionController_instance = this;
	
	this.requestSuggestionsDelayInstance = XXX_Timer.startDelay(this.requestSuggestionsDelay, function ()
	{
		XXX_SuggestionController_instance.requestSuggestions();
	});	
};

XXX_SuggestionController.prototype.cancelPreviousSuggestions = function ()
{
	var valueAskingSuggestions = XXX_DOM_NativeHelpers.nativeCharacterLineInput.getValue(this.elements.input);
	var valueAskingSuggestionsCharacterLength = XXX_String.getCharacterLength(valueAskingSuggestions);	
	
	var filteredValueAskingSuggestions = XXX_String.filterSuggestion(valueAskingSuggestions);
	
	// Reset type ahead
	
	this.elements.suggestionOptionSelection.resetSuggestionOptions();			
	this.elements.suggestionOptionSelection.rerender();
		
	if (filteredValueAskingSuggestions == '')
	{
		this.valueAskingSuggestions = '';
		this.filteredValueAskingSuggestions = '';
	}
	else
	{
		this.valueAskingSuggestions = valueAskingSuggestions;
		this.filteredValueAskingSuggestions = filteredValueAskingSuggestions;
	}
};

XXX_SuggestionController.prototype.requestSuggestions = function ()
{
	if (this.filteredValueAskingSuggestions != '')
	{
		var XXX_SuggestionController_instance = this;
		
		var completedCallback = function (valueAskingSuggestions, processedSuggestions)
		{
			XXX_SuggestionController_instance.completedResponseHandler(valueAskingSuggestions, processedSuggestions);
		};
		
		var failedCallback = function ()
		{
			XXX_SuggestionController_instance.failedResponseHandler();
		};
		
		this.elements.suggestionProvider.requestSuggestions(this.valueAskingSuggestions, completedCallback, failedCallback);
	}
};

XXX_SuggestionController.prototype.failedResponseHandler = function (valueAskingSuggestions)
{
	// Still relevant?
	if (this.valueAskingSuggestions == valueAskingSuggestions)
	{
		XXX_JS.errorNotification(1, 'Reached controller failed');
	}
};

XXX_SuggestionController.prototype.completedResponseHandler = function (valueAskingSuggestions, processedSuggestions)
{	
	// Still relevant?
	if (this.valueAskingSuggestions == valueAskingSuggestions)
	{
		this.elements.suggestionOptionSelection.resetSuggestionOptions();
		this.elements.suggestionOptionSelection.addSuggestionOptions(processedSuggestions);		
		this.elements.suggestionOptionSelection.show();		
		this.elements.suggestionOptionSelection.rerender();
		
		var firstSuggestionOption = this.elements.suggestionOptionSelection.getFirstSuggestionOption();
		
		if (firstSuggestionOption)
		{
			// Correct with original valueAskingSuggestions
			// Set type ahead
		}
		else
		{
			// Reset type ahead
		}
	}
	else
	{
		XXX_JS.errorNotification(1, 'Received notifications not relevant to the current value asking suggestions');
	}
};

XXX_SuggestionController.prototype.setValue = function (value)
{
	var valueCharacterLength = XXX_String.getCharacterLength(value);
	
	XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.input, value);
	
	XXX_DOM_NativeHelpers.nativeSelectionHandling.setCaretPosition(this.elements.input, valueCharacterLength);
};
