import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import ActiveModelCard from '@/components/models/ActiveModelCard';
import ModelRegistryTable from '@/components/models/ModelRegistryTable';
import ModelComparisonModal from '@/components/models/ModelComparisonModal';
import DeployModelModal from '@/components/models/DeployModelModal';
import TrainingJobsSection from '@/components/models/TrainingJobsSection';
import ModelPerformanceDashboard from '@/components/models/ModelPerformanceDashboard';
import { 
  mockModels, 
  mockTrainingJobs, 
  mockConfusionMatrix, 
  mockROCCurve, 
  mockPrecisionRecall, 
  mockFeatureImportance 
} from '@/data/modelsData';
import { MLModel, TrainingJob } from '@/types/models';

const Models = () => {
  const [models, setModels] = useState(mockModels);
  const [trainingJobs, setTrainingJobs] = useState(mockTrainingJobs);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [selectedModelForCompare, setSelectedModelForCompare] = useState<MLModel | undefined>();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>({ isOpen: false, title: '', description: '', action: () => {} });

  const activeModel = models.find(m => m.status === 'active');

  const handleViewDetails = useCallback((model: MLModel) => {
    toast({
      title: 'Model Details',
      description: `Viewing details for ${model.name} ${model.version}`,
    });
  }, []);

  const handleRollback = useCallback((model: MLModel) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Roll Back Model',
      description: `Are you sure you want to roll back to the previous model version? This will replace ${model.name} ${model.version} as the active model.`,
      variant: 'destructive',
      action: () => {
        toast({
          title: 'Model Rolled Back',
          description: 'Successfully rolled back to the previous model version.',
        });
      },
    });
  }, []);

  const handleDownload = useCallback((model: MLModel) => {
    toast({
      title: 'Download Started',
      description: `Downloading ${model.name} ${model.version}...`,
    });
  }, []);

  const handleDeploy = useCallback((model: MLModel) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deploy Model',
      description: `Are you sure you want to deploy ${model.name} ${model.version}? This will replace the current active model.`,
      action: () => {
        setModels(prev => prev.map(m => ({
          ...m,
          status: m.id === model.id ? 'active' : m.status === 'active' ? 'archived' : m.status,
          deploymentDate: m.id === model.id ? new Date() : m.deploymentDate,
        })));
        toast({
          title: 'Model Deployed',
          description: `${model.name} ${model.version} is now active.`,
        });
      },
    });
  }, []);

  const handleViewMetrics = useCallback((model: MLModel) => {
    toast({
      title: 'Viewing Metrics',
      description: `Opening metrics for ${model.name} ${model.version}`,
    });
  }, []);

  const handleCompare = useCallback((model: MLModel) => {
    setSelectedModelForCompare(model);
    setIsCompareOpen(true);
  }, []);

  const handleArchive = useCallback((model: MLModel) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Model',
      description: `Are you sure you want to archive ${model.name} ${model.version}?`,
      action: () => {
        setModels(prev => prev.map(m => 
          m.id === model.id ? { ...m, status: 'archived' } : m
        ));
        toast({
          title: 'Model Archived',
          description: `${model.name} ${model.version} has been archived.`,
        });
      },
    });
  }, []);

  const handleDelete = useCallback((model: MLModel) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Model',
      description: `Are you sure you want to permanently delete ${model.name} ${model.version}? This action cannot be undone.`,
      variant: 'destructive',
      action: () => {
        setModels(prev => prev.filter(m => m.id !== model.id));
        toast({
          title: 'Model Deleted',
          description: `${model.name} ${model.version} has been deleted.`,
          variant: 'destructive',
        });
      },
    });
  }, []);

  const handleSelectBest = useCallback((model: MLModel) => {
    setIsCompareOpen(false);
    handleDeploy(model);
  }, [handleDeploy]);

  const handleDeployNew = useCallback((data: any) => {
    toast({
      title: 'Model Deployed',
      description: `${data.name} ${data.version} has been deployed successfully.`,
    });
  }, []);

  const handlePauseJob = useCallback((job: TrainingJob) => {
    toast({
      title: 'Training Paused',
      description: `Training job ${job.id} has been paused.`,
    });
  }, []);

  const handleResumeJob = useCallback((job: TrainingJob) => {
    toast({
      title: 'Training Resumed',
      description: `Training job ${job.id} has been resumed.`,
    });
  }, []);

  const handleCancelJob = useCallback((job: TrainingJob) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Training Job',
      description: `Are you sure you want to cancel training job ${job.id}? This action cannot be undone.`,
      variant: 'destructive',
      action: () => {
        setTrainingJobs(prev => prev.filter(j => j.id !== job.id));
        toast({
          title: 'Job Cancelled',
          description: `Training job ${job.id} has been cancelled.`,
          variant: 'destructive',
        });
      },
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ML Model Management</h1>
          <p className="text-muted-foreground">Manage and deploy deep learning models</p>
        </div>
        <Button onClick={() => setIsDeployOpen(true)} className="shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-2" />
          Deploy New Model
        </Button>
      </div>

      {/* Active Model Card */}
      {activeModel && (
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <ActiveModelCard
            model={activeModel}
            onViewDetails={handleViewDetails}
            onRollback={handleRollback}
            onDownload={handleDownload}
          />
        </div>
      )}

      {/* Model Registry */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <ModelRegistryTable
          models={models}
          onDeploy={handleDeploy}
          onViewMetrics={handleViewMetrics}
          onCompare={handleCompare}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      </div>

      {/* Training Jobs */}
      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <TrainingJobsSection
          jobs={trainingJobs}
          onPause={handlePauseJob}
          onResume={handleResumeJob}
          onCancel={handleCancelJob}
        />
      </div>

      {/* Model Performance Dashboard */}
      <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <ModelPerformanceDashboard
          confusionMatrix={mockConfusionMatrix}
          rocCurve={mockROCCurve}
          precisionRecall={mockPrecisionRecall}
          featureImportance={mockFeatureImportance}
        />
      </div>

      {/* Comparison Modal */}
      <ModelComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        models={models}
        initialModel={selectedModelForCompare}
        onSelectBest={handleSelectBest}
      />

      {/* Deploy Modal */}
      <DeployModelModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        onDeploy={handleDeployNew}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.action}
              className={confirmDialog.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Models;
