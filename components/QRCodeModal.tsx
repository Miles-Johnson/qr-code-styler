'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AdvancedQrGenerator } from './AdvancedQrGenerator';

interface QRCodeModalProps {
  onGenerate: (file: File) => void;
  hasGeneratedQR?: boolean;
}

export function QRCodeModal({ onGenerate, hasGeneratedQR = false }: QRCodeModalProps) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'qrcode.png', { type: 'image/png' });
          onGenerate(file);
          setOpen(false);
        }
      });
    }
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
      <DialogContent className="sm:max-w-[80rem]">
        <DialogHeader>
          <DialogTitle>Create QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <AdvancedQrGenerator />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
