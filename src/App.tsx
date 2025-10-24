import React, { useState } from 'react';
import { TimerConfig } from './types/Timer';
import TimerConfigComponent from './components/TimerConfig';
import TimerDisplayComponent from './components/TimerDisplay';
import HeroSection from './components/HeroSection';
import ErrorBoundary from './components/ErrorBoundary';

type AppPage = 'home' | 'config' | 'timer';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [selectedTimer, setSelectedTimer] = useState<TimerConfig | null>(null);

  const handleTimerStart = (config: TimerConfig) => {
    setSelectedTimer(config);
    setCurrentPage('timer');
  };

  const handleBackToConfig = () => {
    setCurrentPage('config');
    setSelectedTimer(null);
  };

  const handleGetStarted = () => {
    setCurrentPage('config');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <ErrorBoundary>
      <div className="App">
        {currentPage === 'home' && (
          <HeroSection onGetStarted={handleGetStarted} />
        )}
        
        {currentPage === 'config' && (
          <TimerConfigComponent 
            onTimerStart={handleTimerStart} 
            onBackToHome={handleBackToHome}
          />
        )}
        
        {currentPage === 'timer' && selectedTimer && (
          <TimerDisplayComponent 
            config={selectedTimer} 
            onBack={handleBackToConfig}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
