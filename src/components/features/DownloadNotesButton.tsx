
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
    // For PDF, we'll create a simple HTML version and trigger print
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
    <Button 
      onClick={handleDownload}
      className="flex items-center gap-2"
      variant="outline"
    >
      {children || (
        <>
          {format === 'pdf' ? <FileText className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          Download as {format.toUpperCase()}
        </>
      )}
    </Button>
  );
};
