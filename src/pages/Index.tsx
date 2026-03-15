import { useProject } from '@/hooks/useProject';
import { ProjectInfoSection } from '@/components/sections/ProjectInfoSection';
import { DecisionParametersSection } from '@/components/sections/DecisionParametersSection';
import { AuctionSimulationSection } from '@/components/sections/AuctionSimulationSection';
import { SaleScenariosSection } from '@/components/sections/SaleScenariosSection';
import { ExpensesSection } from '@/components/sections/ExpensesSection';
import { NotesSection } from '@/components/sections/NotesSection';
import { ResultsSidebar } from '@/components/sidebar/ResultsSidebar';
import { ProjectManager } from '@/components/ProjectManager';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">
            TOO-LA<span className="text-primary">(S)</span>TE
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:block">Analisi Aste Immobiliari</span>
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
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left column — inputs */}
        <ScrollArea className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">
            <ProjectInfoSection project={project} onUpdate={updateProject} />
            <DecisionParametersSection project={project} onUpdate={updateProject} />
            <AuctionSimulationSection project={project} onUpdate={updateProject} />
            <SaleScenariosSection project={project} onUpdate={updateProject} />
            <ExpensesSection project={project} onUpdate={updateProject} />
            <NotesSection project={project} onUpdate={updateProject} />
          </div>
        </ScrollArea>

        {/* Right column — sticky results */}
        <aside className="w-96 border-l bg-card shrink-0 hidden lg:block">
          <ResultsSidebar project={project} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
