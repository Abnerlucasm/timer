import React, { useState } from 'react';
import { Modal, ModalContent, ModalFooter } from './ui/modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AddIntervalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (interval: number) => void;
  maxDuration: number;
}

const AddIntervalModal: React.FC<AddIntervalModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  maxDuration 
}) => {
  const [interval, setInterval] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const intervalValue = Number(interval);
    
    if (!interval || isNaN(intervalValue)) {
      setError('Por favor, insira um valor válido');
      return;
    }
    
    if (intervalValue <= 0) {
      setError('O intervalo deve ser maior que 0');
      return;
    }
    
    // eslint-disable-next-line no-implied-eval
    if (intervalValue > maxDuration) {
      // eslint-disable-next-line no-implied-eval
      setError(`O intervalo deve ser menor ou igual a ${maxDuration} minutos`);
      return;
    }
    
    onAdd(intervalValue);
    // eslint-disable-next-line no-implied-eval
    setInterval('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    // eslint-disable-next-line no-implied-eval
    setInterval('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Intervalo">
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Intervalo (minutos)</Label>
            <Input
              id="interval"
              type="number"
              step="0.1"
              min="0.1"
              max={maxDuration}
              value={interval}
              onChange={(e) => {
                setInterval(e.target.value);
                setError('');
              }}
              placeholder="Ex: 15, 30, 1.5"
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <p className="text-sm text-gray-500">
              Aceita valores decimais (ex: 1.5 para 1 minuto e 30 segundos)
            </p>
          </div>
        </form>
      </ModalContent>
      
      <ModalFooter>
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={!interval || isNaN(Number(interval))}
        >
          Adicionar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddIntervalModal;
