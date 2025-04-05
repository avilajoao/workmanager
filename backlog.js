// backlog.js - Gerenciamento do backlog de tarefas

// Variáveis globais
let projects = [];

// Inicializar página
async function initPage() {
    // Configurar data atual
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = today.toLocaleDateString('pt-BR', options);
    
    // Configurar iniciais do usuário
    const user = auth.getCurrentUser();
    if (user) {
        const initials = user.name.split(' ')
            .map(name => name[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        
        document.getElementById('userInitials').textContent = initials;
        document.getElementById('userName').textContent = user.name;
    }
    
    // Carregar projetos
    await loadProjects();
    
    // Carregar tarefas
    await loadTasks();
    
    // Configurar eventos
    setupEventListeners();
}

// Carregar projetos
async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar projetos');
        }
        
        projects = await response.json();
        
        // Preencher selects de projetos
        const projectSelects = [
            document.getElementById('filterProject'),
            document.getElementById('taskProject')
        ];
        
        projectSelects.forEach(select => {
            // Manter a primeira opção (vazia/selecione)
            const firstOption = select.options[0];
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            // Adicionar projetos
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        alert('Erro ao carregar projetos. Por favor, recarregue a página.');
    }
}
// Carregar tarefas
async function loadTasks() {
    try {
        // Buscar tarefas
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar tarefas');
        }
        
        const tasks = await response.json();
        
        // Agrupar tarefas por status
        const tasksByStatus = {
            'todo': tasks.filter(task => task.status === 'todo'),
            'in-progress': tasks.filter(task => task.status === 'in-progress'),
            'done': tasks.filter(task => task.status === 'done')
        };
        
        // Limpar colunas
        document.getElementById('todo-tasks').innerHTML = '';
        document.getElementById('in-progress-tasks').innerHTML = '';
        document.getElementById('done-tasks').innerHTML = '';
        
        // Verificar se há tarefas
        if (tasks.length === 0) {
            document.getElementById('todo-tasks').innerHTML = `
                <div class="text-center py-8 text-grayText">
                    <p>Nenhuma tarefa encontrada</p>
                    <button id="createFirstTask" class="mt-4 bg-primary px-4 py-2 rounded-lg text-white hover:bg-purple-600">
                        Criar primeira tarefa
                    </button>
                </div>
            `;
            
            document.getElementById('in-progress-tasks').innerHTML = `
                <div class="text-center py-8 text-grayText">
                    <p>Nenhuma tarefa em andamento</p>
                </div>
            `;
            
            document.getElementById('done-tasks').innerHTML = `
                <div class="text-center py-8 text-grayText">
                    <p>Nenhuma tarefa concluída</p>
                </div>
            `;
            
            document.getElementById('createFirstTask')?.addEventListener('click', () => {
                document.getElementById('newTaskBtn').click();
            });
            
            // Atualizar contadores
            document.getElementById('todo-count').textContent = '0';
            document.getElementById('in-progress-count').textContent = '0';
            document.getElementById('done-count').textContent = '0';
            
            return;
        }
        // Preencher colunas com tarefas
        Object.keys(tasksByStatus).forEach(status => {
            const columnId = `${status}-tasks`;
            const column = document.getElementById(columnId);
            const statusTasks = tasksByStatus[status];
            
            if (statusTasks.length === 0) {
                column.innerHTML = `
                    <div class="text-center py-8 text-grayText">
                        <p>Nenhuma tarefa ${getStatusLabel(status).toLowerCase()}</p>
                    </div>
                `;
            } else {
                column.innerHTML = '';
                statusTasks.forEach(task => {
                    // Buscar nome do projeto
                    const project = projects.find(p => p.id === task.projectId) || { name: 'Projeto não encontrado' };
                    const taskCard = createTaskCard(task, project);
                    column.appendChild(taskCard);
                });
            }
            
            // Atualizar contador
            document.getElementById(`${status}-count`).textContent = statusTasks.length;
        });
        
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        
        // Exibir mensagem de erro
        document.getElementById('todo-tasks').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="ph-fill ph-warning text-4xl mb-2"></i>
                <p>Erro ao carregar tarefas: ${error.message}</p>
                <button id="retryLoadTasks" class="mt-4 bg-primary px-4 py-2 rounded-lg text-white hover:bg-purple-600">
                    Tentar novamente
                </button>
            </div>
        `;
        
        document.getElementById('in-progress-tasks').innerHTML = '';
        document.getElementById('done-tasks').innerHTML = '';
        
        document.getElementById('retryLoadTasks')?.addEventListener('click', loadTasks);
    }
}

// Obter label do status
function getStatusLabel(status) {
    const statusMap = {
        'todo': 'A Fazer',
        'in-progress': 'Em Andamento',
        'done': 'Concluído'
    };
    
    return statusMap[status] || status;
}

// Criar card de tarefa
function createTaskCard(task, project) {
    const card = document.createElement('div');
    card.className = 'task-card bg-darkPanel border border-darkBorder rounded-lg p-4 hover:border-primary';
    card.dataset.taskId = task.id;
    
    // Formatar data de entrega
    let dueDateDisplay = '';
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        const formattedDate = dueDate.toLocaleDateString('pt-BR');
        
        if (dueDate.toDateString() === today.toDateString()) {
            dueDateDisplay = `<span class="text-yellow-300">Hoje</span>`;
        } else if (dueDate.toDateString() === tomorrow.toDateString()) {
            dueDateDisplay = `<span class="text-yellow-300">Amanhã</span>`;
        } else if (dueDate < today) {
            dueDateDisplay = `<span class="text-red-400">Atrasado (${formattedDate})</span>`;
        } else {
            dueDateDisplay = formattedDate;
        }
    }
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium">${task.title}</h3>
            <span class="priority-${task.priority} text-xs px-2 py-1 rounded-full border">
                ${getPriorityLabel(task.priority)}
            </span>
        </div>
        <p class="text-grayText text-sm mb-3 line-clamp-2">${task.description || 'Sem descrição'}</p>
        <div class="flex justify-between items-center">
            <span class="bg-darkBg text-xs px-2 py-1 rounded-full">
                ${project.name}
            </span>
            ${dueDateDisplay ? `<span class="text-xs">${dueDateDisplay}</span>` : ''}
        </div>
    `;
    
    // Adicionar evento de clique para abrir detalhes
    card.addEventListener('click', () => {
        openTaskDetails(task.id);
    });
    
    return card;
}

// Obter label da prioridade
function getPriorityLabel(priority) {
    const priorityMap = {
        'urgent': 'Urgente',
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
    };
    
    return priorityMap[priority] || priority;
}
// Abrir detalhes da tarefa
async function openTaskDetails(taskId) {
    try {
        // Buscar detalhes da tarefa
        const response = await fetch(`/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar detalhes da tarefa');
        }
        
        const task = await response.json();
        
        // Buscar projeto
        const project = projects.find(p => p.id === task.projectId) || { name: 'Projeto não encontrado' };
        
        // Formatar datas
        const createdDate = new Date(task.createdAt).toLocaleString('pt-BR');
        const updatedDate = task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : 'Nunca';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definida';
        
        // Preencher modal de detalhes
        document.getElementById('detailsTaskTitle').textContent = task.title;
        
        document.getElementById('taskDetailsContent').innerHTML = `
            <div class="mb-4">
                <p class="text-grayText mb-2">Descrição:</p>
                <p>${task.description || 'Sem descrição'}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-grayText mb-1">Projeto:</p>
                    <p>${project.name}</p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Data de Entrega:</p>
                    <p>${dueDate}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-grayText mb-1">Prioridade:</p>
                    <p class="inline-block priority-${task.priority} px-2 py-1 rounded-full text-sm border">
                        ${getPriorityLabel(task.priority)}
                    </p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Status:</p>
                    <p>${getStatusLabel(task.status)}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p class="text-grayText mb-1">Criado em:</p>
                    <p>${createdDate}</p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Atualizado em:</p>
                    <p>${updatedDate}</p>
                </div>
            </div>
            
            <div class="flex justify-end space-x-2">
                <button id="editTaskBtn" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white">
                    Editar
                </button>
                <button id="deleteTaskBtn" class="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white">
                    Excluir
                </button>
            </div>
        `;
        
        // Adicionar eventos aos botões
        document.getElementById('editTaskBtn').addEventListener('click', () => {
            editTask(task);
        });
        
        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            deleteTask(task.id);
        });
        
        // Mostrar modal
        document.getElementById('taskDetailsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao carregar detalhes da tarefa:', error);
        alert('Erro ao carregar detalhes da tarefa. Por favor, tente novamente.');
    }
}
// Abrir detalhes da tarefa
async function openTaskDetails(taskId) {
    try {
        // Buscar detalhes da tarefa
        const response = await fetch(`/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar detalhes da tarefa');
        }
        
        const task = await response.json();
        
        // Buscar projeto
        const project = projects.find(p => p.id === task.projectId) || { name: 'Projeto não encontrado' };
        
        // Formatar datas
        const createdDate = new Date(task.createdAt).toLocaleString('pt-BR');
        const updatedDate = task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : 'Nunca';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definida';
        
        // Preencher modal de detalhes
        document.getElementById('detailsTaskTitle').textContent = task.title;
        
        document.getElementById('taskDetailsContent').innerHTML = `
            <div class="mb-4">
                <p class="text-grayText mb-2">Descrição:</p>
                <p>${task.description || 'Sem descrição'}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-grayText mb-1">Projeto:</p>
                    <p>${project.name}</p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Data de Entrega:</p>
                    <p>${dueDate}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-grayText mb-1">Prioridade:</p>
                    <p class="inline-block priority-${task.priority} px-2 py-1 rounded-full text-sm border">
                        ${getPriorityLabel(task.priority)}
                    </p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Status:</p>
                    <p>${getStatusLabel(task.status)}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p class="text-grayText mb-1">Criado em:</p>
                    <p>${createdDate}</p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Atualizado em:</p>
                    <p>${updatedDate}</p>
                </div>
            </div>
            
            <div class="flex justify-end space-x-2">
                <button id="editTaskBtn" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white">
                    Editar
                </button>
                <button id="deleteTaskBtn" class="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white">
                    Excluir
                </button>
            </div>
        `;
        
        // Adicionar eventos aos botões
        document.getElementById('editTaskBtn').addEventListener('click', () => {
            editTask(task);
        });
        
        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            deleteTask(task.id);
        });
        
        // Mostrar modal
        document.getElementById('taskDetailsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao carregar detalhes da tarefa:', error);
        alert('Erro ao carregar detalhes da tarefa. Por favor, tente novamente.');
    }
}
// Configurar eventos
function setupEventListeners() {
    // Botão de nova tarefa
    document.getElementById('newTaskBtn').addEventListener('click', () => {
        // Limpar formulário
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        
        // Atualizar título do modal
        document.getElementById('taskModalTitle').textContent = 'Nova Tarefa';
        
        // Mostrar modal
        document.getElementById('taskModal').classList.remove('hidden');
    });
    
    // Formulário de tarefa
    document.getElementById('taskForm').addEventListener('submit', saveTask);
    
    // Botões de fechar modal
    document.getElementById('closeTaskModal').addEventListener('click', () => {
        document.getElementById('taskModal').classList.add('hidden');
    });
    
    document.getElementById('cancelTask').addEventListener('click', () => {
        document.getElementById('taskModal').classList.add('hidden');
    });
    
    document.getElementById('closeTaskDetailsModal').addEventListener('click', () => {
        document.getElementById('taskDetailsModal').classList.add('hidden');
    });
    
    // Toggle da sidebar
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('expanded');
    });
    
    // Toggle do modo escuro
    document.getElementById('toggleDarkMode').addEventListener('click', toggleDarkMode);
    
    // Dropdown do usuário
    document.getElementById('userProfile').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('userDropdown').classList.toggle('hidden');
    });
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', () => {
        document.getElementById('userDropdown').classList.add('hidden');
    });
    
    // Botão de logout
    document.getElementById('logoutBtnDropdown').addEventListener('click', () => {
        auth.logout();
    });
    
    // Filtro de busca
    document.getElementById('searchTasks').addEventListener('input', filterTasks);
    
    // Filtros de projeto e prioridade
    document.getElementById('filterProject').addEventListener('change', filterTasks);
    document.getElementById('filterPriority').addEventListener('change', filterTasks);
}
// Filtrar tarefas
function filterTasks() {
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    const projectFilter = document.getElementById('filterProject').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    
    // Obter todos os cards de tarefas
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        const taskId = card.dataset.taskId;
        
        // Buscar tarefa correspondente
        fetch(`/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        })
        .then(response => response.json())
        .then(task => {
            // Verificar filtros
            const matchesSearch = 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm));
                
            const matchesProject = !projectFilter || task.projectId === projectFilter;
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;
            
            // Mostrar ou esconder card
            if (matchesSearch && matchesProject && matchesPriority) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
            
            // Atualizar contadores
            updateCounters();
        })
        .catch(error => {
            console.error('Erro ao filtrar tarefa:', error);
        });
    });
}

// Atualizar contadores
function updateCounters() {
    const statuses = ['todo', 'in-progress', 'done'];
    
    statuses.forEach(status => {
        const column = document.getElementById(`${status}-tasks`);
        const visibleCards = column.querySelectorAll('.task-card:not(.hidden)').length;
        
        document.getElementById(`${status}-count`).textContent = visibleCards;
        
        // Mostrar mensagem se não houver tarefas visíveis
        if (visibleCards === 0) {
            const hasNoTasksMessage = column.querySelector('.text-center.py-8.text-grayText');
            
            if (!hasNoTasksMessage) {
                column.innerHTML = `
                    <div class="text-center py-8 text-grayText">
                        <p>Nenhuma tarefa ${getStatusLabel(status).toLowerCase()} corresponde aos filtros</p>
                    </div>
                ` + column.innerHTML;
            }
        } else {
            const noTasksMessage = column.querySelector('.text-center.py-8.text-grayText');
            if (noTasksMessage) {
                noTasksMessage.remove();
            }
        }
    });
}

// Toggle do modo escuro
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.contains('bg-darkBg');
    
    if (isDark) {
        // Mudar para modo claro
        body.classList.remove('bg-darkBg', 'text-white');
        body.classList.add('bg-lightBg', 'text-lightText');
        
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('bg-darkPanel', 'border-darkBorder');
            panel.classList.add('bg-lightPanel', 'border-lightBorder');
        });
        
        document.getElementById('toggleDarkMode').innerHTML = '<i class="ph-fill ph-sun"></i>';
    } else {
        // Mudar para modo escuro
        body.classList.remove('bg-lightBg', 'text-lightText');
        body.classList.add('bg-darkBg', 'text-white');
        
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('bg-lightPanel', 'border-lightBorder');
            panel.classList.add('bg-darkPanel', 'border-darkBorder');
        });
        
        document.getElementById('toggleDarkMode').innerHTML = '<i class="ph-fill ph-moon"></i>';
    }
    
    // Salvar preferência
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initPage);

// Configurar drag and drop
function setupDragAndDrop() {
    // Configurar elementos arrastáveis
    document.querySelectorAll('.task-card').forEach(card => {
        card.setAttribute('draggable', 'true');
        
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.dataset.taskId);
            card.classList.add('opacity-50');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('opacity-50');
        });
    });
    
    // Configurar áreas de soltar
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('bg-opacity-10', 'bg-primary');
        });
        
        column.addEventListener('dragleave', () => {
            column.classList.remove('bg-opacity-10', 'bg-primary');
        });
        
        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            column.classList.remove('bg-opacity-10', 'bg-primary');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const newStatus = column.id.replace('-tasks', '');
            
            try {
                // Atualizar status da tarefa
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${auth.getToken()}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (!response.ok) {
                    throw new Error('Falha ao atualizar status da tarefa');
                }
                
                // Recarregar tarefas
                await loadTasks();
                
            } catch (error) {
                console.error('Erro ao mover tarefa:', error);
                alert('Erro ao mover tarefa. Por favor, tente novamente.');
            }
        });
    });
}
// Modificar a função loadTasks para adicionar setupDragAndDrop no final
async function loadTasks() {
    try {
        // ... código existente ...
        
        // Preencher colunas com tarefas
        Object.keys(tasksByStatus).forEach(status => {
            // ... código existente ...
        });
        
        // Configurar drag and drop após carregar as tarefas
        setupDragAndDrop();
        
    } catch (error) {
        // ... código existente ...
    }
}
// Abrir detalhes da tarefa
async function openTaskDetails(taskId) {
    try {
        // Mostrar indicador de carregamento
        document.getElementById('taskDetailsContent').innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p class="mt-2 text-grayText">Carregando detalhes...</p>
            </div>
        `;
        
        // Mostrar modal enquanto carrega
        document.getElementById('taskDetailsModal').classList.remove('hidden');
        
        // Buscar detalhes da tarefa
        const response = await fetch(`/api/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar detalhes da tarefa');
        }
        
        const task = await response.json();
        
        // Buscar projeto
        const project = projects.find(p => p.id === task.projectId) || { name: 'Projeto não encontrado' };
        
        // Formatar datas
        const createdDate = new Date(task.createdAt).toLocaleString('pt-BR');
        const updatedDate = task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : 'Nunca';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definida';
        
        // Preencher modal de detalhes
        document.getElementById('detailsTaskTitle').textContent = task.title;
        
        document.getElementById('taskDetailsContent').innerHTML = `
            <div class="mb-4">
                <p class="text-grayText mb-2">Descrição:</p>
                <p class="bg-darkBg p-3 rounded-lg">${task.description || 'Sem descrição'}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-grayText mb-1">Projeto:</p>
                    <p class="font-medium">${project.name}</p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Data de Entrega:</p>
                    <p class="font-medium">${dueDate}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="text-grayText mb-1">Prioridade:</p>
                    <p class="inline-block priority-${task.priority} px-2 py-1 rounded-full text-sm border">
                        ${getPriorityLabel(task.priority)}
                    </p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Status:</p>
                    <p class="font-medium">${getStatusLabel(task.status)}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p class="text-grayText mb-1">Criado em:</p>
                    <p class="text-sm">${createdDate}</p>
                </div>
                <div>
                    <p class="text-grayText mb-1">Atualizado em:</p>
                    <p class="text-sm">${updatedDate}</p>
                </div>
            </div>
            
            <div class="flex justify-end space-x-2">
                <button id="editTaskBtn" class="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white">
                    <i class="ph-fill ph-pencil mr-1"></i> Editar
                </button>
                <button id="deleteTaskBtn" class="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white">
                    <i class="ph-fill ph-trash mr-1"></i> Excluir
                </button>
            </div>
        `;
        
        // Adicionar eventos aos botões
        document.getElementById('editTaskBtn').addEventListener('click', () => {
            editTask(task);
        });
        
        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            deleteTask(task.id);
        });
        
    } catch (error) {
        console.error('Erro ao carregar detalhes da tarefa:', error);
        
        // Exibir mensagem de erro no modal
        document.getElementById('taskDetailsContent').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="ph-fill ph-warning text-4xl mb-2"></i>
                <p>Erro ao carregar detalhes: ${error.message}</p>
                <button id="retryLoadDetails" class="mt-4 bg-primary px-4 py-2 rounded-lg text-white hover:bg-purple-600">
                    Tentar novamente
                </button>
            </div>
        `;
        
        // Adicionar evento ao botão de tentar novamente
        document.getElementById('retryLoadDetails')?.addEventListener('click', () => {
            openTaskDetails(taskId);
        });
    }
}
