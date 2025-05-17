import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface HtmlPreviewProps {
  htmlContent: string;
  className?: string;
}

export function HtmlPreview({ htmlContent, className }: HtmlPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 border-b">
        <div className="text-sm font-medium">HTML Preview</div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div className="flex-grow overflow-auto bg-white">
        <iframe
          ref={iframeRef}
          title="HTML Preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
