import { useProject } from '@/hooks/useProject';
import { ProjectInfoSection } from '@/components/sections/ProjectInfoSection';
import { DecisionParametersSection } from '@/components/sections/DecisionParametersSection';
import { AuctionSimulationSection } from '@/components/sections/AuctionSimulationSection';
import { SaleScenariosSection } from '@/components/sections/SaleScenariosSection';
import { ExpensesSection } from '@/components/sections/ExpensesSection';
import { ExpensesSummarySection } from '@/components/sections/ExpensesSummarySection';
import { NotesSection } from '@/components/sections/NotesSection';
import { ResultsSidebar } from '@/components/sidebar/ResultsSidebar';
import { ProjectManager } from '@/components/ProjectManager';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MobileStepper } from '@/components/mobile/MobileStepper';

const Index = () => {
  const {
    projects,
    project,
    activeId,
    setActiveId,
    updateProject,
    createNew,
    deleteProject,
    duplicateProject,
    importProject,
    exportProject,
  } = useProject();

  if (!project) return null;

  const steps = [
    { label: 'Info Progetto', content: <ProjectInfoSection project={project} onUpdate={updateProject} /> },
    { label: 'Parametri Decisionali', content: <DecisionParametersSection project={project} onUpdate={updateProject} /> },
    { label: 'Simulazione Asta', content: <AuctionSimulationSection project={project} onUpdate={updateProject} /> },
    { label: 'Scenari di Vendita', content: <SaleScenariosSection project={project} onUpdate={updateProject} /> },
    { label: 'Spese', content: <ExpensesSection project={project} onUpdate={updateProject} /> },
    { label: 'Riepilogo Spese', content: <ExpensesSummarySection project={project} /> },
    { label: 'Note', content: <NotesSection project={project} onUpdate={updateProject} /> },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-2 shrink-0">
        {/* Desktop header */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
              TOO-LA<span className="text-primary">(S)</span>TE
            </h1>
            <span className="text-xs text-muted-foreground">Analisi Aste Immobiliari</span>
          </div>
          <ProjectManager
            projects={projects}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={createNew}
            onDuplicate={duplicateProject}
            onDelete={deleteProject}
            onExport={exportProject}
            onImport={importProject}
          />
        </div>
        {/* Mobile header */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight">
              TOO-LA<span className="text-primary">(S)</span>TE
            </h1>
            <ProjectManager
              projects={projects}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={createNew}
              onDuplicate={duplicateProject}
              onDelete={deleteProject}
              onExport={exportProject}
              onImport={importProject}
              mobileMode
            />
          </div>
          <ProjectManager
            projects={projects}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={createNew}
            onDuplicate={duplicateProject}
            onDelete={deleteProject}
            onExport={exportProject}
            onImport={importProject}
            selectOnly
          />
        </div>
      </header>

      {/* Desktop — resizable */}
      <div className="flex-1 overflow-hidden hidden lg:block">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={60} minSize={35}>
            <ScrollArea className="h-full">
              <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">
                <ProjectInfoSection project={project} onUpdate={updateProject} />
                <DecisionParametersSection project={project} onUpdate={updateProject} />
                <AuctionSimulationSection project={project} onUpdate={updateProject} />
                <SaleScenariosSection project={project} onUpdate={updateProject} />
                <ExpensesSection project={project} onUpdate={updateProject} />
                <ExpensesSummarySection project={project} />
                <NotesSection project={project} onUpdate={updateProject} />
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={20} maxSize={55}>
            <ResultsSidebar project={project} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile — tabs + stepper */}
      <div className="flex-1 overflow-hidden lg:hidden flex flex-col">
        <Tabs defaultValue="dati" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 shrink-0">
            <TabsTrigger value="dati" className="flex-1">Dati</TabsTrigger>
            <TabsTrigger value="risultati" className="flex-1">Risultati</TabsTrigger>
          </TabsList>
          <TabsContent value="dati" className="flex-1 overflow-hidden m-0">
            <MobileStepper steps={steps} />
          </TabsContent>
          <TabsContent value="risultati" className="flex-1 overflow-hidden m-0">
            <ResultsSidebar project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
