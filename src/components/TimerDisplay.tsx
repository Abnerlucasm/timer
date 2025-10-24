import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerConfig, ActiveTimer } from '../types/Timer';
import { storage } from '../utils/storage';
import { NotificationManager } from '../utils/notifications';
import { Button } from './ui/button';
import { ArrowLeft, Play, Pause, Square, Volume2, Eye, X } from 'lucide-react';

interface TimerDisplayProps {
  config: TimerConfig;
  onBack: () => void;
}

const TimerDisplayComponent: React.FC<TimerDisplayProps> = ({ config, onBack }) => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [notificationsSent, setNotificationsSent] = useState<Set<number>>(new Set());
  const [showVideo, setShowVideo] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationManager = useRef(new NotificationManager());

  useEffect(() => {
    try {
      // Carrega timer ativo do localStorage se existir
      const savedTimer = storage.getActiveTimer();
      if (savedTimer && savedTimer.config.id === config.id) {
        // Converte as datas de string para Date se necessário
        const timerWithDates = {
          ...savedTimer,
          startTime: new Date(savedTimer.startTime),
          endTime: new Date(savedTimer.endTime)
        };
        setActiveTimer(timerWithDates);
        setRemainingTime(savedTimer.remainingTime);
        setIsRunning(savedTimer.isRunning);
        setIsPaused(savedTimer.isPaused);
      } else {
        // Cria novo timer
        const now = new Date();
        const endTime = new Date(now.getTime() + config.duration * 60 * 1000);
        const newTimer: ActiveTimer = {
          id: Date.now().toString(),
          config,
          startTime: now,
          endTime,
          isRunning: false,
          isPaused: false,
          remainingTime: config.duration * 60 * 1000
        };
        setActiveTimer(newTimer);
        setRemainingTime(newTimer.remainingTime);
      }
    } catch (error) {
      console.error('Erro ao inicializar timer:', error);
      // Fallback: cria timer básico
      const now = new Date();
      const endTime = new Date(now.getTime() + config.duration * 60 * 1000);
      const fallbackTimer: ActiveTimer = {
        id: Date.now().toString(),
        config,
        startTime: now,
        endTime,
        isRunning: false,
        isPaused: false,
        remainingTime: config.duration * 60 * 1000
      };
      setActiveTimer(fallbackTimer);
      setRemainingTime(fallbackTimer.remainingTime);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config]);

  const handleTimerComplete = useCallback(async () => {
    try {
      setIsRunning(false);
      setIsPaused(false);
      const message = `${config.name} concluído!`;
      
      try {
        await notificationManager.current.notify(
          message, 
          config.notifications.soundType,
          config.notifications.customAudioFile
        );
      } catch (notificationError) {
        console.warn('Erro ao enviar notificação de conclusão:', notificationError);
        // Continua mesmo se a notificação falhar
      }
      
      // Mostra vídeo se configurado
      if (config.videoFile) {
        try {
          setShowVideo(true);
          // Tenta abrir em fullscreen automaticamente após um pequeno delay
          setTimeout(() => {
            try {
              const video = document.querySelector('video');
              if (video) {
                if (video.requestFullscreen) {
                  video.requestFullscreen().catch(console.error);
                } else if ((video as any).webkitRequestFullscreen) {
                  (video as any).webkitRequestFullscreen().catch(console.error);
                } else if ((video as any).msRequestFullscreen) {
                  (video as any).msRequestFullscreen().catch(console.error);
                }
              }
            } catch (fullscreenError) {
              console.warn('Erro ao abrir vídeo em fullscreen:', fullscreenError);
            }
          }, 1000); // Delay de 1 segundo para garantir que o vídeo carregou
        } catch (videoError) {
          console.warn('Erro ao mostrar vídeo:', videoError);
        }
      }
      
      try {
        storage.clearActiveTimer();
      } catch (storageError) {
        console.warn('Erro ao limpar timer ativo:', storageError);
      }
    } catch (error) {
      console.error('Erro ao completar timer:', error);
      // Reset para estado seguro
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [config.name, config.videoFile, config.notifications.soundType, config.notifications.customAudioFile]);

  useEffect(() => {
    try {
      if (isRunning && !isPaused) {
        intervalRef.current = setInterval(() => {
          try {
            setRemainingTime((prev: number) => {
              const newTime = prev - 1000;
              if (newTime <= 0) {
                handleTimerComplete();
                return 0;
              }
              return newTime;
            });
          } catch (timerError) {
            console.error('Erro no timer:', timerError);
            // Para o timer em caso de erro
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }, 1000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    } catch (error) {
      console.error('Erro ao configurar timer:', error);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, handleTimerComplete]);

  // Salva estado do timer no localStorage
  useEffect(() => {
    try {
      if (activeTimer) {
        const updatedTimer = {
          ...activeTimer,
          remainingTime,
          isRunning,
          isPaused
        };
        storage.saveActiveTimer(updatedTimer);
      }
    } catch (error) {
      console.warn('Erro ao salvar estado do timer:', error);
      // Continua sem quebrar a aplicação
    }
  }, [activeTimer, remainingTime, isRunning, isPaused]);

  // Verifica notificações
  useEffect(() => {
    if (activeTimer && isRunning && !isPaused) {
      try {
        const totalDuration = activeTimer.config.duration * 60 * 1000;
        const elapsed = totalDuration - remainingTime;
        
        // Verifica se deve enviar notificação
        activeTimer.config.notifications.intervals.forEach((interval: number) => {
          try {
            const intervalMs = interval * 60 * 1000;
            const timeToNotify = totalDuration - intervalMs;
            
            if (elapsed >= timeToNotify && !notificationsSent.has(interval)) {
              const message = `${activeTimer.config.name}: ${interval} minutos restantes!`;
              notificationManager.current.notify(
                message, 
                activeTimer.config.notifications.soundType,
                activeTimer.config.notifications.customAudioFile
              );
              setNotificationsSent((prev: Set<number>) => new Set(Array.from(prev).concat(interval)));
            }
          } catch (notificationError) {
            console.warn('Erro ao enviar notificação:', notificationError);
            // Continua sem quebrar o timer
          }
        });
      } catch (error) {
        console.error('Erro no sistema de notificações:', error);
        // Continua sem quebrar o timer
      }
    }
  }, [remainingTime, activeTimer, isRunning, isPaused, notificationsSent, handleTimerComplete]);

  const handleStart = async () => {
    try {
      setIsRunning(true);
      setIsPaused(false);
      
      // Toca som de início
      if (config.notifications.sound) {
        try {
          await notificationManager.current.playStartSound(
            config.notifications.startSoundType || 'default',
            config.notifications.startCustomAudioFile
          );
        } catch (error) {
          console.warn('Erro ao tocar som de início:', error);
          // Continua mesmo se o som falhar
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar timer:', error);
      // Reset para estado seguro
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(activeTimer?.config.duration ? activeTimer.config.duration * 60 * 1000 : 0);
    setNotificationsSent(new Set());
    storage.clearActiveTimer();
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!activeTimer) return 0;
    const totalDuration = activeTimer.config.duration * 60 * 1000;
    return ((totalDuration - remainingTime) / totalDuration) * 100;
  };

  const getColorFromProgress = (progress: number) => {
    if (progress >= 80) {
      // Visual mais agressivo nos últimos 20%
      const intensity = (progress - 80) / 20;
      return `rgb(${255}, ${Math.floor(255 * (1 - intensity))}, 0)`;
    } else {
      // Transição suave de verde para amarelo
      const intensity = progress / 80;
      const red = Math.floor(255 * intensity);
      const green = 255;
      const blue = Math.floor(255 * (1 - intensity));
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const getFontSize = (progress: number) => {
    if (progress >= 80) {
      // Aumenta o tamanho da fonte progressivamente nos últimos 20%
      const intensity = (progress - 80) / 20;
      const baseSize = 10; // Base maior
      const maxSize = 16; // Máximo muito maior
      const size = baseSize + (maxSize - baseSize) * intensity;
      return `${size}rem`;
    }
    return '8rem'; // Base maior para o timer normal
  };


  const progress = getProgressPercentage();
  const backgroundColor = getColorFromProgress(progress);

  if (!activeTimer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-white transition-all duration-1000"
      style={{ backgroundColor }}
    >
      {/* Header com informações do timer */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border-white/20 text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{activeTimer.config.name}</h1>
          <div className="text-sm opacity-90">
            <div>Início: {activeTimer.startTime.toLocaleTimeString('pt-BR')}</div>
            <div>Fim previsto: {activeTimer.endTime.toLocaleTimeString('pt-BR')}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm opacity-90">
            <div>Progresso: {progress.toFixed(1)}%</div>
            <div className="text-xs flex items-center gap-2">
              {activeTimer.config.notifications.sound && <Volume2 className="w-3 h-3" />}
              {activeTimer.config.notifications.visual && <Eye className="w-3 h-3" />}
            </div>
          </div>
        </div>
      </div>

      {/* Timer principal */}
      <div className="text-center">
        <div 
          className={`font-mono font-bold mb-8 drop-shadow-lg transition-all duration-1000 ${
            progress >= 80 ? 'animate-urgent-pulse animate-urgent-glow' : 'animate-gentle-glow'
          }`}
          style={{ 
            fontSize: getFontSize(progress)
          }}
        >
          {formatTime(remainingTime)}
        </div>
        
        {/* Barra de progresso */}
        <div className="w-80 md:w-96 h-4 bg-white bg-opacity-20 rounded-full mb-8 overflow-hidden relative">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-out absolute top-0 left-0"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controles */}
        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border-white/20 text-white text-xl px-8 py-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                size="lg"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border-white/20 text-white text-xl px-8 py-4"
              >
                {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                {isPaused ? 'Continuar' : 'Pausar'}
              </Button>
              
              <Button
                onClick={handleStop}
                size="lg"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border-white/20 text-white text-xl px-8 py-4"
              >
                <Square className="w-5 h-5 mr-2" />
                Parar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm opacity-75 mb-1">Duração Total</div>
              <div className="text-lg font-semibold">
                {formatTime(activeTimer.config.duration * 60 * 1000)}
              </div>
            </div>
            
            <div>
              <div className="text-sm opacity-75 mb-1">Tempo Decorrido</div>
              <div className="text-lg font-semibold">
                {formatTime((activeTimer.config.duration * 60 * 1000) - remainingTime)}
              </div>
            </div>
            
            <div>
              <div className="text-sm opacity-75 mb-1">Próxima Notificação</div>
              <div className="text-lg font-semibold">
                {(() => {
                  const totalDuration = activeTimer.config.duration * 60 * 1000;
                  const elapsed = totalDuration - remainingTime;
                  const nextInterval = activeTimer.config.notifications.intervals
                    .find((interval: number) => {
                      const intervalMs = interval * 60 * 1000;
                      const timeToNotify = totalDuration - intervalMs;
                      return elapsed < timeToNotify;
                    });
                  
                  if (nextInterval) {
                    const timeToNext = (totalDuration - (nextInterval * 60 * 1000)) - elapsed;
                    return formatTime(timeToNext);
                  }
                  return 'Nenhuma';
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Modal do vídeo */}
      {showVideo && config.videoFile && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Vídeo em tela cheia */}
          <div className="w-full h-full relative">
            {config.videoFile && (
                <video
                  ref={(video) => {
                    if (video) {
                      // Força o autoplay
                      video.muted = false;
                      video.autoplay = true;
                      video.play().catch((error) => {
                        console.warn('Erro no autoplay, tentando com muted:', error);
                        // Fallback: tenta com muted primeiro, depois remove
                        video.muted = true;
                        video.play().then(() => {
                          video.muted = false;
                        }).catch(console.error);
                      });
                    }
                  }}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted={false}
                  playsInline
                  style={{ border: 'none' }}
                >
                <source src={`data:video/mp4;base64,${config.videoFile}`} type="video/mp4" />
                <source src={`data:video/webm;base64,${config.videoFile}`} type="video/webm" />
                <source src={`data:video/ogg;base64,${config.videoFile}`} type="video/ogg" />
                Seu navegador não suporta vídeos.
              </video>
            )}
            
            {/* Botão de Fechar */}
            <Button
              onClick={() => setShowVideo(false)}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white border-white/20 z-10"
              title="Fechar Vídeo"
            >
              <X className="w-4 h-4" />
            </Button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerDisplayComponent;
