// Variáveis globais
let tasks = [];
let projects = [];
let users = [];
let draggedTask = null;

// Carregar dados quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
    loadBacklogData();
    updateCurrentDate();
    setupEventListeners();
    setupDragAndDrop();
});

// Carregar todos os dados necessários para o backlog
async function loadBacklogData() {
    try {
        await Promise.all([
            loadTasks(),
            loadProjects(),
            loadUsers()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados do backlog:', error);
        showNotification('Erro ao carregar dados do backlog', 'error');
    }
}

// Atualizar a data atual
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString('pt-BR', options);
    dateElement.textContent = currentDate;
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Toggle da sidebar
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('expanded');
    });
    
    // Toggle do tema
    document.getElementById('toggleDarkMode').addEventListener('click', () => {
        const newTheme = document.body.classList.contains('bg-darkBg') ? 'light' : 'dark';
        applyTheme(newTheme);
    });
    
    // Botão de nova tarefa
    document.getElementById('newTaskBtn').addEventListener('click', () => {
        openTaskModal();
    });
    
    // Formulário de tarefa
    document.getElementById('taskForm').addEventListener('submit', handleTaskFormSubmit);
    
    // Filtro de busca
    document.getElementById('searchTasks').addEventListener('input', filterTasks);
    
    // Filtro de projeto
    document.getElementById('filterProject').addEventListener('change', filterTasks);
    
    // Expandir/colapsar todas as tarefas
    document.getElementById('expandAll').addEventListener('click', () => toggleAllTasks(true));
    document.getElementById('collapseAll').addEventListener('click', () => toggleAllTasks(false));
}

// Configurar drag and drop
function setupDragAndDrop() {
    const containers = document.querySelectorAll('.task-container');
    
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
    });
}

// Carregar tarefas da API
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        
        if (!response.ok) {
            throw new Error('Falha ao carregar tarefas');
        }
        
        tasks = await response.json();
        renderTasks();
        updateTaskCounts();
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        throw error;
    }
}

// Carregar projetos da API
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
            throw new Error('Falha ao carregar projetos');
        }
        
        projects = await response.json();
        
        // Preencher o select de projetos para filtro
        const filterProjectSelect = document.getElementById('filterProject');
        filterProjectSelect.innerHTML = '<option value="">Todos os projetos</option>';
        
        // Preencher o select de projetos no modal
        const taskProjectSelect = document.getElementById('taskProject');
        taskProjectSelect.innerHTML = '';
        
        projects.forEach(project => {
            // Adicionar ao filtro
            const filterOption = document.createElement('option');
            filterOption.value = project.id;
            filterOption.textContent = project.name;
            filterProjectSelect.appendChild(filterOption);
            
            // Adicionar ao modal
            const modalOption = document.createElement('option');
            modalOption.value = project.id;
            modalOption.textContent = project.name;
            taskProjectSelect.appendChild(modalOption);
        });
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        throw error;
    }
}

// Carregar usuários da API
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        
        if (!response.ok) {
            throw new Error('Falha ao carregar usuários');
        }
        
        users = await response.json();
        
        // Preencher o select de responsáveis no modal
        const taskAssigneeSelect = document.getElementById('taskAssignee');
        taskAssigneeSelect.innerHTML = '<option value="">Sem responsável</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            taskAssigneeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        throw error;
    }
}

// Renderizar tarefas
function renderTasks() {
    // Limpar contêineres
    document.querySelectorAll('.task-container').forEach(container => {
        container.innerHTML = '';
    });
    
    // Filtrar tarefas
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    const projectFilter = document.getElementById('filterProject').value;
    
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                             (task.description && task.description.toLowerCase().includes(searchTerm));
        const matchesProject = !projectFilter || task.projectId === projectFilter;
        
        return matchesSearch && matchesProject;
    });
    
    // Agrupar por status
    const tasksByStatus = {
        'todo': filteredTasks.filter(task => task.status === 'todo'),
        'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
        'review': filteredTasks.filter(task => task.status === 'review'),
        'done': filteredTasks.filter(task => task.status === 'done')
    };
    
    // Renderizar por status
    for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
        const container = document.getElementById(`${status}-container`);
        
        if (statusTasks.length === 0) {
            container.innerHTML = `
                <div class="flex items-center justify-center h-32 text-grayText">
                    <p>Nenhuma tarefa</p>
                </div>
            `;
            continue;
        }
        
        statusTasks.forEach(task => {
            container.appendChild(createTaskCard(task));
        });
    }
    
    // Atualizar contadores
    updateTaskCounts();
}

// Criar card de tarefa
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card bg-darkPanel border border-darkBorder rounded-lg p-4 mb-3';
    card.setAttribute('data-task-id', task.id);
    card.setAttribute('draggable', 'true');
    
    // Encontrar projeto e responsável
    const project = projects.find(p => p.id === task.projectId);
    const assignee = users.find(u => u.id === task.assigneeId);
    
    // Determinar cor da prioridade
    let priorityColor = 'bg-gray-500';
    let priorityText = 'Média';
    
    switch (task.priority) {
        case 'low':
            priorityColor = 'bg-blue-500';
            priorityText = 'Baixa';
            break;
        case 'medium':
            priorityColor = 'bg-yellow-500';
            priorityText = 'Média';
            break;
        case 'high':
            priorityColor = 'bg-orange-500';
            priorityText = 'Alta';
            break;
        case 'urgent':
            priorityColor = 'bg-red-500';
            priorityText = 'Urgente';
            break;
    }
    
    // Formatar data
    let dueDate = '';
    if (task.dueDate) {
        const date = new Date(task.dueDate);
        dueDate = date.toLocaleDateString('pt-BR');
        
        // Verificar se está atrasada
        if (date < new Date() && task.status !== 'done') {
            dueDate = `<span class="text-red-500">${dueDate}</span>`;
        }
    }
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium">${task.title}</h3>
            <div class="flex space-x-2">
                <span class="px-2 py-1 text-xs rounded ${priorityColor} text-white">${priorityText}</span>
            </div>
        </div>
        
        <div class="task-details">
            <p class="text-grayText text-sm mb-3">${task.description || 'Sem descrição'}</p>
            
            <div class="flex flex-wrap gap-2 text-xs text-grayText">
                ${project ? `<div class="bg-darkBg px-2 py-1 rounded">📁 ${project.name}</div>` : ''}
                ${dueDate ? `<div class="bg-darkBg px-2 py-1 rounded">📅 ${dueDate}</div>` : ''}
                ${assignee ? `<div class="bg-darkBg px-2 py-1 rounded">👤 ${assignee.name}</div>` : ''}
            </div>
        </div>
        
        <div class="flex justify-end mt-3 space-x-2">
            <button class="text-grayText hover:text-white" onclick="editTask('${task.id}')">
                <i class="ph ph-pencil"></i>
            </button>
            <button class="text-grayText hover:text-red-500" onclick="deleteTask('${task.id}')">
                <i class="ph ph-trash"></i>
            </button>
        </div>
    `;
    
    // Adicionar eventos de drag and drop
    card.addEventListener('dragstart', handleDragStart);
    
    return card;
}

// Atualizar contadores de tarefas
function updateTaskCounts() {
    const counts = {
        'todo': document.querySelectorAll('#todo-container .task-card').length,
        'in-progress': document.querySelectorAll('#in-progress-container .task-card').length,
        'review': document.querySelectorAll('#review-container .task-card').length,
        'done': document.querySelectorAll('#done-container .task-card').length
    };
    
    for (const [status, count] of Object.entries(counts)) {
        document.getElementById(`${status}Count`).textContent = count;
    }
}

// Filtrar tarefas
function filterTasks() {
    renderTasks();
}

// Expandir/colapsar todas as tarefas
function toggleAllTasks(expand) {
    document.querySelectorAll('.task-details').forEach(details => {
        if (expand) {
            details.classList.remove('hidden');
        } else {
            details.classList.add('hidden');
        }
    });
}

// Abrir modal de tarefa
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('taskForm');
    
    // Limpar formulário
    form.reset();
    document.getElementById('taskId').value = '';
    
    if (taskId) {
        // Editar tarefa existente
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        modalTitle.textContent = 'Editar Tarefa';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskProject').value = task.projectId || '';
        document.getElementById('taskAssignee').value = task.assigneeId || '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskPriority').value = task.priority;
        
        if (task.dueDate) {
            document.getElementById('taskDueDate').value = task.dueDate.split('T')[0];
        }
    } else {
        // Nova tarefa
        modalTitle.textContent = 'Nova Tarefa';
        document.getElementById('taskStatus').value = 'todo';
        document.getElementById('taskPriority').value = 'medium';
    }
    
    modal.classList.remove('hidden');
}

// Fechar modal de tarefa
function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
}

// Manipular envio do formulário de tarefa
async function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const isNewTask = !taskId;
    
    // Coletar dados do formulário
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        status: document.getElementById('taskStatus').value,
        priority: document.getElementById('taskPriority').value,
        projectId: document.getElementById('taskProject').value || null,
        assigneeId: document.getElementById('taskAssignee').value || null,
        dueDate: document.getElementById('taskDueDate').value || null
    };
    
    try {
        let response;
        
        if (isNewTask) {
            // Criar nova tarefa
            response = await fetchWithAuth('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
        } else {
            // Atualizar tarefa existente
            response = await fetchWithAuth(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Falha ao salvar tarefa');
        }
        
        // Recarregar tarefas
        await loadTasks();
        
        // Fechar modal
        closeTaskModal();
        
        // Mostrar notificação
        showNotification(isNewTask ? 'Tarefa criada com sucesso' : 'Tarefa atualizada com sucesso', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        showNotification('Erro ao salvar tarefa', 'error');
    }
}

// Editar tarefa
function editTask(taskId) {
    openTaskModal(taskId);
}

// Excluir tarefa
async function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Falha ao excluir tarefa');
        }
        
        // Recarregar tarefas
        await loadTasks();
        
        // Mostrar notificação
        showNotification('Tarefa excluída com sucesso', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showNotification('Erro ao excluir tarefa', 'error');
    }
}

// Manipular início do arrasto
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
    e.target.classList.add('opacity-50');
}

// Manipular arrasto sobre contêiner
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('bg-darkBorder');
}

// Manipular soltura
async function handleDrop(e) {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('text/plain');
    const targetContainer = e.currentTarget;
    const newStatus = targetContainer.getAttribute('data-status');
    
    // Remover destaque
    document.querySelectorAll('.task-container').forEach(container => {
        container.classList.remove('bg-darkBorder');
    });
    
    // Encontrar tarefa
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    
    try {
        // Atualizar status da tarefa
        const response = await fetchWithAuth(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error('Falha ao atualizar status da tarefa');
        }
        
        // Recarregar tarefas
        await loadTasks();
        
    } catch (error) {
        console.error('Erro ao atualizar status da tarefa:', error);
        showNotification('Erro ao atualizar status da tarefa', 'error');
    }
}

// Aplicar tema
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.remove('bg-darkBg', 'text-white');
        document.body.classList.add('bg-lightBg', 'text-lightText');

        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('bg-darkPanel', 'border-darkBorder');
            panel.classList.add('bg-lightPanel', 'border-lightBorder');
        });

        document.querySelectorAll('.task-card').forEach(card => {
            card.classList.remove('bg-darkBg', 'border-darkBorder');
            card.classList.add('bg-white', 'border-lightBorder');
        });

        // Atualizar a barra lateral para o tema claro
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('bg-darkPanel', 'border-darkBorder');
        sidebar.classList.add('bg-lightPanel', 'border-lightBorder');

        // Atualizar o modal
        const modal = document.getElementById('taskModal').querySelector('div');
        modal.classList.remove('bg-darkPanel', 'border-darkBorder');
        modal.classList.add('bg-lightPanel', 'border-lightBorder');

        // Atualizar inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.classList.remove('bg-darkBg', 'border-darkBorder');
            input.classList.add('bg-white', 'border-lightBorder');
        });

        // Atualizar ícone do tema
        document.querySelector('#toggleDarkMode i').classList.remove('ph-moon');
        document.querySelector('#toggleDarkMode i').classList.add('ph-sun');
    } else {
        document.body.classList.remove('bg-lightBg', 'text-lightText');
        document.body.classList.add('bg-darkBg', 'text-white');

        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('bg-lightPanel', 'border-lightBorder');
            panel.classList.add('bg-darkPanel', 'border-darkBorder');
        });

        document.querySelectorAll('.task-card').forEach(card => {
            card.classList.remove('bg-white', 'border-lightBorder');
            card.classList.add('bg-darkBg', 'border-darkBorder');
        });

        // Atualizar a barra lateral para o tema escuro
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('bg-lightPanel', 'border-lightBorder');
        sidebar.classList.add('bg-darkPanel', 'border-darkBorder');

        // Atualizar o modal
        const modal = document.getElementById('taskModal').querySelector('div');
        modal.classList.remove('bg-lightPanel', 'border-lightBorder');
        modal.classList.add('bg-darkPanel', 'border-darkBorder');

        // Atualizar inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.classList.remove('bg-white', 'border-lightBorder');
            input.classList.add('bg-darkBg', 'border-darkBorder');
        });

        // Atualizar ícone do tema
        document.querySelector('#toggleDarkMode i').classList.remove('ph-sun');
        document.querySelector('#toggleDarkMode i').classList.add('ph-moon');
    }

    localStorage.setItem('theme', theme);
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Implementar sistema de notificação
    alert(message);
}

// Fazer requisição com autenticação
async function fetchWithAuth(url, options = {}) {
    const token = auth.getToken();
    
    if (!token) {
        // Redirecionar para login se não estiver autenticado
        window.location.href = '/login.html';
        throw new Error('Não autenticado');
    }
    
    // Adicionar token à requisição
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    
    return fetch(url, {
        ...options,
        headers
    });
}