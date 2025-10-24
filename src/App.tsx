import React, { useState } from 'react';
import { TimerConfig } from './types/Timer';
import TimerConfigComponent from './components/TimerConfig';
import TimerDisplayComponent from './components/TimerDisplay';

type AppPage = 'config' | 'timer';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('config');
  const [selectedTimer, setSelectedTimer] = useState<TimerConfig | null>(null);

  const handleTimerStart = (config: TimerConfig) => {
    setSelectedTimer(config);
    setCurrentPage('timer');
  };

  const handleBackToConfig = () => {
    setCurrentPage('config');
    setSelectedTimer(null);
  };

  return (
    <div className="App">
      {currentPage === 'config' && (
        <TimerConfigComponent onTimerStart={handleTimerStart} />
      )}
      
      {currentPage === 'timer' && selectedTimer && (
        <TimerDisplayComponent 
          config={selectedTimer} 
          onBack={handleBackToConfig}
        />
      )}
    </div>
  );
};

export default App;
