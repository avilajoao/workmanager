// tasks.js - Gerenciamento de tarefas com dataService
import dataService from './data-service';

// Variáveis globais
let tasks = [];
let projects = [];
let teamMembers = [];
let currentTask = null;

// Inicializar a página de tarefas
function initTasks() {
    console.log('Inicializando página de tarefas');
    
    // Verificar autenticação
    if (typeof checkAuth === 'function' && !checkAuth()) return;
    
    // Aplicar tema
    if (typeof applyTheme === 'function') {
        applyTheme();
    }
    
    // Atualizar data atual
    updateCurrentDate();
    
    // Carregar dados
    loadData();
    
    // Configurar eventos
    setupEventListeners();
}

// Atualizar data atual
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('pt-BR', options);
    }
}

// Carregar dados
function loadData() {
    // Carregar projetos
    loadProjects();
    
    // Carregar membros da equipe
    loadTeamMembers();
    
    // Carregar tarefas
    loadTasks();
}

// Carregar projetos
function loadProjects() {
    try {
        projects = dataService.getProjects();
        populateProjectSelects();
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showNotification('Erro ao carregar projetos', 'error');
    }
}

// Carregar membros da equipe
function loadTeamMembers() {
    try {
        teamMembers = dataService.getTeamMembers();
        populateTeamMemberSelects();
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        showNotification('Erro ao carregar membros da equipe', 'error');
    }
}

// Carregar tarefas
function loadTasks() {
    try {
        tasks = dataService.getTasks();
        renderTasks();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        showNotification('Erro ao carregar tarefas', 'error');
    }
}

// Criar nova tarefa
function createTask() {
    try {
        // Obter dados do formulário
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const projectId = document.getElementById('taskProject').value;
        const status = document.getElementById('taskStatus').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const assigneeId = document.getElementById('taskAssignee').value;
        
        // Validar campos obrigatórios
        if (!title) {
            showNotification('Título é obrigatório', 'error');
            return;
        }
        
        // Criar objeto de tarefa
        const newTask = {
            title,
            description,
            projectId,
            status,
            priority,
            assigneeId: assigneeId || null,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null
        };
        
        // Adicionar à lista de tarefas
        tasks.push(newTask);
        
        // Salvar usando o serviço
        if (dataService.saveTasks(tasks)) {
            // Fechar modal
            closeModal('newTaskModal');
            
            // Limpar formulário
            document.getElementById('newTaskForm').reset();
            
            // Atualizar interface
            renderTasks();
            
            // Mostrar notificação
            showNotification('Tarefa criada com sucesso', 'success');
        } else {
            showNotification('Erro ao salvar tarefa', 'error');
        }
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        showNotification('Erro ao criar tarefa', 'error');
    }
}

// Atualizar tarefa
function updateTask() {
    try {
        // Obter ID da tarefa
        const taskId = document.getElementById('editTaskId').value;
        
        // Encontrar índice da tarefa
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            showNotification('Tarefa não encontrada', 'error');
            return;
        }
        
        // Obter dados do formulário
        const title = document.getElementById('editTaskTitle').value;
        const description = document.getElementById('editTaskDescription').value;
        const projectId = document.getElementById('editTaskProject').value;
        const status = document.getElementById('editTaskStatus').value;
        const priority = document.getElementById('editTaskPriority').value;
        const dueDate = document.getElementById('editTaskDueDate').value;
        const assigneeId = document.getElementById('editTaskAssignee').value;
        
        // Validar campos obrigatórios
        if (!title) {
            showNotification('Título é obrigatório', 'error');
            return;
        }
        
        // Atualizar tarefa
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title,
            description,
            projectId,
            status,
            priority,
            assigneeId: assigneeId || null,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null
        };
        
        // Salvar usando o serviço
        if (dataService.saveTasks(tasks)) {
            // Fechar modal
            closeModal('editTaskModal');
            
            // Atualizar interface
            renderTasks();
            
            // Mostrar notificação
            showNotification('Tarefa atualizada com sucesso', 'success');
        } else {
            showNotification('Erro ao atualizar tarefa', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        showNotification('Erro ao atualizar tarefa', 'error');
    }
}

// Excluir tarefa
function deleteTask(taskId) {
    try {
        // Confirmar exclusão
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
            return;
        }
        
        // Verificar se a tarefa existe
        const taskExists = tasks.some(task => task.id === taskId);
        if (!taskExists) {
            showNotification('Tarefa não encontrada', 'error');
            return;
        }
        
        // Filtrar tarefas
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Salvar usando o serviço
        if (dataService.saveTasks(tasks)) {
            // Fechar modal
            closeModal('taskDetailsModal');
            
            // Atualizar interface
            renderTasks();
            
            // Mostrar notificação
            showNotification('Tarefa excluída com sucesso', 'success');
        } else {
            showNotification('Erro ao excluir tarefa', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showNotification('Erro ao excluir tarefa', 'error');
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Verificar se a função global está disponível
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback simples
        alert(message);
    }
}

// Exportar funções
window.initTasks = initTasks;
