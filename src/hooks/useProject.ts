import { useState, useCallback, useEffect } from 'react';
import { ProjectData, createDefaultProject } from '@/types/project';

const STORAGE_KEY = 'toolaste_projects';
const ACTIVE_KEY = 'toolaste_active';

const DEFAULT_ROI_THRESHOLDS = { borderline: 25, conviene: 30, ottima: 40, eccellente: 50 };

function migrateProject(p: ProjectData): ProjectData {
  return {
    ...p,
    roiThresholds: p.roiThresholds ?? DEFAULT_ROI_THRESHOLDS,
  };
}

function loadProjects(): ProjectData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProjectData[]).map(migrateProject) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: ProjectData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProject() {
  const [projects, setProjects] = useState<ProjectData[]>(() => loadProjects());
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_KEY);
    if (saved && loadProjects().find(p => p.id === saved)) return saved;
    const all = loadProjects();
    return all.length > 0 ? all[0].id : '';
  });

  const project = projects.find(p => p.id === activeId) ?? null;

  // Autosave
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeId);
  }, [activeId]);

  const updateProject = useCallback((updates: Partial<ProjectData>) => {
    setProjects(prev => prev.map(p =>
      p.id === activeId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, [activeId]);

  const createNew = useCallback(() => {
    const newProject = createDefaultProject();
    setProjects(prev => [...prev, newProject]);
    setActiveId(newProject.id);
    return newProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      if (id === activeId && next.length > 0) {
        setActiveId(next[0].id);
      }
      return next;
    });
  }, [activeId]);

  const duplicateProject = useCallback((id: string) => {
    const source = projects.find(p => p.id === id);
    if (!source) return;
    const dup = {
      ...JSON.parse(JSON.stringify(source)),
      id: crypto.randomUUID(),
      nome: `${source.nome} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, dup]);
    setActiveId(dup.id);
  }, [projects]);

  const importProject = useCallback((data: ProjectData) => {
    const imported = { ...data, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
    setProjects(prev => [...prev, imported]);
    setActiveId(imported.id);
  }, []);

  const exportProject = useCallback(() => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.nome || 'progetto'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project]);

  // Initialize with a default project if none exist
  useEffect(() => {
    if (projects.length === 0) {
      const newProject = createDefaultProject();
      setProjects([newProject]);
      setActiveId(newProject.id);
    }
  }, []);

  return {
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
  };
}
