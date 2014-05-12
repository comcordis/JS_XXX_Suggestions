/*

Steps are subsequent
Within steps in parallel

*/

var XXX_CombinedSuggestionProvider = function ()
{
	this.valueAskingSuggestions = '';
	this.completedCallback = false;
	
	this.gradualCompletion = true;
	
	this.elements = {};
	
	this.elements.steps = [];
	
	this.maximumResults = 5;
	
	this.steps = 0;
	
	this.currentStep = 0;
	
	this.expectedResponsesForThisStep = 0;
	this.receivedResponsesForThisStep = 0;
	
	this.suggestionOptionsQueue = [];
	
	this.suggestionOptionsQueueSortingCallback = false;
	
	this.cancelledPreviousRequest = false;
};

XXX_CombinedSuggestionProvider.prototype.setMaximumResults = function (maximumResults)
{
	this.maximumResults = XXX_Default.toPositiveInteger(maximumResults, 5);
};

XXX_CombinedSuggestionProvider.prototype.setSuggestionOptionsQueueSortingCallback = function (suggestionOptionsQueueSortingCallback)
{
	this.suggestionOptionsQueueSortingCallback = suggestionOptionsQueueSortingCallback;
};

XXX_CombinedSuggestionProvider.prototype.requestSuggestions = function (valueAskingSuggestions, completedCallback, failedCallback)
{
	this.valueAskingSuggestions = valueAskingSuggestions;
	
	this.completedCallback = completedCallback;
	this.failedCallback = failedCallback;
	
	this.currentStep = 0;
	
	this.expectedResponsesForThisStep = 0;
	this.receivedResponsesForThisStep = 0;
	
	this.suggestionOptionsQueue = [];
	
	this.cancelledPreviousRequest = false;
	
	this.tryNextStep();
};

XXX_CombinedSuggestionProvider.prototype.cancelRequestSuggestions = function ()
{
	this.cancelledPreviousRequest = true;
	
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.elements.steps); i < iEnd; ++i)
	{
		for (var j = 0, jEnd = XXX_Array.getFirstLevelItemTotal(this.elements.steps[i]); j < jEnd; ++j)
		{
			this.elements.steps[i][j].cancelRequestSuggestions();
		}
	}
};


XXX_CombinedSuggestionProvider.prototype.tryNextStep = function ()
{
	if (!this.cancelledPreviousRequest)
	{
		if (XXX_Array.getFirstLevelItemTotal(this.suggestionOptionsQueue) < this.maximumResults)
		{
			if (this.currentStep < this.steps)
			{
				var subSuggestionProvidersForStep = this.elements.steps[this.currentStep];
				
				this.expectedResponsesForThisStep = XXX_Array.getFirstLevelItemTotal(subSuggestionProvidersForStep);
				this.receivedResponsesForThisStep = 0;
				
				++this.currentStep;
				
				if (this.expectedResponsesForThisStep)
				{
					var XXX_CombinedSuggestionProvider_instance = this;
					
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(subSuggestionProvidersForStep); i < iEnd; ++i)
					{
						var internalIndex = [this.currentStep, i];
						
						var subSuggestionProviderFailedCallback = function (valueAskingSuggestions)
						{
							XXX_CombinedSuggestionProvider_instance.failedResponseHandler(internalIndex, valueAskingSuggestions);
						};
						
						var subSuggestionProviderCompletedCallback = function (valueAskingSuggestions, suggestionOptions)
						{
							XXX_CombinedSuggestionProvider_instance.completedResponseHandler(internalIndex, valueAskingSuggestions, suggestionOptions);
						};
						
						subSuggestionProvidersForStep[i].requestSuggestions(this.valueAskingSuggestions, subSuggestionProviderCompletedCallback, subSuggestionProviderFailedCallback);
					}
				}
				else
				{
					this.tryNextStep();
				}
			}
			else
			{
				this.triggerCompletedCallback();
			}
		}
		else
		{
			this.triggerCompletedCallback();
		}
	}
};

XXX_CombinedSuggestionProvider.prototype.triggerCompletedCallback = function ()
{
	if (this.completedCallback)
	{
		var suggestionOptionsQueue = this.suggestionOptionsQueue;
		
		var filteredSuggestionOptionsQueue = [];
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.suggestionOptionsQueue); i < iEnd; ++i)
		{
			filteredSuggestionOptionsQueue.push(this.suggestionOptionsQueue[i][1]);
		}
		
		filteredSuggestionOptionsQueue = XXX_Array.getPart(filteredSuggestionOptionsQueue, 0, this.maximumResults);
		
		this.completedCallback(this.valueAskingSuggestions, filteredSuggestionOptionsQueue);
	}
};

XXX_CombinedSuggestionProvider.prototype.failedResponseHandler = function (internalIndex, valueAskingSuggestions)
{
	if (valueAskingSuggestions == this.valueAskingSuggestions)
	{	
		++this.receivedResponsesForThisStep;
		
		if (this.receivedResponsesForThisStep == this.expectedResponsesForThisStep)
		{
			this.tryNextStep();
			
			// TODO, place results in front of other? As in if google places is faster, use that first
			
			/*
			
			Try all on a step at the same time,
			Internal order determines prefixing, suffixing etc.
			
			*/
		}
	}
};

XXX_CombinedSuggestionProvider.prototype.completedResponseHandler = function (internalIndex, valueAskingSuggestions, suggestionOptions)
{
	if (valueAskingSuggestions == this.valueAskingSuggestions)
	{	
		++this.receivedResponsesForThisStep;
		
		if (XXX_Type.isArray(internalIndex))
		{
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(suggestionOptions); i < iEnd; ++i)
			{
				this.suggestionOptionsQueue.push([internalIndex, suggestionOptions[i]]);
			}
		}
		
		if (this.suggestionOptionsQueueSortingCallback)
		{
			this.suggestionOptionsQueue.sort(this.suggestionOptionsQueueSortingCallback);
		}
		else
		{		
			this.suggestionOptionsQueue.sort(function (a, b)
			{
				var result = 0;
				
				if (a[0][0] == b[0][0])
				{
					if (a[0][1] < b[0][1])
					{
						result = 1;
					}
					else if (a[0][1] > b[0][1])
					{
						result = -1;
					}
				}
				else if (a[0][0] < b[0][0])
				{
					result = 1;
				}
				else if (a[0][0] > b[0][0])
				{
					result = -1;
				}
				
				return result;
			});
		}
		
		if (this.gradualCompletion)
		{
			this.triggerCompletedCallback();
		}
		
		if (this.receivedResponsesForThisStep == this.expectedResponsesForThisStep)
		{
			this.tryNextStep();
		}
	}
};

XXX_CombinedSuggestionProvider.prototype.addSuggestionProvidersForStep = function ()
{
	var suggestionProvidersForStep = arguments;
	
	if (XXX_Type.isNumericArray(suggestionProvidersForStep[0]))
	{
		suggestionProvidersForStep = suggestionProvidersForStep[0];
	}
		
	var tempSuggestionProvidersForStep = [];
	
	for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(suggestionProvidersForStep); i < iEnd; ++i)
	{
		tempSuggestionProvidersForStep.push(suggestionProvidersForStep[i]);
	}
	
	this.elements.steps.push(tempSuggestionProvidersForStep);
	
	++this.steps;
};