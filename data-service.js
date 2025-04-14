// data-service.js - Serviço centralizado para gerenciamento de dados

class DataService {
  constructor() {
    this.initialize();
  }

  // Inicializa dados padrão se necessário
  initialize() {
    if (!localStorage.getItem('projects')) {
      this.saveProjects(this.getDefaultProjects());
    }
    if (!localStorage.getItem('teamMembers')) {
      this.saveTeamMembers(this.getDefaultTeamMembers());
    }
    if (!localStorage.getItem('tasks')) {
      this.saveTasks([]);
    }
  }

  // Métodos para projetos
  getProjects() {
    try {
      const projects = JSON.parse(localStorage.getItem('projects')) || [];
      return this.validateProjects(projects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      return this.getDefaultProjects();
    }
  }

  saveProjects(projects) {
    try {
      const validProjects = this.validateProjects(projects);
      localStorage.setItem('projects', JSON.stringify(validProjects));
      return true;
    } catch (error) {
      console.error('Erro ao salvar projetos:', error);
      return false;
    }
  }

  // Métodos para membros da equipe
  getTeamMembers() {
    try {
      const members = JSON.parse(localStorage.getItem('teamMembers')) || [];
      return this.validateTeamMembers(members);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      return this.getDefaultTeamMembers();
    }
  }

  saveTeamMembers(members) {
    try {
      const validMembers = this.validateTeamMembers(members);
      localStorage.setItem('teamMembers', JSON.stringify(validMembers));
      return true;
    } catch (error) {
      console.error('Erro ao salvar membros:', error);
      return false;
    }
  }

  // Métodos para tarefas
  getTasks() {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      return this.validateTasks(tasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      return [];
    }
  }

  saveTasks(tasks) {
    try {
      const validTasks = this.validateTasks(tasks);
      localStorage.setItem('tasks', JSON.stringify(validTasks));
      return true;
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
      return false;
    }
  }

  // Validações
  validateProjects(projects) {
    if (!Array.isArray(projects)) throw new Error('Projetos devem ser um array');
    
    return projects.map(proj => ({
      id: proj.id || `proj-${Date.now()}`,
      name: proj.name || 'Projeto sem nome',
      color: proj.color || 'gray',
      description: proj.description || '',
      status: proj.status || 'active',
      createdAt: proj.createdAt || new Date().toISOString(),
      updatedAt: proj.updatedAt || new Date().toISOString()
    }));
  }

  validateTeamMembers(members) {
    if (!Array.isArray(members)) throw new Error('Membros devem ser um array');
    
    return members.map(member => ({
      id: member.id || `user-${Date.now()}`,
      name: member.name || 'Membro sem nome',
      role: member.role || 'Colaborador',
      avatar: member.avatar || 'NA'
    }));
  }

  validateTasks(tasks) {
    if (!Array.isArray(tasks)) throw new Error('Tarefas devem ser um array');
    
    return tasks.map(task => ({
      id: task.id || `task-${Date.now()}`,
      title: task.title || 'Tarefa sem título',
      description: task.description || '',
      status: ['todo', 'in-progress', 'review', 'done'].includes(task.status) 
        ? task.status 
        : 'todo',
      priority: ['low', 'medium', 'high'].includes(task.priority)
        ? task.priority
        : 'medium',
      projectId: task.projectId || null,
      assigneeId: task.assigneeId || null,
      createdAt: task.createdAt || new Date().toISOString(),
      dueDate: task.dueDate || null,
      comments: Array.isArray(task.comments) ? task.comments : []
    }));
  }

  // Dados padrão
  getDefaultProjects() {
    return [
      { id: 'proj-1', name: 'Redesign do Site', color: 'blue' },
      { id: 'proj-2', name: 'Implementação do CRM', color: 'green' },
      { id: 'proj-3', name: 'Campanha de Marketing', color: 'purple' }
    ];
  }

  getDefaultTeamMembers() {
    return [
      { id: 'user-1', name: 'Carlos Oliveira', role: 'Gerente', avatar: 'CO' },
      { id: 'user-2', name: 'Ana Silva', role: 'Desenvolvedora', avatar: 'AS' }
    ];
  }
}

// Exportar instância única
const dataService = new DataService();
export default dataService;
