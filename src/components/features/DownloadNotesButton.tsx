import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DownloadNotesButtonProps {
  content: string;
  filename?: string;
  format?: 'txt' | 'pdf';
  children?: React.ReactNode;
}

export const DownloadNotesButton = ({ 
  content, 
  filename = "study-notes", 
  format = 'txt',
  children
}: DownloadNotesButtonProps) => {
  const { toast } = useToast();

  const downloadAsTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Notes downloaded!",
      description: "Your study notes have been saved as a text file."
    });
  };

  const downloadAsPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; }
              h2 { color: #555; margin-top: 20px; }
              p { margin: 10px 0; }
              ul, ol { margin: 10px 0 10px 20px; }
            </style>
          </head>
          <body>
            <h1>${filename}</h1>
            <div>${content.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Print dialog opened",
      description: "Save as PDF from the print dialog."
    });
  };

  const handleDownload = () => {
    if (format === 'pdf') {
      downloadAsPdf();
    } else {
      downloadAsTxt();
    }
  };

  return (
    // The primary fix is wrapping the button in a div with proper alignment
    <div className="flex items-center justify-center p-2 mb-2 w-full">
      <Button
        onClick={handleDownload}
        className="w-full flex items-center justify-start rounded-full px-6 py-8 text-lg"
        style={{
          backgroundColor: '#ff8a00',
          color: '#000',
          borderColor: '#ff8a00',
        }}
      >
        <div className="flex items-center justify-center rounded-full p-2"
          style={{
            backgroundColor: '#000',
            color: '#fff'
          }}
        >
          <Download className="h-4 w-4" />
        </div>
        <span className="ml-4">
          Download Notes
        </span>
      </Button>
    </div>
  );
};
