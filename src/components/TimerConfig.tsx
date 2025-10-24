import React, { useState, useEffect } from 'react';
import { TimerConfig } from '../types/Timer';
import { storage } from '../utils/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, Play, Clock, Video, Volume2, Eye, Bell, Music, AlertTriangle, Headphones, X, CheckCircle } from 'lucide-react';
import AddIntervalModal from './AddIntervalModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface TimerConfigProps {
  onTimerStart: (config: TimerConfig) => void;
  onBackToHome?: () => void;
}

const TimerConfigComponent: React.FC<TimerConfigProps> = ({ onTimerStart, onBackToHome }) => {
  const [timers, setTimers] = useState<TimerConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTimer, setEditingTimer] = useState<TimerConfig | null>(null);
  const [showAddIntervalModal, setShowAddIntervalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState<TimerConfig | null>(null);
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

  const deleteTimer = (timer: TimerConfig) => {
    setTimerToDelete(timer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (timerToDelete) {
      const updatedTimers = timers.filter(timer => timer.id !== timerToDelete.id);
      setTimers(updatedTimers);
      storage.saveTimers(updatedTimers);
      setTimerToDelete(null);
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

  const addInterval = (interval: number) => {
    if (interval > 0 && interval <= formData.duration && !formData.intervals.includes(interval)) {
      setFormData({
        ...formData,
        intervals: [...formData.intervals, interval].sort((a: number, b: number) => b - a)
      });
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
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {onBackToHome && (
                  <Button
                    onClick={onBackToHome}
                    variant="outline"
                    size="sm"
                  >
                    ← Voltar ao Início
                  </Button>
                )}
                <CardTitle className="text-3xl font-bold text-gray-800">Configuração de Timers</CardTitle>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Timer
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {editingTimer ? 'Editar Timer' : 'Novo Timer'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Timer</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Pomodoro, Exercício, Estudo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0.1"
                        max="1440"
                        step="0.1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) || 0.1 })}
                        placeholder="Ex: 25, 30, 60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">Arquivo de Vídeo (opcional)</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                    />
                    {formData.videoFileName && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Vídeo carregado: <strong>{formData.videoFileName}</strong>
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      Vídeo que será exibido quando o timer for concluído (MP4, WebM, OGG - máx. 50MB)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-700">Notificações</h3>
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sound"
                          checked={formData.soundEnabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, soundEnabled: !!checked })}
                        />
                        <Label htmlFor="sound" className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Som
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="visual"
                          checked={formData.visualEnabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, visualEnabled: !!checked })}
                        />
                        <Label htmlFor="visual" className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Visual
                        </Label>
                      </div>
                    </div>
                    
                    {formData.soundEnabled && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="soundType">Tipo de Som</Label>
                          <Select
                            value={formData.soundType}
                            onValueChange={(value) => setFormData({ ...formData, soundType: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">
                                <div className="flex items-center gap-2">
                                  <Bell className="w-4 h-4" />
                                  Padrão
                                </div>
                              </SelectItem>
                              <SelectItem value="beep">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Beep
                                </div>
                              </SelectItem>
                              <SelectItem value="chime">
                                <div className="flex items-center gap-2">
                                  <Music className="w-4 h-4" />
                                  Sino
                                </div>
                              </SelectItem>
                              <SelectItem value="alarm">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Alarme
                                </div>
                              </SelectItem>
                              <SelectItem value="custom">
                                <div className="flex items-center gap-2">
                                  <Headphones className="w-4 h-4" />
                                  Personalizado
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {formData.soundType === 'custom' && (
                          <div className="space-y-2">
                            <Label htmlFor="customAudio">Arquivo de Áudio Personalizado (Notificações)</Label>
                            <Input
                              id="customAudio"
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleAudioFileUpload(e, false)}
                            />
                            {formData.customAudioName && (
                              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-sm text-green-700">
                                    Arquivo carregado: <strong>{formData.customAudioName}</strong>
                                  </p>
                                  <p className="text-xs text-green-600">
                                    Formatos suportados: MP3, WAV, OGG, M4A, AAC (máx. 5MB)
                                  </p>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">
                              Selecione um arquivo de áudio (MP3, WAV, OGG, etc.) com máximo 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {formData.soundEnabled && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="startSoundType">Som de Início do Timer</Label>
                          <Select
                            value={formData.startSoundType}
                            onValueChange={(value) => setFormData({ ...formData, startSoundType: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">
                                <div className="flex items-center gap-2">
                                  <Bell className="w-4 h-4" />
                                  Padrão
                                </div>
                              </SelectItem>
                              <SelectItem value="beep">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Beep
                                </div>
                              </SelectItem>
                              <SelectItem value="chime">
                                <div className="flex items-center gap-2">
                                  <Music className="w-4 h-4" />
                                  Sino
                                </div>
                              </SelectItem>
                              <SelectItem value="alarm">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Alarme
                                </div>
                              </SelectItem>
                              <SelectItem value="custom">
                                <div className="flex items-center gap-2">
                                  <Headphones className="w-4 h-4" />
                                  Personalizado
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {formData.startSoundType === 'custom' && (
                          <div className="space-y-2">
                            <Label htmlFor="startCustomAudio">Arquivo de Áudio Personalizado (Início)</Label>
                            <Input
                              id="startCustomAudio"
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleAudioFileUpload(e, true)}
                            />
                            {formData.startCustomAudioName && (
                              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-sm text-blue-700">
                                    Arquivo de início carregado: <strong>{formData.startCustomAudioName}</strong>
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    Formatos suportados: MP3, WAV, OGG, M4A, AAC (máx. 5MB)
                                  </p>
                                </div>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">
                              Som que será tocado quando o timer for iniciado
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-700">Intervalos de Notificação</h3>
                      <Button
                        onClick={() => setShowAddIntervalModal(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.intervals.map((interval) => (
                        <div
                          key={interval}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {formatDuration(interval)}
                          <Button
                            onClick={() => removeInterval(interval)}
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={saveTimer}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editingTimer ? 'Atualizar' : 'Salvar'}
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timers.map((timer) => (
                <Card key={timer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{timer.name}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      Duração: {formatDuration(timer.duration)}
                    </div>
                    {timer.videoFile && (
                      <div className="flex items-center gap-2 text-purple-600">
                        <Video className="w-4 h-4" />
                        Vídeo: {timer.videoFileName}
                      </div>
                    )}
                    {timer.notifications.sound && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Volume2 className="w-4 h-4" />
                        {timer.notifications.soundType === 'default' ? 'Som padrão' : 
                         timer.notifications.soundType === 'beep' ? 'Beep' :
                         timer.notifications.soundType === 'chime' ? 'Sino' :
                         timer.notifications.soundType === 'alarm' ? 'Alarme' : 
                         timer.notifications.customAudioName ? `Personalizado (${timer.notifications.customAudioName})` : 'Personalizado'}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Notificações:</p>
                      <div className="flex gap-2">
                        {timer.notifications.sound && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Som
                          </span>
                        )}
                        {timer.notifications.visual && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Visual
                          </span>
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
                      <Button
                        onClick={() => onTimerStart(timer)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button
                        onClick={() => editTimer(timer)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteTimer(timer)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {timers.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum timer configurado ainda.</p>
                <p className="text-gray-400">Clique em "Novo Timer" para criar seu primeiro timer.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal para adicionar intervalo */}
        <AddIntervalModal
          isOpen={showAddIntervalModal}
          onClose={() => setShowAddIntervalModal(false)}
          onAdd={addInterval}
          maxDuration={formData.duration}
        />

        {/* Modal de confirmação de exclusão */}
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTimerToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Timer"
          message="Tem certeza que deseja excluir este timer?"
          itemName={timerToDelete?.name}
        />
      </div>
    </div>
  );
};

export default TimerConfigComponent;