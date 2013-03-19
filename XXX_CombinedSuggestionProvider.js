
var XXX_CombinedSuggestionProvider = function ()
{
	this.valueAskingSuggestions = '';
	this.completedCallback = false;
	
	this.elements = {};
	
	this.elements.steps = [];
	
	this.steps = 0;
	
	this.step = 0;
	
	this.expectedResponsesForThisStep = 0;
	this.receivedResponsesForThisStep = 0;
	
	this.suggestionOptionsQueue = [];
};

XXX_CombinedSuggestionProvider.prototype.requestSuggestions = function (valueAskingSuggestions, completedCallback, failedCallback)
{
	this.valueAskingSuggestions = valueAskingSuggestions;
	this.completedCallback = completedCallback;
	this.failedCallback = failedCallback;
	
	this.step = 0;
	this.suggestionOptionsQueue = [];
	
	this.tryNextStep();
};

XXX_CombinedSuggestionProvider.prototype.tryNextStep = function ()
{
	XXX_JS.errorNotification(1, 'Trying step ' + this.step);
	
	if (XXX_Array.getFirstLevelItemTotal(this.suggestionOptionsQueue) == 0)
	{	
		var subSuggestionProvidersForStep = this.elements.steps[this.step];
		
		++this.step;
		
		this.expectedResponsesForThisStep = XXX_Array.getFirstLevelItemTotal(subSuggestionProvidersForStep);
		this.receivedResponsesForThisStep = 0;
		
		var XXX_CombinedSuggestionProvider_instance = this;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(subSuggestionProvidersForStep); i < iEnd; ++i)
		{
			var subSuggestionProviderFailedCallback = function ()
			{
				XXX_CombinedSuggestionProvider_instance.failedResponseHandler();
			};
			
			var subSuggestionProviderCompletedCallback = function (valueAskingSuggestions, suggestionOptions)
			{
				XXX_CombinedSuggestionProvider_instance.completedResponseHandler(valueAskingSuggestions, suggestionOptions);
			};
			
			subSuggestionProvidersForStep[i].requestSuggestions(this.valueAskingSuggestions, subSuggestionProviderCompletedCallback, subSuggestionProviderFailedCallback);
		}
			
		
		if (this.step == this.steps)
		{
			if (this.completedCallback)
			{
				this.completedCallback(this.valueAskingSuggestions, this.suggestionOptionsQueue);
			}
		}
	}
	else
	{
		if (this.completedCallback)
		{
			this.completedCallback(this.valueAskingSuggestions, this.suggestionOptionsQueue);
		}
	}
};

XXX_CombinedSuggestionProvider.prototype.failedResponseHandler = function ()
{
	//XXX_JS.errorNotification(1, 'Received step ' + this.step + ' failed response');
	
	++this.receivedResponsesForThisStep;
	
	if (this.receivedResponsesForThisStep == this.expectedResponsesForThisStep)
	{
		this.tryNextStep();
	}
};

XXX_CombinedSuggestionProvider.prototype.completedResponseHandler = function (valueAskingSuggestions, suggestionOptions)
{
	//XXX_JS.errorNotification(1, 'Received step ' + this.step + ' completed response');
	
	XXX.debug.blaap43 = suggestionOptions;
	
	++this.receivedResponsesForThisStep;
	
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(suggestionOptions); i < iEnd; ++i)
	{
		this.suggestionOptionsQueue.push(suggestionOptions[i]);
	}
	
	this.receivedResponses += 1;
	
	if (this.receivedResponsesForThisStep == this.expectedResponsesForThisStep)
	{
		this.tryNextStep();
	}
};

XXX_CombinedSuggestionProvider.prototype.addSuggestionProvidersForStep = function ()
{
	var tempArguments = arguments;
	
	var subSuggestionProvidersForStep = [];
	
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(tempArguments); i < iEnd; ++i)
	{
		subSuggestionProvidersForStep.push(tempArguments[i]);
	}
	
	this.elements.steps.push(subSuggestionProvidersForStep);
	
	++this.steps;
};