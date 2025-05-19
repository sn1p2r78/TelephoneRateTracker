import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, FileSpreadsheet, Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type NumberImportRow = {
  country: string;
  number: string;
  range: string;
  provider: string;
  price: number;
  valid: boolean;
  error?: string;
};

export default function ExcelNumberImport() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<NumberImportRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (data: NumberImportRow[]) => {
      const validRows = data.filter(row => row.valid);
      const response = await apiRequest("POST", "/api/numbers/import", { numbers: validRows });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/numbers"] });
      setIsDialogOpen(false);
      resetFileImport();
      
      toast({
        title: "Numbers Imported Successfully",
        description: `${data.imported} numbers have been imported into the system.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      resetValidation();
    }
  };

  const parseExcelFile = async () => {
    if (!file) return;
    
    try {
      setIsValidating(true);
      setProgress(10);
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          setProgress(30);
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          setProgress(50);
          
          // Convert Excel data to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setProgress(70);
          
          // Validate and transform data
          const parsedRows: NumberImportRow[] = jsonData.map((row: any, index) => {
            const numberRow: NumberImportRow = {
              country: row.country || '',
              number: row.number?.toString() || '',
              range: row.range || '',
              provider: row.provider || '',
              price: parseFloat(row.price) || 0,
              valid: true
            };
            
            // Basic validation
            if (!numberRow.country) {
              numberRow.valid = false;
              numberRow.error = "Country is required";
            } else if (!numberRow.number) {
              numberRow.valid = false;
              numberRow.error = "Number is required";
            } else if (!numberRow.range) {
              numberRow.valid = false;
              numberRow.error = "Range is required";
            } else if (!numberRow.provider) {
              numberRow.valid = false;
              numberRow.error = "Provider is required";
            } else if (isNaN(numberRow.price) || numberRow.price <= 0) {
              numberRow.valid = false;
              numberRow.error = "Price must be a positive number";
            }
            
            return numberRow;
          });
          
          setParsedData(parsedRows);
          setProgress(100);
          setIsValidating(false);
          setValidationComplete(true);
          
        } catch (error) {
          setIsValidating(false);
          toast({
            title: "Error Parsing Excel File",
            description: "The Excel file could not be parsed. Please check the format and try again.",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsBinaryString(file);
      
    } catch (error) {
      setIsValidating(false);
      toast({
        title: "Error Reading File",
        description: "There was an error reading the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (parsedData.length === 0) {
      return;
    }
    
    // Check if there are any valid rows to import
    const validRows = parsedData.filter(row => row.valid);
    if (validRows.length === 0) {
      toast({
        title: "No Valid Numbers",
        description: "There are no valid numbers to import. Please fix the errors and try again.",
        variant: "destructive",
      });
      return;
    }
    
    importMutation.mutate(parsedData);
  };

  const resetFileImport = () => {
    setFile(null);
    setParsedData([]);
    setValidationComplete(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetValidation = () => {
    setParsedData([]);
    setValidationComplete(false);
    setProgress(0);
  };

  const getValidRowCount = () => {
    return parsedData.filter(row => row.valid).length;
  };

  const getInvalidRowCount = () => {
    return parsedData.filter(row => !row.valid).length;
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Numbers
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Numbers from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with phone numbers to import into the system.
              The file should have the following columns: country, number, range, provider, price.
            </DialogDescription>
          </DialogHeader>

          {!file && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="max-w-md text-center mb-6">
                <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your Excel file should have the following columns: country, number, range, provider, price
                </p>
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {file && !validationComplete && !isValidating && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Selected File:</h3>
                  <p className="text-sm text-muted-foreground">{file.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetFileImport}>
                  <X className="h-4 w-4 mr-1" /> Change
                </Button>
              </div>
              
              <Button className="w-full" onClick={parseExcelFile}>
                <Upload className="mr-2 h-4 w-4" />
                Validate Numbers
              </Button>
            </div>
          )}

          {isValidating && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Validating Excel Data...</h3>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">Please wait while we validate your Excel file.</p>
            </div>
          )}

          {validationComplete && parsedData.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Validation Results:</h3>
                  <div className="flex gap-4 mt-1">
                    <span className="text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      {getValidRowCount()} valid
                    </span>
                    {getInvalidRowCount() > 0 && (
                      <span className="text-sm flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        {getInvalidRowCount()} invalid
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetValidation}>
                  <X className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>
              
              <div className="border rounded-md max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Range</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, index) => (
                      <TableRow key={index} className={!row.valid ? "bg-red-50" : ""}>
                        <TableCell>
                          {row.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-xs text-red-500">{row.error}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{row.country}</TableCell>
                        <TableCell>{row.number}</TableCell>
                        <TableCell>{row.range}</TableCell>
                        <TableCell>{row.provider}</TableCell>
                        <TableCell>{row.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {getInvalidRowCount() > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    There are {getInvalidRowCount()} rows with validation errors. 
                    Please fix these issues in your Excel file and upload again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {validationComplete && parsedData.length > 0 && (
              <Button 
                onClick={handleImport} 
                disabled={getValidRowCount() === 0 || importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <span className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Importing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Import {getValidRowCount()} Number{getValidRowCount() !== 1 ? 's' : ''}
                  </span>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}