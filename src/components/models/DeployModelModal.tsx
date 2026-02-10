import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, Loader2, AlertTriangle, FileCode, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArchitectureType, DeploymentStep } from '@/types/models';
import { cn } from '@/lib/utils';

interface DeployModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (data: DeploymentData) => void;
}

interface DeploymentData {
  file: File | null;
  name: string;
  version: string;
  architecture: ArchitectureType;
  description: string;
}

const steps: DeploymentStep[] = [
  { step: 1, label: 'Upload Model' },
  { step: 2, label: 'Configuration' },
  { step: 3, label: 'Validation' },
  { step: 4, label: 'Deployment' },
];

const architectures: ArchitectureType[] = ['CNN', 'LSTM', 'Hybrid CNN-LSTM', 'Transformer', 'GNN', 'Autoencoder'];

const DeployModelModal = ({ isOpen, onClose, onDeploy }: DeployModelModalProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [validationMetrics, setValidationMetrics] = useState<{ accuracy: number; precision: number; recall: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    version: 'v1.0',
    architecture: '' as ArchitectureType | '',
    description: '',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.pth', '.h5', '.pt', '.onnx'],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const handleNext = () => {
    if (currentStep === 1 && file) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formData.name && formData.architecture) {
      setCurrentStep(3);
      runValidation();
    } else if (currentStep === 3 && validationMetrics) {
      setCurrentStep(4);
      runDeployment();
    }
  };

  const runValidation = () => {
    setIsValidating(true);
    setValidationProgress(0);
    
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsValidating(false);
          setValidationMetrics({
            accuracy: 95.2 + Math.random() * 3,
            precision: 94.5 + Math.random() * 3,
            recall: 95.8 + Math.random() * 3,
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const runDeployment = () => {
    setIsDeploying(true);
    setDeploymentProgress(0);
    
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDeploying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleDeploy = () => {
    onDeploy({
      file,
      name: formData.name,
      version: formData.version,
      architecture: formData.architecture as ArchitectureType,
      description: formData.description,
    });
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFile(null);
    setUploadProgress(0);
    setValidationProgress(0);
    setDeploymentProgress(0);
    setValidationMetrics(null);
    setFormData({ name: '', version: 'v1.0', architecture: '', description: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Deploy New Model</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center">
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                currentStep >= step.step 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted text-muted-foreground'
              )}>
                {currentStep > step.step ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-medium">{step.step}</span>
                )}
              </div>
              <span className={cn(
                'ml-2 text-sm hidden sm:block',
                currentStep >= step.step ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  'h-0.5 w-8 sm:w-16 mx-2',
                  currentStep > step.step ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
                file && 'border-green-500 bg-green-500/10'
              )}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="space-y-3">
                  <FileCode className="h-12 w-12 mx-auto text-green-400" />
                  <div>
                    <p className="text-foreground font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadProgress < 100 ? (
                    <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Check className="h-4 w-4" />
                      <span>Upload complete</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop your model file'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports .pth, .h5, .pt, .onnx (max 500MB)
                    </p>
                  </div>
                  <Button variant="outline" type="button">
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hybrid CNN-LSTM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., v1.0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Architecture Type *</Label>
              <Select
                value={formData.architecture}
                onValueChange={(value) => setFormData({ ...formData, architecture: value as ArchitectureType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select architecture" />
                </SelectTrigger>
                <SelectContent>
                  {architectures.map((arch) => (
                    <SelectItem key={arch} value={arch}>{arch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the model..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 3: Validation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              {isValidating ? (
                <>
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                  <p className="text-foreground font-medium">Validating model on test dataset...</p>
                  <Progress value={validationProgress} className="h-2 max-w-xs mx-auto mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">{validationProgress}% complete</p>
                </>
              ) : validationMetrics ? (
                <>
                  <Check className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-foreground font-medium mb-4">Validation Complete</p>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                      <p className="text-xl font-bold text-green-400">{validationMetrics.accuracy.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground">Precision</p>
                      <p className="text-xl font-bold text-green-400">{validationMetrics.precision.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground">Recall</p>
                      <p className="text-xl font-bold text-green-400">{validationMetrics.recall.toFixed(1)}%</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Step 4: Deployment */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {isDeploying ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                <p className="text-foreground font-medium">Deploying to production...</p>
                <Progress value={deploymentProgress} className="h-2 max-w-xs mx-auto mt-4" />
                <p className="text-sm text-muted-foreground mt-2">{deploymentProgress}% complete</p>
              </div>
            ) : deploymentProgress >= 100 ? (
              <div className="text-center">
                <Check className="h-16 w-16 mx-auto text-green-400 mb-4" />
                <p className="text-xl font-bold text-foreground mb-2">Deployment Successful!</p>
                <p className="text-muted-foreground">
                  {formData.name} {formData.version} is now active
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <h4 className="font-medium text-foreground mb-3">Deployment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model Name</span>
                      <span className="text-foreground">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="text-foreground">{formData.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Architecture</span>
                      <span className="text-foreground">{formData.architecture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="text-foreground">{file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">Production Deployment</p>
                    <p className="text-sm text-muted-foreground">
                      This will replace the current active model. Ensure you have tested thoroughly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-border/30">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && currentStep < 4 && !isValidating && (
              <Button variant="outline" onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3)}>
                Back
              </Button>
            )}
            {currentStep < 4 && (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!file || uploadProgress < 100)) ||
                  (currentStep === 2 && (!formData.name || !formData.architecture)) ||
                  (currentStep === 3 && (isValidating || !validationMetrics))
                }
              >
                {currentStep === 3 ? 'Deploy' : 'Next'}
              </Button>
            )}
            {currentStep === 4 && deploymentProgress >= 100 && (
              <Button onClick={handleDeploy}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeployModelModal;
