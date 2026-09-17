import React from 'react';
import { X } from 'lucide-react';
import { User, Warga, Klinik } from '../types';
import { RegisterForm } from './RegisterForm';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingUsers: User[];
  klinikList?: Klinik[];
  onRegister: (newUser: User, initialWarga?: Partial<Warga>) => void;
  onSuccessNavigate?: (newUser: User) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  existingUsers,
  klinikList = [],
  onRegister,
  onSuccessNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <RegisterForm
          existingUsers={existingUsers}
          klinikList={klinikList}
          onRegister={onRegister}
          onSuccessNavigate={(u) => {
            onClose();
            if (onSuccessNavigate) onSuccessNavigate(u);
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
