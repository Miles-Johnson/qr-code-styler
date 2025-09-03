'use client';

import { useRef } from 'react';
import { useSnapshot } from 'valtio';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AdvancedQrGenerator } from './AdvancedQrGenerator';
import { isModalOpen, dataUrlGeneratedQRCode } from '../src/lib/state';

interface QRCodeModalProps {
  hasGeneratedQR?: boolean;
}

export function QRCodeModal({ hasGeneratedQR = false }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snap = useSnapshot(isModalOpen);

  const handleGenerate = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      dataUrlGeneratedQRCode.value = dataUrl;
      isModalOpen.value = false;
    }
  };

  return (
    <Dialog open={snap.value} onOpenChange={(value) => isModalOpen.value = value}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`${hasGeneratedQR ? 'text-slate-400 hover:text-amber-500' : ''}`}
          onClick={() => isModalOpen.value = true}
        >
          {hasGeneratedQR ? 'Replace QR Code' : 'Create QR Code'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80rem]">
        <DialogHeader>
          <DialogTitle>Create QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <AdvancedQrGenerator ref={canvasRef} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleGenerate}>Use Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
