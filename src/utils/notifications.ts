import { storage } from './storage';

export class NotificationManager {
  private audioContext: AudioContext | null = null;
  private settings = storage.getSettings();

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      // Só inicializa o AudioContext quando necessário
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        // Cria o contexto apenas se não existir
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Tenta resolver o contexto se estiver suspenso
        if (this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume();
          } catch (resumeError) {
            console.warn('Não foi possível resumir o AudioContext:', resumeError);
            // Tenta criar um novo contexto
            try {
              this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (createError) {
              console.warn('Não foi possível criar novo AudioContext:', createError);
              this.audioContext = null;
              return;
            }
          }
        }
        
        // Verifica se o contexto está funcionando
        if (this.audioContext && this.audioContext.state !== 'running') {
          console.warn('AudioContext não está funcionando, tentando recriar...');
          try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          } catch (recreateError) {
            console.warn('Não foi possível recriar AudioContext:', recreateError);
            this.audioContext = null;
          }
        }
      }
    } catch (error) {
      console.warn('AudioContext não suportado ou erro na inicialização:', error);
      this.audioContext = null;
    }
  }

  // Toca um som de notificação
  async playNotificationSound(soundType: 'default' | 'beep' | 'chime' | 'alarm' | 'custom' = 'default', customAudioFile?: string): Promise<void> {
    if (!this.settings.soundEnabled) return;

    try {
      // Inicializa o AudioContext se ainda não foi inicializado
      if (!this.audioContext) {
        await this.initializeAudio();
      }

      if (!this.audioContext) {
        console.warn('AudioContext não disponível - som desabilitado');
        return;
      }

      // Resume o contexto se estiver suspenso
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (resumeError) {
          console.warn('Não foi possível resumir AudioContext:', resumeError);
          // Tenta recriar o contexto
          try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (this.audioContext.state === 'suspended') {
              await this.audioContext.resume();
            }
          } catch (recreateError) {
            console.warn('Não foi possível recriar AudioContext:', recreateError);
            return;
          }
        }
      }

      // Verifica se o contexto está funcionando
      if (this.audioContext.state !== 'running') {
        console.warn('AudioContext não está funcionando:', this.audioContext.state);
        return;
      }

      switch (soundType) {
        case 'beep':
          this.playBeepSound();
          break;
        case 'chime':
          this.playChimeSound();
          break;
        case 'alarm':
          this.playAlarmSound();
          break;
        case 'custom':
          if (customAudioFile) {
            await this.playCustomAudioFile(customAudioFile);
          } else {
            this.playCustomSound();
          }
          break;
        default:
          this.playDefaultSound();
      }
    } catch (error) {
      console.error('Erro ao tocar som:', error);
      // Não propaga o erro para não quebrar o timer
    }
  }

  private playDefaultSound(): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime);
    oscillator.frequency.setValueAtTime(600, this.audioContext!.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, this.audioContext!.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.3);

    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.3);
  }

  private playBeepSound(): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator.frequency.setValueAtTime(1000, this.audioContext!.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.2, this.audioContext!.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.2);

    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.2);
  }

  private playChimeSound(): void {
    const oscillator1 = this.audioContext!.createOscillator();
    const oscillator2 = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    oscillator1.frequency.setValueAtTime(523, this.audioContext!.currentTime); // C5
    oscillator2.frequency.setValueAtTime(659, this.audioContext!.currentTime); // E5

    gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.2, this.audioContext!.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.5);

    oscillator1.start(this.audioContext!.currentTime);
    oscillator2.start(this.audioContext!.currentTime);
    oscillator1.stop(this.audioContext!.currentTime + 0.5);
    oscillator2.stop(this.audioContext!.currentTime + 0.5);
  }

  private playAlarmSound(): void {
    const oscillator = this.audioContext!.createOscillator();
    const gainNode = this.audioContext!.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext!.destination);

    // Som de alarme com frequência oscilante
    oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime);
    oscillator.frequency.setValueAtTime(1200, this.audioContext!.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, this.audioContext!.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(1200, this.audioContext!.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.4, this.audioContext!.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.4);

    oscillator.start(this.audioContext!.currentTime);
    oscillator.stop(this.audioContext!.currentTime + 0.4);
  }

  private playCustomSound(): void {
    // Fallback para som padrão se não houver arquivo customizado
    this.playDefaultSound();
  }

  private async playCustomAudioFile(base64Audio: string): Promise<void> {
    try {
      if (!this.audioContext || this.audioContext.state !== 'running') {
        console.warn('AudioContext não disponível para áudio personalizado');
        this.playDefaultSound();
        return;
      }

      // Converte base64 para ArrayBuffer
      const audioData = this.base64ToArrayBuffer(base64Audio);
      
      // Decodifica o áudio
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      
      // Cria source e gain nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      // Configura o áudio
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Ajusta o volume
      gainNode.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
      
      // Toca o áudio
      source.start(this.audioContext.currentTime);
      
      // Limpa os nodes após tocar
      source.onended = () => {
        try {
          source.disconnect();
          gainNode.disconnect();
        } catch (cleanupError) {
          console.warn('Erro ao limpar nodes de áudio:', cleanupError);
        }
      };
    } catch (error) {
      console.error('Erro ao tocar arquivo de áudio personalizado:', error);
      // Fallback para som padrão
      this.playDefaultSound();
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Mostra notificação visual
  showVisualNotification(message: string): void {
    if (!this.settings.visualEnabled) return;

    // Solicita permissão para notificações
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification('Timer App', {
        body: message,
        icon: '/favicon.ico',
        tag: 'timer-notification'
      });
    }

    // Flash na aba do navegador
    this.flashTab();
  }

  private flashTab(): void {
    let flashCount = 0;
    const maxFlashes = 3;
    const originalTitle = document.title;

    const flash = () => {
      if (flashCount < maxFlashes) {
        document.title = flashCount % 2 === 0 ? '🔔 Timer!' : originalTitle;
        flashCount++;
        setTimeout(flash, 500);
      } else {
        document.title = originalTitle;
      }
    };

    flash();
  }

  // Som de início do timer
  async playStartSound(soundType: 'default' | 'beep' | 'chime' | 'alarm' | 'custom' = 'default', customAudioFile?: string): Promise<void> {
    if (!this.settings.soundEnabled) return;
    
    try {
      await this.playNotificationSound(soundType, customAudioFile);
    } catch (error) {
      console.error('Erro ao tocar som de início:', error);
    }
  }

  // Notificação completa (som + visual)
  async notify(message: string, soundType: 'default' | 'beep' | 'chime' | 'alarm' | 'custom' = 'default', customAudioFile?: string): Promise<void> {
    try {
      await Promise.all([
        this.playNotificationSound(soundType, customAudioFile),
        this.showVisualNotification(message)
      ]);
    } catch (error) {
      console.error('Erro na notificação:', error);
      // Fallback: pelo menos mostra a notificação visual
      this.showVisualNotification(message);
    }
  }

  // Atualiza configurações
  updateSettings(newSettings: any): void {
    this.settings = { ...this.settings, ...newSettings };
    storage.saveSettings(this.settings);
  }
}
