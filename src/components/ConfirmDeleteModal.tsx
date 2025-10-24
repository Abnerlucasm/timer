import React from 'react';
import { Modal, ModalContent, ModalFooter } from './ui/modal';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  message,
  itemName 
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <ModalContent>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-700 mb-2">
              {message}
            </p>
            {itemName && (
              <p className="text-sm text-gray-500">
                <strong>"{itemName}"</strong> será removido permanentemente.
              </p>
            )}
            <p className="text-sm text-red-600 mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </ModalContent>
      
      <ModalFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={handleConfirm}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Excluir
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDeleteModal;
