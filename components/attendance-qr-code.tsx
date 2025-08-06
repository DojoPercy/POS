'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Download,
  QrCode,
  Copy,
  CheckCircle,
  Building2,
  Users,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttendanceQRCodeProps {
  branchId: string;
  branchName: string;
  branchAddress?: string;
  employeeCount?: number;
  className?: string;
}

export default function AttendanceQRCode({
  branchId,
  branchName,
  branchAddress,
  employeeCount,
  className = '',
}: AttendanceQRCodeProps) {
  const [qrValue, setQrValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate the attendance URL for this branch
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const attendanceUrl = `${baseUrl}/attendance/${branchId}`;
    setQrValue(attendanceUrl);
  }, [branchId]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      toast({
        title: 'URL Copied!',
        description: 'Attendance URL has been copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy URL to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector(`#qr-${branchId} svg`) as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `attendance-qr-${branchName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance QR Code - ${branchName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
                margin: 0; 
              }
              .qr-container { 
                display: inline-block; 
                padding: 20px; 
                border: 2px solid #333; 
                border-radius: 10px; 
                background: white; 
              }
              .branch-info { 
                margin-top: 15px; 
                font-size: 14px; 
              }
              .branch-name { 
                font-size: 18px; 
                font-weight: bold; 
                margin-bottom: 5px; 
              }
              .qr-instructions { 
                margin-top: 15px; 
                font-size: 12px; 
                color: #666; 
              }
              @media print {
                body { margin: 0; }
                .qr-container { border: 1px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div id="print-qr"></div>
              <div class="branch-info">
                <div class="branch-name">${branchName}</div>
                ${branchAddress ? `<div>${branchAddress}</div>` : ''}
                <div>Staff Attendance QR Code</div>
              </div>
              <div class="qr-instructions">
                Scan this QR code with your phone camera<br>
                to access the attendance system
              </div>
            </div>
            <script>
              // This will be replaced with the actual QR code SVG
              document.getElementById('print-qr').innerHTML = \`${document.querySelector(`#qr-${branchId}`)?.innerHTML || ''}\`;
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className={className}>
      <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
        <CardContent className='space-y-4'>
          {/* Branch Info */}
          <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Building2 className='h-5 w-5 text-blue-600' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 truncate'>
                {branchName}
              </h3>
              {branchAddress && (
                <p className='text-sm text-gray-600 truncate'>
                  {branchAddress}
                </p>
              )}
              {employeeCount && (
                <div className='flex items-center gap-4 mt-1'>
                  <span className='flex items-center gap-1 text-xs text-gray-500'>
                    <Users className='h-3 w-3' />
                    {employeeCount} staff
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Preview */}
          <div className='flex justify-center'>
            <div className='p-4 bg-white border-2 border-gray-200 rounded-lg'>
              <div id={`qr-${branchId}`} className='w-32 h-32'>
                <QRCodeSVG
                  value={qrValue}
                  size={128}
                  level='M'
                  includeMargin={true}
                  className='w-full h-full'
                />
              </div>
            </div>
          </div>

          {/* URL Display */}
          <div className='p-3 bg-gray-50 rounded-lg'>
            <p className='text-xs text-gray-600 mb-2'>Attendance URL:</p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 text-xs bg-white px-2 py-1 rounded border truncate'>
                {qrValue}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopyUrl}
                className='h-8 w-8 p-0'
              >
                {copied ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' className='flex-1'>
                  <QrCode className='h-4 w-4 mr-2' />
                  View Large
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle className='flex items-center gap-2'>
                    <QrCode className='h-5 w-5' />
                    Attendance QR Code - {branchName}
                  </DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='flex justify-center'>
                    <div className='p-6 bg-white border-2 border-gray-200 rounded-lg'>
                      <QRCodeSVG
                        value={qrValue}
                        size={256}
                        level='M'
                        includeMargin={true}
                      />
                    </div>
                  </div>
                  <div className='text-center space-y-2'>
                    <p className='text-sm text-gray-600'>
                      Scan this QR code with your phone camera to access the
                      attendance system
                    </p>
                    <div className='flex gap-2 justify-center'>
                      <Button
                        onClick={handleDownloadQR}
                        variant='outline'
                        size='sm'
                      >
                        <Download className='h-4 w-4 mr-2' />
                        Download
                      </Button>
                      <Button
                        onClick={handlePrintQR}
                        variant='outline'
                        size='sm'
                      >
                        <Clock className='h-4 w-4 mr-2' />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleDownloadQR}
              variant='outline'
              className='flex-1'
            >
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
          </div>

          {/* Instructions */}
          <div className='text-center'>
            <Badge variant='secondary' className='text-xs'>
              Staff can scan this QR code to check in/out
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
