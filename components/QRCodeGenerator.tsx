'use client';

import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const QR_MARGIN_SIZE = 4; // Standard QR code margin

interface QRCodeGeneratorProps {
  onGenerate: (file: File) => void;
  onClose: () => void;
}

export function QRCodeGenerator({ onGenerate, onClose }: QRCodeGeneratorProps) {
  const [qrValue, setQrValue] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!qrValue || !canvasRef.current) return;

    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      onGenerate(file);
      onClose();
    }, 'image/png');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && qrValue) {
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Input
        type="text"
        placeholder="Enter text or URL for QR code"
        value={qrValue}
        onChange={(e) => setQrValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <div ref={canvasRef} className="flex justify-center">
        {qrValue && (
          <QRCodeCanvas value={qrValue} size={256} bgColor="#FFFFFF" fgColor="#000000" marginSize={QR_MARGIN_SIZE} />
        )}
      </div>
      {qrValue && (
        <Button
          onClick={handleGenerate}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900"
        >
          Use this QR Code
        </Button>
      )}
    </div>
  );
}
