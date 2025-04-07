'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QRCodeGenerator } from './QRCodeGenerator';

interface QRCodeModalProps {
  onGenerate: (file: File) => void;
  hasGeneratedQR?: boolean;
}

export function QRCodeModal({ onGenerate, hasGeneratedQR = false }: QRCodeModalProps) {
  const [open, setOpen] = useState(false);

  const handleGenerate = (file: File) => {
    onGenerate(file);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`${hasGeneratedQR ? 'text-slate-400 hover:text-amber-500' : ''}`}
        >
          {hasGeneratedQR ? 'Replace QR Code' : 'Create QR Code'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <QRCodeGenerator 
            onGenerate={handleGenerate}
            onClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
