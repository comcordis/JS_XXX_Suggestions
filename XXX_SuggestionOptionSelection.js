var XXX_SuggestionOptionSelection = function (parent, suggestionController)
{
	this.ID = XXX.createID();
	
	this.suggestionOptions = [];
	
	this.selectedIndex = -1;
	
	this.mouseOver = false;
	
	this.IDToSuggestionOptionConversion = {};
	
	this.elements = {};
	
	this.elements.parent = XXX_DOM.get(parent);
	
	this.elements.suggestionOptionsContainer = XXX_DOM.createElementNode('div');
	XXX_CSS.setClass(this.elements.suggestionOptionsContainer, 'dialog');
	XXX_DOM.appendChildNode(XXX_DOM.getBody(), this.elements.suggestionOptionsContainer);
	
		
	this.elements.suggestionOptions = XXX_DOM.createElementNode('div');
	XXX_CSS.setClass(this.elements.suggestionOptions, 'suggestionOptions');
	XXX_DOM.appendChildNode(this.elements.suggestionOptionsContainer, this.elements.suggestionOptions);
	
	var clearFloats = XXX_DOM.createElementNode('span');
	XXX_CSS.setClass(clearFloats, 'clearFloats');
	XXX_DOM.appendChildNode(this.elements.suggestionOptionsContainer, clearFloats);
	
	
	this.elements.suggestionController = suggestionController;
	
	var XXX_SuggestionOptionSelection_instance = this;
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.suggestionOptions, 'mouseOut', function (nativeEvent)
	{	
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
		
		XXX_SuggestionOptionSelection_instance.suggestionOptionsMousedOut();
	});
	
	XXX_CSS.setStyle(this.elements.suggestionOptionsContainer, 'display', 'none');
};

XXX_SuggestionOptionSelection.prototype.propagateDownSelectedSuggestion = function ()
{
	this.elements.suggestionController.propagateDataFromSelectedSuggestionOption();
};

XXX_SuggestionOptionSelection.prototype.suggestionOptionClicked = function (ID)
{
	var temp = this.IDToSuggestionOptionConversion[ID];
			
	if (temp)
	{
		var index = temp.index;
					
		if (index >= -1 && index <= XXX_Array.getFirstLevelItemTotal(this.suggestionOptions) - 1)
		{
			this.selectedIndex = index;
		}
		
		this.propagateDownSelectedSuggestion();
		
		this.resetSuggestionOptions();
		this.rerender();
		
		this.hide();
	}
};

XXX_SuggestionOptionSelection.prototype.suggestionOptionMousedOver = function (ID)
{
	if (!this.mouseOver)
	{
		this.mouseOver = true;
		
		var temp = this.IDToSuggestionOptionConversion[ID];
			
		if (temp)
		{
			var index = temp.index;
					
			if (index >= -1 && index <= XXX_Array.getFirstLevelItemTotal(this.suggestionOptions) - 1)
			{
				this.selectedIndex = index;
			}
			
			this.rehighlight();
		}
	}
};

XXX_SuggestionOptionSelection.prototype.suggestionOptionsMousedOut = function ()
{
	this.selectedIndex = -1;
			
	this.rehighlight();
	
	this.mouseOver = false;
};
	
XXX_SuggestionOptionSelection.prototype.selectNextSuggestionOption = function ()
{
	var newIndex = this.selectedIndex;
	
	if (newIndex == XXX_Array.getFirstLevelItemTotal(this.suggestionOptions) - 1)
	{
		newIndex = -1;
	}
	else
	{
		newIndex = newIndex + 1;
	}	
	
	this.selectedIndex = newIndex;
};

XXX_SuggestionOptionSelection.prototype.selectPreviousSuggestionOption = function ()
{
	var newIndex = this.selectedIndex;
	
	if (newIndex == -1)
	{
		newIndex = XXX_Array.getFirstLevelItemTotal(this.suggestionOptions) - 1;
	}
	else
	{
		newIndex = newIndex - 1;
	}
	
	this.selectedIndex = newIndex;		
};

XXX_SuggestionOptionSelection.prototype.resetSuggestionOptions = function ()
{
	this.suggestionOptions = [];
	this.selectedIndex = -1;
	
	this.mouseOver = false;
};

XXX_SuggestionOptionSelection.prototype.addSuggestionOptions = function (suggestionOptions)
{
	//suggestionOptions = XXX_SuggestionProviderHelpers.sortSuggestions(suggestionOptions); // TODO
		
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(suggestionOptions); i < iEnd; ++i)
	{
		var suggestionOption = suggestionOptions[i];
		
		if (XXX_Type.isEmpty(suggestionOption.suggestedValue))
		{
			suggestionOption.suggestedValue = suggestionOption.valueAskingSuggestions + suggestionOption.complement;
		}
		
		if (XXX_Type.isEmpty(suggestionOption.label))
		{
			suggestionOption.label = suggestionOption.valueAskingSuggestions + '<b>' + suggestionOption.complement + '</b>';
		}
		
		this.suggestionOptions.push(suggestionOption);
	}
};

XXX_SuggestionOptionSelection.prototype.getFirstSuggestionOption = function ()
{
	var result = false;
	
	if (XXX_Array.getFirstLevelItemTotal(this.suggestionOptions))
	{
		result = this.suggestionOptions[0];
	}
	
	return result;
};

XXX_SuggestionOptionSelection.prototype.getSelectedSuggestionOption = function ()
{
	var result = false;
	
	if (this.selectedIndex > -1)
	{
		result = this.suggestionOptions[this.selectedIndex];
	}
	
	return result;
};

XXX_SuggestionOptionSelection.prototype.getSuggestionOptionTotal = function ()
{
	return XXX_Array.getFirstLevelItemTotal(this.suggestionOptions);
};

XXX_SuggestionOptionSelection.prototype.rehighlight = function ()
{
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.suggestionOptions); i < iEnd; ++i)
	{
		var tempDiv = this.elements.suggestionOptionLinks[i];
		
		XXX_CSS.setClass(tempDiv, (i == this.selectedIndex ? 'suggestionOptionSelected' : 'suggestionOption'));
	}
};

XXX_SuggestionOptionSelection.prototype.rerender = function ()
{
	var tempSuggestionOptions = '';
	
	this.elements.suggestionOptionLinks = [];
	
	XXX_DOM.removeChildNodes(this.elements.suggestionOptions);
	
	this.IDToSuggestionOptionConversion = [];
	
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.suggestionOptions); i < iEnd; ++i)
	{
		var suggestionOption = this.suggestionOptions[i];
		suggestionOption.index = i;
		
		var ID = this.ID + '_suggestionOption_' + i;
		
		this.IDToSuggestionOptionConversion[ID] = suggestionOption;
		
		var tempDiv = XXX_DOM.createElementNode('div');
		XXX_DOM.setID(tempDiv, ID);
		XXX_CSS.setClass(tempDiv, (i == this.selectedIndex ? 'suggestionOptionSelected' : 'suggestionOption'));
		XXX_DOM.setInner(tempDiv, suggestionOption.label);
		
		XXX_DOM.appendChildNode(this.elements.suggestionOptions, tempDiv);
		
		this.elements.suggestionOptionLinks.push(tempDiv);
	}
	
	if (iEnd == 0)
	{
		this.hide();
	}
	else
	{
		this.show();
	}
	
	var XXX_SuggestionOptionSelection_instance = this;
	
	for (var key in this.IDToSuggestionOptionConversion)
	{
		var ID = key;
		
		XXX_DOM_NativeEventDispatcher.addEventListener(ID, 'mouseOver', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_SuggestionOptionSelection_instance.suggestionOptionMousedOver(this.id);
		});
				
		XXX_DOM_NativeEventDispatcher.addEventListener(ID, 'mousedown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_SuggestionOptionSelection_instance.suggestionOptionClicked(this.id);
		});
	}
};

XXX_SuggestionOptionSelection.prototype.show = function ()
{
	XXX_CSS.setStyle(this.elements.suggestionOptionsContainer, 'display', 'block');
	
	this.reposition();
};

XXX_SuggestionOptionSelection.prototype.hide = function ()
{
	XXX_CSS.setStyle(this.elements.suggestionOptionsContainer, 'display', 'none');
};

XXX_SuggestionOptionSelection.prototype.reposition = function ()
{
	XXX_CSS_Position.nextToOffsetElement(this.elements.suggestionController.elements.input, this.elements.suggestionOptionsContainer, ['bottomRight'], 5);
};