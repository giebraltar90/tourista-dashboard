
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CSVTicketBucket } from "@/types/ticketBuckets";
import { uploadCSVBuckets } from "@/services/api/ticketBucketService";
import { AlertCircle, Upload, FileUp, CheckCircle, FileX } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<CSVTicketBucket[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setUploadSuccess(false);
    setParsedData([]);
    
    if (selectedFile) {
      validateAndParseCSV(selectedFile);
    }
  };

  const validateAndParseCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const contents = e.target?.result as string;
        const lines = contents.split('\n');
        
        // Check if the file has a header row
        if (lines.length < 2) {
          setError("CSV file is empty or invalid. It should contain at least a header row and one data row.");
          return;
        }
        
        // Parse header row
        const header = lines[0].split(',').map(item => item.trim().toLowerCase());
        
        // Check if required columns exist
        const requiredColumns = ['reference_number', 'date', 'access_time'];
        for (const column of requiredColumns) {
          if (!header.includes(column)) {
            setError(`CSV file is missing required column: ${column}`);
            return;
          }
        }
        
        // Parse data rows
        const data: CSVTicketBucket[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',').map(item => item.trim());
          if (values.length !== header.length) {
            setError(`Line ${i + 1} has an incorrect number of columns`);
            return;
          }
          
          const entry: Record<string, string> = {};
          header.forEach((column, index) => {
            entry[column] = values[index];
          });
          
          // Validate date format (expecting YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(entry.date)) {
            setError(`Line ${i + 1} has an invalid date format. Expected format: YYYY-MM-DD`);
            return;
          }
          
          // Create a ticket bucket entry
          data.push({
            reference_number: entry.reference_number,
            date: entry.date,
            access_time: entry.access_time
          });
        }
        
        setParsedData(data);
      } catch (err) {
        console.error("Error parsing CSV:", err);
        setError("Failed to parse CSV file. Please make sure it's a valid CSV format.");
      }
    };
    
    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
    };
    
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!parsedData.length) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await uploadCSVBuckets(parsedData);
      setUploadSuccess(true);
      toast.success(`Successfully uploaded ${parsedData.length} ticket buckets`);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload ticket buckets");
      toast.error("Failed to upload ticket buckets");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Upload Ticket Buckets CSV</CardTitle>
        <CardDescription>
          Upload a CSV file with reference numbers, dates, and access times for Versailles ticket buckets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          <Button 
            variant="outline"
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            disabled={isUploading}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Select File
          </Button>
        </div>
        
        {file && (
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center">
              <div className="mr-2">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB • Last modified: {format(new Date(file.lastModified), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {parsedData.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  CSV file parsed successfully
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Found {parsedData.length} ticket bucket entries ready to upload
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {uploadSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Upload Successful</AlertTitle>
            <AlertDescription>
              Successfully uploaded {parsedData.length} ticket buckets to the database.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="bg-muted/20 border-t px-6 py-4">
        <Button 
          className="ml-auto" 
          onClick={handleUpload} 
          disabled={!parsedData.length || isUploading || uploadSuccess}
        >
          {isUploading ? (
            <>
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {parsedData.length} Ticket Buckets
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
