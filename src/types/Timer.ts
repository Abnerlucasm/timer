export interface TimerConfig {
  id: string;
  name: string;
  duration: number; // em minutos (aceita decimais)
  videoFile?: string; // Base64 do arquivo de vídeo
  videoFileName?: string; // Nome do arquivo de vídeo
  notifications: {
    enabled: boolean;
    sound: boolean;
    visual: boolean;
    soundType: 'default' | 'beep' | 'chime' | 'alarm' | 'custom';
    customAudioFile?: string; // Base64 do arquivo de áudio personalizado
    customAudioName?: string; // Nome do arquivo original
    startSoundType: 'default' | 'beep' | 'chime' | 'alarm' | 'custom';
    startCustomAudioFile?: string; // Base64 do arquivo de áudio de início
    startCustomAudioName?: string; // Nome do arquivo de início
    intervals: number[]; // intervalos em minutos (aceita decimais)
  };
}

export interface ActiveTimer {
  id: string;
  config: TimerConfig;
  startTime: Date;
  endTime: Date;
  isRunning: boolean;
  isPaused: boolean;
  remainingTime: number; // em milissegundos
}

export interface NotificationSettings {
  soundEnabled: boolean;
  visualEnabled: boolean;
  volume: number; // 0-1
}
