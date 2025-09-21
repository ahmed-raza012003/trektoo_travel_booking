'use client';

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

/**
 * Progress Indicator Component
 * Shows the current step in a multi-step process with smooth animations
 */
export const ProgressIndicator = ({ 
  steps, 
  currentStep, 
  className = "",
  orientation = "horizontal" // "horizontal" or "vertical"
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div 
      className={`${isHorizontal ? 'flex items-center' : 'flex flex-col'} gap-4 ${className}`}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStep + 1} of ${steps.length}`}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="relative flex-shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : isCurrent 
                      ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-200' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Pulse animation for current step */}
              {isCurrent && (
                <div className="absolute inset-0 w-10 h-10 rounded-full bg-blue-400 animate-ping opacity-20"></div>
              )}
            </div>

            {/* Step Content */}
            <div className={`ml-3 ${isHorizontal ? '' : 'mb-4'}`}>
              <h3 
                className={`
                  text-sm font-semibold transition-colors duration-300
                  ${isCompleted || isCurrent 
                    ? 'text-gray-900' 
                    : 'text-gray-500'
                  }
                `}
              >
                {step.title}
              </h3>
              {step.description && (
                <p 
                  className={`
                    text-xs transition-colors duration-300
                    ${isCompleted || isCurrent 
                      ? 'text-gray-600' 
                      : 'text-gray-400'
                    }
                  `}
                >
                  {step.description}
                </p>
              )}
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  ${isHorizontal ? 'ml-3 flex-1 h-0.5' : 'ml-5 w-0.5 h-8'} 
                  transition-colors duration-300
                  ${isCompleted 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Compact Progress Indicator for mobile
 */
export const CompactProgressIndicator = ({ 
  steps, 
  currentStep, 
  className = "" 
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-sm text-gray-500">
          {steps[currentStep]?.title}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Floating Progress Button
 */
export const FloatingProgressButton = ({ 
  onClick, 
  disabled = false, 
  children, 
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-6 right-6 z-50 
        bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300
        text-white font-semibold px-6 py-3 rounded-full
        shadow-lg hover:shadow-xl transform hover:scale-105
        transition-all duration-300 ease-in-out
        disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default ProgressIndicator;

