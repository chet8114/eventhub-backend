import { QRCodeSVG } from 'qrcode.react';
import './QRCodeDisplay.css';

const QRCodeDisplay = ({ data, size = 240, title = 'Your QR Ticket' }) => {
  const handleDownload = () => {
    const svg = document.querySelector('.qr-display-svg svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = size + 40;
      canvas.height = size + 100;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, size, size);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, canvas.width / 2, size + 50);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scan at event entrance', canvas.width / 2, size + 70);

      const link = document.createElement('a');
      link.download = `ticket-qr-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="qr-display">
      <div className="qr-display-card">
        <div className="qr-display-svg">
          <QRCodeSVG
            value={typeof data === 'string' ? data : JSON.stringify(data)}
            size={size}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <p className="qr-display-label">{title}</p>
        <button className="btn btn-primary btn-sm" onClick={handleDownload}>
          ⬇ Download QR
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
