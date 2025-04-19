import { QRCodeSVG } from "qrcode.react";
import { FaClipboard, FaDownload } from "react-icons/fa6";
import { downloadQRCode } from "@/lib/utils/qrCodeDownload";

interface QRCodeModalProps {
  slug: string | null;
  setShowQRCode: (slug: string | null) => void;
}

export default function QRCodeModal({ slug, setShowQRCode }: QRCodeModalProps) {
  return (
    <div
      className="fixed inset-0 bg-bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && setShowQRCode(null)}
    >
      <div className="bg-background p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm border border-border/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">QR Code</h3>
          <button
            onClick={() => setShowQRCode(null)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/20 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm" id={`qr-code-${slug}`}>
            <QRCodeSVG
              value={`${window.location.origin}/${slug}`}
              size={180}
              level="H"
              marginSize={4}
              className="rounded-lg"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1 sm:mb-2">
              Scan to visit:
            </p>
            <p className="text-sm font-medium break-all max-w-[250px]">
              {window.location.origin}/{slug}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-1 sm:mt-2">
            <button
              onClick={() => downloadQRCode(slug)}
              className="text-sm px-4 py-2 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
            >
              <FaDownload className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/${slug}`;
                navigator.clipboard.writeText(url);
                alert("URL copied to clipboard!");
              }}
              className="text-sm px-4 py-2 border border-primary/30 rounded-md text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
            >
              <FaClipboard className="w-4 h-4" />
              Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
