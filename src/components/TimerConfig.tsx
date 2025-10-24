import React, { useState, useEffect } from 'react';
import { TimerConfig } from '../types/Timer';
import { storage } from '../utils/storage';

interface TimerConfigProps {
  onTimerStart: (config: TimerConfig) => void;
}

const TimerConfigComponent: React.FC<TimerConfigProps> = ({ onTimerStart }) => {
  const [timers, setTimers] = useState<TimerConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTimer, setEditingTimer] = useState<TimerConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    videoFile: '',
    videoFileName: '',
    soundEnabled: true,
    visualEnabled: true,
    soundType: 'default' as 'default' | 'beep' | 'chime' | 'alarm' | 'custom',
    customAudioFile: '',
    customAudioName: '',
    startSoundType: 'default' as 'default' | 'beep' | 'chime' | 'alarm' | 'custom',
    startCustomAudioFile: '',
    startCustomAudioName: '',
    intervals: [60, 30, 15, 5] as number[]
  });

  useEffect(() => {
    loadTimers();
  }, []);

  const loadTimers = () => {
    const savedTimers = storage.getTimers();
    setTimers(savedTimers);
  };

  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isStartSound: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica se é um arquivo de áudio
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, etc.)');
      return;
    }

    // Verifica o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo de áudio deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove o prefixo "data:audio/...;base64," para obter apenas o base64
      const base64 = result.split(',')[1];
      
      if (isStartSound) {
        setFormData({
          ...formData,
          startCustomAudioFile: base64,
          startCustomAudioName: file.name
        });
      } else {
        setFormData({
          ...formData,
          customAudioFile: base64,
          customAudioName: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica se é um arquivo de vídeo
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione um arquivo de vídeo válido (MP4, WebM, OGG, etc.)');
      return;
    }

    // Verifica o tamanho do arquivo (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('O arquivo de vídeo deve ter no máximo 50MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      
      setFormData({
        ...formData,
        videoFile: base64,
        videoFileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const saveTimer = () => {
    if (!formData.name.trim()) {
      alert('Por favor, insira um nome para o timer');
      return;
    }

    const newTimer: TimerConfig = {
      id: editingTimer?.id || Date.now().toString(),
      name: formData.name.trim(),
      duration: formData.duration,
      videoFile: formData.videoFile || undefined,
      videoFileName: formData.videoFileName || undefined,
      notifications: {
        enabled: formData.soundEnabled || formData.visualEnabled,
        sound: formData.soundEnabled,
        visual: formData.visualEnabled,
        soundType: formData.soundType,
        customAudioFile: formData.customAudioFile || undefined,
        customAudioName: formData.customAudioName || undefined,
        startSoundType: formData.startSoundType,
        startCustomAudioFile: formData.startCustomAudioFile || undefined,
        startCustomAudioName: formData.startCustomAudioName || undefined,
        intervals: formData.intervals.filter(interval => interval <= formData.duration)
      }
    };

    let updatedTimers;
    if (editingTimer) {
      updatedTimers = timers.map(timer => 
        timer.id === editingTimer.id ? newTimer : timer
      );
    } else {
      updatedTimers = [...timers, newTimer];
    }

    setTimers(updatedTimers);
    storage.saveTimers(updatedTimers);
    resetForm();
  };

  const deleteTimer = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este timer?')) {
      const updatedTimers = timers.filter(timer => timer.id !== id);
      setTimers(updatedTimers);
      storage.saveTimers(updatedTimers);
    }
  };

  const editTimer = (timer: TimerConfig) => {
    setFormData({
      name: timer.name,
      duration: timer.duration,
      videoFile: timer.videoFile || '',
      videoFileName: timer.videoFileName || '',
      soundEnabled: timer.notifications.sound,
      visualEnabled: timer.notifications.visual,
      soundType: timer.notifications.soundType || 'default',
      customAudioFile: timer.notifications.customAudioFile || '',
      customAudioName: timer.notifications.customAudioName || '',
      startSoundType: timer.notifications.startSoundType || 'default',
      startCustomAudioFile: timer.notifications.startCustomAudioFile || '',
      startCustomAudioName: timer.notifications.startCustomAudioName || '',
      intervals: timer.notifications.intervals
    });
    setEditingTimer(timer);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration: 60,
      videoFile: '',
      videoFileName: '',
      soundEnabled: true,
      visualEnabled: true,
      soundType: 'default',
      customAudioFile: '',
      customAudioName: '',
      startSoundType: 'default',
      startCustomAudioFile: '',
      startCustomAudioName: '',
      intervals: [60, 30, 15, 5]
    });
    setEditingTimer(null);
    setShowForm(false);
  };

  const addInterval = () => {
    const newInterval = prompt('Digite o intervalo em minutos (aceita decimais, ex: 1.5):');
    if (newInterval && !isNaN(Number(newInterval))) {
      const interval = Number(newInterval);
      if (interval > 0 && interval <= formData.duration && !formData.intervals.includes(interval)) {
        setFormData({
          ...formData,
          intervals: [...formData.intervals, interval].sort((a: number, b: number) => b - a)
        });
      }
    }
  };

  const removeInterval = (interval: number) => {
    setFormData({
      ...formData,
      intervals: formData.intervals.filter((i: number) => i !== interval)
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Se tem decimais, mostra com 1 casa decimal
    if (minutes % 1 !== 0) {
      if (hours > 0) {
        return `${hours}h ${mins.toFixed(1)}m`;
      }
      return `${minutes.toFixed(1)}m`;
    }
    
    // Se é inteiro, mostra sem decimais
    if (hours > 0) {
      return `${hours}h ${Math.floor(mins)}m`;
    }
    return `${Math.floor(mins)}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Configuração de Timers</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Novo Timer
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingTimer ? 'Editar Timer' : 'Novo Timer'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Timer
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Pomodoro, Exercício, Estudo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1440"
                    step="0.1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo de Vídeo (opcional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.videoFileName && (
                  <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ Vídeo carregado: {formData.videoFileName}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Vídeo que será exibido quando o timer for concluído (MP4, WebM, OGG - máx. 50MB)
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Notificações</h3>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.soundEnabled}
                      onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                      className="mr-2"
                    />
                    Som
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.visualEnabled}
                      onChange={(e) => setFormData({ ...formData, visualEnabled: e.target.checked })}
                      className="mr-2"
                    />
                    Visual
                  </label>
                </div>
                
                {formData.soundEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Som
                    </label>
                    <select
                      value={formData.soundType}
                      onChange={(e) => setFormData({ ...formData, soundType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="default">🔔 Padrão</option>
                      <option value="beep">📢 Beep</option>
                      <option value="chime">🎵 Sino</option>
                      <option value="alarm">🚨 Alarme</option>
                      <option value="custom">🎧 Personalizado</option>
                    </select>
                    
                    {formData.soundType === 'custom' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arquivo de Áudio Personalizado (Notificações)
                        </label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileUpload(e, false)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.customAudioName && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">
                              ✅ Arquivo carregado: <strong>{formData.customAudioName}</strong>
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Formatos suportados: MP3, WAV, OGG, M4A, AAC (máx. 5MB)
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Selecione um arquivo de áudio (MP3, WAV, OGG, etc.) com máximo 5MB
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {formData.soundEnabled && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Som de Início do Timer
                    </label>
                    <select
                      value={formData.startSoundType}
                      onChange={(e) => setFormData({ ...formData, startSoundType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="default">🔔 Padrão</option>
                      <option value="beep">📢 Beep</option>
                      <option value="chime">🎵 Sino</option>
                      <option value="alarm">🚨 Alarme</option>
                      <option value="custom">🎧 Personalizado</option>
                    </select>
                    
                    {formData.startSoundType === 'custom' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arquivo de Áudio Personalizado (Início)
                        </label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileUpload(e, true)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.startCustomAudioName && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                              ✅ Arquivo de início carregado: <strong>{formData.startCustomAudioName}</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Formatos suportados: MP3, WAV, OGG, M4A, AAC (máx. 5MB)
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Som que será tocado quando o timer for iniciado
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Intervalos de Notificação</h3>
                  <button
                    onClick={addInterval}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.intervals.map((interval) => (
                    <span
                      key={interval}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {formatDuration(interval)}
                      <button
                        onClick={() => removeInterval(interval)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={saveTimer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {editingTimer ? 'Atualizar' : 'Salvar'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timers.map((timer) => (
              <div key={timer.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{timer.name}</h3>
                <p className="text-gray-600 mb-2">Duração: {formatDuration(timer.duration)}</p>
                {timer.videoFile && (
                  <p className="text-sm text-purple-600 mb-2 flex items-center">
                    🎬 Vídeo: {timer.videoFileName}
                  </p>
                )}
                {timer.notifications.sound && (
                  <p className="text-sm text-green-600 mb-2 flex items-center">
                    🔊 {timer.notifications.soundType === 'default' ? 'Som padrão' : 
                        timer.notifications.soundType === 'beep' ? 'Beep' :
                        timer.notifications.soundType === 'chime' ? 'Sino' :
                        timer.notifications.soundType === 'alarm' ? 'Alarme' : 
                        timer.notifications.customAudioName ? `Personalizado (${timer.notifications.customAudioName})` : 'Personalizado'}
                  </p>
                )}
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Notificações:</p>
                  <div className="flex gap-2">
                    {timer.notifications.sound && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">🔊 Som</span>
                    )}
                    {timer.notifications.visual && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">👁️ Visual</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Intervalos:</p>
                  <div className="flex flex-wrap gap-1">
                    {timer.notifications.intervals.map((interval) => (
                      <span key={interval} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {formatDuration(interval)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onTimerStart(timer)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Iniciar
                  </button>
                  <button
                    onClick={() => editTimer(timer)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteTimer(timer.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {timers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum timer configurado ainda.</p>
              <p className="text-gray-400">Clique em "Novo Timer" para criar seu primeiro timer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerConfigComponent;
