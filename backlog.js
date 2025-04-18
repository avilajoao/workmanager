// Variáveis globais
let projects = [];
let filteredProjects = [];
let currentFilter = 'all';
let currentSort = 'name-asc';

// Função principal de inicialização
async function initPage() {
    console.log('Inicializando página de backlog');
    
    // Verificar autenticação
    if (!checkAuth()) return;
    
    // Adicionar botão de reset para dados de exemplo
    addResetButton();
    
    // Garantir que a seção de arquivados exista
    ensureArchivedSectionExists();
    
    // Carregar projetos
    await loadProjects();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('Página de backlog inicializada com sucesso');
}

// Verificar autenticação
function checkAuth() {
    if (!window.auth || typeof window.auth.isAuthenticated !== 'function') {
        console.error('Objeto auth não está definido ou não tem o método isAuthenticated');
        return false;
    }
    
    if (!window.auth.isAuthenticated()) {
        console.log('Usuário não autenticado, redirecionando para login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de novo projeto
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', showNewProjectModal);
    }
    
    // Botão de exportar para CSV
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportProjectsToCSV);
    }
    
    // Filtro de projetos
    const filterSelect = document.getElementById('projectFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            currentFilter = this.value;
            applyFiltersAndSort();
        });
    }
    
    // Ordenação de projetos
    const sortSelect = document.getElementById('projectSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            applyFiltersAndSort();
        });
    }
    
    // Campo de busca
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            applyFiltersAndSort();
        }, 300));
    }
}
// Carregar projetos
async function loadProjects() {
    try {
        console.log('Carregando projetos...');
        
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar projetos');
        }
        
        projects = await response.json();
        console.log(`${projects.length} projetos carregados`);
        
        // Separar projetos ativos e arquivados
        const activeProjects = projects.filter(project => !project.archived);
        const archivedProjects = projects.filter(project => project.archived);
        
        // Aplicar filtros e ordenação
        applyFiltersAndSort();
        
        // Exibir projetos arquivados
        displayArchivedProjects(archivedProjects);
        
        // Atualizar contadores
        updateProjectCounters(activeProjects.length, archivedProjects.length);
        
        return projects;
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showNotification('Erro ao carregar projetos: ' + error.message, 'error');
        return [];
    }
}

// Aplicar filtros e ordenação
function applyFiltersAndSort() {
    if (!projects || !projects.length) return;
    
    console.log('Aplicando filtros e ordenação...');
    
    // Obter valor da busca
    const searchTerm = document.getElementById('projectSearch')?.value.toLowerCase() || '';
    
    // Filtrar projetos ativos (não arquivados)
    let filtered = projects.filter(project => !project.archived);
    
    // Aplicar filtro de status
    if (currentFilter !== 'all') {
        filtered = filtered.filter(project => project.status === currentFilter);
    }
    
    // Aplicar busca
    if (searchTerm) {
        filtered = filtered.filter(project => 
            project.name.toLowerCase().includes(searchTerm) || 
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Aplicar ordenação
    switch (currentSort) {
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-asc':
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'date-desc':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    
    // Atualizar projetos filtrados
    filteredProjects = filtered;
    
    // Exibir projetos
    displayProjects(filteredProjects);
    
    console.log(`${filteredProjects.length} projetos após filtros e ordenação`);
}

// Exibir projetos na lista
function displayProjects(projectsList) {
    const projectsContainer = document.getElementById('projectsList');
    if (!projectsContainer) return;
    
    // Limpar container
    projectsContainer.innerHTML = '';
    
    if (!projectsList.length) {
        projectsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">Nenhum projeto encontrado</p>
                <button id="createFirstProjectBtn" class="mt-4 px-4 py-2 bg-primary hover:bg-purple-700 rounded-lg transition-colors">
                    Criar Primeiro Projeto
                </button>
            </div>
        `;
        
        const createBtn = document.getElementById('createFirstProjectBtn');
        if (createBtn) {
            createBtn.addEventListener('click', showNewProjectModal);
        }
        
        return;
    }
    
    // Adicionar cards de projetos
    projectsList.forEach(project => {
        const card = createProjectCard(project);
        projectsContainer.appendChild(card);
    });
}

// Exibir projetos arquivados
function displayArchivedProjects(archivedProjects) {
    const archivedContainer = document.getElementById('archivedProjectsList');
    if (!archivedContainer) return;
    
    // Limpar container
    archivedContainer.innerHTML = '';
    
    if (!archivedProjects.length) {
        archivedContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">Nenhum projeto arquivado</p>
            </div>
        `;
        return;
    }
    
    // Adicionar cards de projetos arquivados
    archivedProjects.forEach(project => {
        const card = createProjectCard(project, true);
        archivedContainer.appendChild(card);
    });
    
    // Mostrar seção de arquivados se houver projetos
    const archivedSection = document.getElementById('archivedSection');
    if (archivedSection) {
        const toggleButton = document.getElementById('toggleArchivedButton');
        if (toggleButton) {
            toggleButton.classList.remove('hidden');
        }
    }
}

// Criar card de projeto
function createProjectCard(project, isArchived = false) {
    const card = document.createElement('div');
    card.className = 'bg-darkPanel border border-darkBorder rounded-lg p-4 hover:shadow-lg transition-all transform hover:-translate-y-1 project-card';
    card.setAttribute('data-project-id', project.id);
    
    // Definir classes de status
    let statusClass = 'bg-gray-500';
    let statusText = 'Desconhecido';
    
    switch (project.status) {
        case 'todo':
            statusClass = 'bg-blue-500';
            statusText = 'A Fazer';
            break;
        case 'in-progress':
            statusClass = 'bg-yellow-500';
            statusText = 'Em Progresso';
            break;
        case 'completed':
            statusClass = 'bg-green-500';
            statusText = 'Concluído';
            break;
        case 'on-hold':
            statusClass = 'bg-orange-500';
            statusText = 'Em Espera';
            break;
        case 'cancelled':
            statusClass = 'bg-red-500';
            statusText = 'Cancelado';
            break;
    }
    
    // Formatar datas
    const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/D';
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/D';
    
    // Formatar orçamento
    const budget = project.budget ? formatCurrency(project.budget) : 'N/D';
    
    // Construir conteúdo do card
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold">${project.name}</h3>
            <span class="status-badge ${statusClass} text-white text-xs px-2 py-1 rounded-full">${statusText}</span>
        </div>
        
        <p class="text-sm text-gray-300 mb-4 line-clamp-2">${project.description || 'Sem descrição'}</p>
        
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
            <div>
                <span class="block font-medium">Data Início</span>
                <span>${startDate}</span>
            </div>
            <div>
                <span class="block font-medium">Data Fim</span>
                <span>${endDate}</span>
            </div>
            <div class="col-span-2">
                <span class="block font-medium">Orçamento</span>
                <span>${budget}</span>
            </div>
        </div>
        
        <div class="flex justify-between items-center">
            <div class="text-xs text-gray-500">
                ID: ${project.id}
            </div>
            <div class="flex space-x-2">
                <button class="view-project-btn text-blue-400 hover:text-blue-500" title="Ver detalhes">
                    <i class="ph ph-info"></i>
                </button>
                ${isArchived ? 
                    `<button class="restore-project-btn text-green-400 hover:text-green-500" title="Restaurar projeto">
                        <i class="ph ph-arrow-counter-clockwise"></i>
                    </button>` : 
                    `<button class="archive-project-btn text-amber-400 hover:text-amber-500" title="Arquivar projeto">
                        <i class="ph ph-archive-box"></i>
                    </button>`
                }
            </div>
        </div>
    `;
    
    // Adicionar event listeners aos botões
    const viewButton = card.querySelector('.view-project-btn');
    if (viewButton) {
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showProjectDetails(project.id);
        });
    }
    
    const archiveButton = card.querySelector('.archive-project-btn');
    if (archiveButton) {
        archiveButton.addEventListener('click', (e) => {
            e.stopPropagation();
            archiveProject(project.id);
        });
    }
    
    const restoreButton = card.querySelector('.restore-project-btn');
    if (restoreButton) {
        restoreButton.addEventListener('click', (e) => {
            e.stopPropagation();
            restoreProject(project.id);
        });
    }
    
    // Adicionar event listener para abrir detalhes do projeto ao clicar no card
    card.addEventListener('click', () => {
        showProjectDetails(project.id);
    });
    
    return card;
}

// Atualizar contadores de projetos
function updateProjectCounters(activeCount, archivedCount) {
    const activeCounter = document.getElementById('activeProjectsCount');
    if (activeCounter) {
        activeCounter.textContent = activeCount;
    }
    
    const archivedCounter = document.getElementById('archivedProjectsCount');
    if (archivedCounter) {
        archivedCounter.textContent = archivedCount;
    }
    
    const totalCounter = document.getElementById('totalProjectsCount');
    if (totalCounter) {
        totalCounter.textContent = activeCount + archivedCount;
    }
}

// Formatar valor monetário
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função de debounce para evitar múltiplas chamadas
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="text-white">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Arquivar projeto
async function archiveProject(projectId) {
    try {
        console.log('Arquivando projeto:', projectId);
        
        // Buscar projeto atual
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }
        
        // Atualizar status de arquivamento
        const updatedProject = { ...project, archived: true };
        
        // Enviar atualização para a API
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify(updatedProject)
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao arquivar projeto: ${response.status}`);
        }
        
        // Atualizar projeto na lista local
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = updatedProject;
        }
        
        // Recarregar projetos
        await loadProjects();
        
        // Mostrar notificação
        showNotification('Projeto arquivado com sucesso', 'success');
        
    } catch (error) {
        console.error('Erro ao arquivar projeto:', error);
        showNotification(`Erro ao arquivar projeto: ${error.message}`, 'error');
    }
}

// Restaurar projeto
async function restoreProject(projectId) {
    try {
        console.log('Restaurando projeto:', projectId);
        
        // Buscar projeto atual
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }
        
        // Atualizar status de arquivamento
        const updatedProject = { ...project, archived: false };
        
        // Enviar atualização para a API
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify(updatedProject)
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao restaurar projeto: ${response.status}`);
        }
        
        // Atualizar projeto na lista local
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects[index] = updatedProject;
        }
        
        // Recarregar projetos
        await loadProjects();
        
        // Mostrar notificação
        showNotification('Projeto restaurado com sucesso', 'success');
        
    } catch (error) {
        console.error('Erro ao restaurar projeto:', error);
        showNotification(`Erro ao restaurar projeto: ${error.message}`, 'error');
    }
}

// Mostrar detalhes do projeto
async function showProjectDetails(projectId) {
    try {
        console.log('Mostrando detalhes do projeto:', projectId);
        
        // Buscar dados do projeto
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao buscar dados do projeto: ${response.status}`);
        }
        
        const project = await response.json();
        
        // Formatar datas
        const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definida';
        const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Não definida';
        const createdAt = new Date(project.createdAt).toLocaleString('pt-BR');
        const updatedAt = new Date(project.updatedAt).toLocaleString('pt-BR');
        
        // Formatar orçamento
        const budget = project.budget ? formatCurrency(project.budget) : 'Não definido';
        
        // Definir classes de status
        let statusClass = 'bg-gray-500';
        let statusText = 'Desconhecido';
        
        switch (project.status) {
            case 'todo':
                statusClass = 'bg-blue-500';
                statusText = 'A Fazer';
                break;
            case 'in-progress':
                statusClass = 'bg-yellow-500';
                statusText = 'Em Progresso';
                break;
            case 'completed':
                statusClass = 'bg-green-500';
                statusText = 'Concluído';
                break;
            case 'on-hold':
                statusClass = 'bg-orange-500';
                statusText = 'Em Espera';
                break;
            case 'cancelled':
                statusClass = 'bg-red-500';
                statusText = 'Cancelado';
                break;
        }
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'projectDetailsModal';
        
        // Conteúdo do modal
        modal.innerHTML = `
            <div class="bg-darkPanel border border-darkBorder rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center">
                        <h2 class="text-xl font-semibold">${project.name}</h2>
                        <span class="status-badge ${statusClass} text-white text-xs px-2 py-1 rounded-full ml-3">${statusText}</span>
                    </div>
                    <button id="closeDetailsModal" class="text-gray-400 hover:text-white">
                        <i class="ph ph-x text-2xl"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div>
                        <h3 class="text-sm font-medium text-gray-400 mb-2">Descrição</h3>
                        <p class="text-white">${project.description || 'Sem descrição'}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-sm font-medium text-gray-400 mb-2">Data de Início</h3>
                            <p>${startDate}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-400 mb-2">Data de Término</h3>
                            <p>${endDate}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-400 mb-2">Orçamento</h3>
                            <p>${budget}</p>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-400 mb-2">Status</h3>
                            <p><span class="status-badge ${statusClass} text-white text-xs px-2 py-1 rounded-full">${statusText}</span></p>
                        </div>
                    </div>
                    
                    <div class="border-t border-darkBorder pt-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                            <div>
                                <p>ID: ${project.id}</p>
                                <p>Criado em: ${createdAt}</p>
                            </div>
                            <div>
                                <p>Última atualização: ${updatedAt}</p>
                                <p>Status de arquivamento: ${project.archived ? 'Arquivado' : 'Ativo'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button id="editFromDetailsButton" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            <i class="ph ph-pencil mr-1"></i> Editar
                        </button>
                        ${project.archived ? 
                            `<button id="restoreFromDetailsButton" 
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                <i class="ph ph-arrow-counter-clockwise mr-1"></i> Restaurar
                            </button>` : 
                            `<button id="archiveFromDetailsButton" 
                                class="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
                                <i class="ph ph-archive-box mr-1"></i> Arquivar
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar modal ao DOM
        document.body.appendChild(modal);
        
        // Configurar event listeners
        document.getElementById('closeDetailsModal').addEventListener('click', () => {
            modal.remove();
        });
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Botão de editar
        document.getElementById('editFromDetailsButton').addEventListener('click', () => {
            modal.remove();
            editProject(projectId);
        });
        
        // Botão de arquivar/restaurar
        if (project.archived) {
            document.getElementById('restoreFromDetailsButton').addEventListener('click', () => {
                modal.remove();
                restoreProject(projectId);
            });
        } else {
            document.getElementById('archiveFromDetailsButton').addEventListener('click', () => {
                modal.remove();
                archiveProject(projectId);
            });
        }
        
    } catch (error) {
        console.error('Erro ao mostrar detalhes do projeto:', error);
        showNotification(`Erro ao carregar detalhes do projeto: ${error.message}`, 'error');
    }
}

// Editar projeto
async function editProject(projectId) {
    try {
        console.log('Editando projeto:', projectId);
        
        // Buscar dados do projeto
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao buscar dados do projeto: ${response.status}`);
        }
        
        const project = await response.json();
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'editProjectModal';
        
        // Conteúdo do modal
        modal.innerHTML = `
            <div class="bg-darkPanel border border-darkBorder rounded-lg p-6 w-full max-w-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold">Editar Projeto</h2>
                    <button id="closeEditModal" class="text-gray-400 hover:text-white">
                        <i class="ph ph-x text-2xl"></i>
                    </button>
                </div>
                
                <form id="editProjectForm" class="space-y-4">
                    <div>
                        <label for="editProjectName" class="block text-sm font-medium text-gray-400 mb-1">Nome do Projeto</label>
                        <input type="text" id="editProjectName" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value="${project.name}" required>
                    </div>
                    
                    <div>
                        <label for="editProjectDescription" class="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                        <textarea id="editProjectDescription" rows="3" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">${project.description || ''}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="editProjectStartDate" class="block text-sm font-medium text-gray-400 mb-1">Data de Início</label>
                            <input type="date" id="editProjectStartDate" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value="${project.startDate || ''}">
                        </div>
                        <div>
                            <label for="editProjectEndDate" class="block text-sm font-medium text-gray-400 mb-1">Data de Término</label>
                            <input type="date" id="editProjectEndDate" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value="${project.endDate || ''}">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="editProjectStatus" class="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select id="editProjectStatus" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="todo" ${project.status === 'todo' ? 'selected' : ''}>A Fazer</option>
                                <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>Em Progresso</option>
                                <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>Concluído</option>
                                <option value="on-hold" ${project.status === 'on-hold' ? 'selected' : ''}>Em Espera</option>
                                <option value="cancelled" ${project.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label for="editProjectBudget" class="block text-sm font-medium text-gray-400 mb-1">Orçamento (R$)</label>
                            <input type="number" id="editProjectBudget" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value="${project.budget || ''}">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" id="cancelEditBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 bg-primary hover:bg-purple-700 rounded-lg transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Adicionar modal ao DOM
        document.body.appendChild(modal);
        
        // Configurar event listeners
        document.getElementById('closeEditModal').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Submeter formulário
        document.getElementById('editProjectForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Coletar dados do formulário
            const updatedProject = {
                ...project,
                name: document.getElementById('editProjectName').value,
                description: document.getElementById('editProjectDescription').value,
                startDate: document.getElementById('editProjectStartDate').value || null,
                endDate: document.getElementById('editProjectEndDate').value || null,
                status: document.getElementById('editProjectStatus').value,
                budget: document.getElementById('editProjectBudget').value ? 
                    parseFloat(document.getElementById('editProjectBudget').value) : null,
                updatedAt: new Date().toISOString()
            };
            
            try {
                // Enviar atualização para a API
                const updateResponse = await fetch(`/api/projects/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.auth.getToken()}`
                    },
                    body: JSON.stringify(updatedProject)
                });
                
                if (!updateResponse.ok) {
                    throw new Error(`Falha ao atualizar projeto: ${updateResponse.status}`);
                }
                
                // Fechar modal
                modal.remove();
                
                // Recarregar projetos
                await loadProjects();
                
                // Mostrar notificação
                showNotification('Projeto atualizado com sucesso', 'success');
                
            } catch (error) {
                console.error('Erro ao atualizar projeto:', error);
                showNotification(`Erro ao atualizar projeto: ${error.message}`, 'error');
            }
        });
        
    } catch (error) {
        console.error('Erro ao editar projeto:', error);
        showNotification(`Erro ao editar projeto: ${error.message}`, 'error');
    }
}

// Mostrar modal de novo projeto
function showNewProjectModal() {
    console.log('Mostrando modal de novo projeto');
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'newProjectModal';
    
    // Conteúdo do modal
    modal.innerHTML = `
        <div class="bg-darkPanel border border-darkBorder rounded-lg p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-semibold">Novo Projeto</h2>
                <button id="closeNewModal" class="text-gray-400 hover:text-white">
                    <i class="ph ph-x text-2xl"></i>
                </button>
            </div>
            
            <form id="newProjectForm" class="space-y-4">
                <div>
                    <label for="newProjectName" class="block text-sm font-medium text-gray-400 mb-1">Nome do Projeto</label>
                    <input type="text" id="newProjectName" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                </div>
                
                <div>
                    <label for="newProjectDescription" class="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                    <textarea id="newProjectDescription" rows="3" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="newProjectStartDate" class="block text-sm font-medium text-gray-400 mb-1">Data de Início</label>
                        <input type="date" id="newProjectStartDate" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                    <div>
                        <label for="newProjectEndDate" class="block text-sm font-medium text-gray-400 mb-1">Data de Término</label>
                        <input type="date" id="newProjectEndDate" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="newProjectStatus" class="block text-sm font-medium text-gray-400 mb-1">Status</label>
                        <select id="newProjectStatus" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="todo">A Fazer</option>
                            <option value="in-progress">Em Progresso</option>
                            <option value="completed">Concluído</option>
                            <option value="on-hold">Em Espera</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                    <div>
                        <label for="newProjectBudget" class="block text-sm font-medium text-gray-400 mb-1">Orçamento (R$)</label>
                        <input type="number" id="newProjectBudget" class="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" id="cancelNewBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary hover:bg-purple-700 rounded-lg transition-colors">
                        Criar Projeto
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Adicionar modal ao DOM
    document.body.appendChild(modal);
    
    // Configurar event listeners
    document.getElementById('closeNewModal').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('cancelNewBtn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Submeter formulário
    document.getElementById('newProjectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Gerar ID único
        const projectId = 'proj-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        
        // Coletar dados do formulário
        const newProject = {
            id: projectId,
            name: document.getElementById('newProjectName').value,
            description: document.getElementById('newProjectDescription').value,
            startDate: document.getElementById('newProjectStartDate').value || null,
            endDate: document.getElementById('newProjectEndDate').value || null,
            status: document.getElementById('newProjectStatus').value,
            budget: document.getElementById('newProjectBudget').value ? 
                parseFloat(document.getElementById('newProjectBudget').value) : null,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            // Enviar para a API
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.auth.getToken()}`
                },
                body: JSON.stringify(newProject)
            });
            
            if (!response.ok) {
                throw new Error(`Falha ao criar projeto: ${response.status}`);
            }
            
            // Fechar modal
            modal.remove();
            
            // Recarregar projetos
            await loadProjects();
            
            // Mostrar notificação
            showNotification('Projeto criado com sucesso', 'success');
            
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            showNotification(`Erro ao criar projeto: ${error.message}`, 'error');
        }
    });
}

// Exportar projetos para CSV
function exportProjectsToCSV() {
    console.log('Exportando projetos para CSV');
    
    if (!projects || !projects.length) {
        showNotification('Não há projetos para exportar', 'warning');
        return;
    }
    
    // Cabeçalhos do CSV
    const headers = [
        'ID', 
        'Nome', 
        'Descrição', 
        'Status', 
        'Data de Início', 
        'Data de Término', 
        'Orçamento', 
        'Arquivado', 
        'Criado em', 
        'Atualizado em'
    ];
    
    // Mapear projetos para linhas do CSV
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    projects.forEach(project => {
        const row = [
            `"${project.id}"`,
            `"${project.name.replace(/"/g, '""')}"`,
            `"${(project.description || '').replace(/"/g, '""')}"`,
            `"${project.status}"`,
            `"${project.startDate || ''}"`,
            `"${project.endDate || ''}"`,
            `"${project.budget || 0}"`,
            `"${project.archived ? 'Sim' : 'Não'}"`,
            `"${project.createdAt}"`,
            `"${project.updatedAt}"`
        ];
        
        csvRows.push(row.join(','));
    });
    
    // Criar blob e link para download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `projetos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Exportação concluída com sucesso', 'success');
}

// Garantir que a seção de arquivados existe
function ensureArchivedSectionExists() {
    if (!document.getElementById('archivedSection')) {
        console.log('Criando seção de projetos arquivados');
        
        const mainContainer = document.querySelector('main .container');
        
        if (mainContainer) {
            // Criar seção de projetos arquivados
            const archivedSection = document.createElement('div');
            archivedSection.id = 'archivedSection';
            archivedSection.className = 'mt-8 hidden'; // Inicialmente oculto
            
            archivedSection.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Projetos Arquivados</h2>
                </div>
                
                <div id="archivedProjectsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Projetos arquivados serão inseridos aqui -->
                </div>
            `;
            
            mainContainer.appendChild(archivedSection);
            
            // Adicionar botão para mostrar/ocultar projetos arquivados
            const actionsContainer = document.querySelector('.header-actions');
            
            if (actionsContainer && !document.getElementById('toggleArchivedButton')) {
                const toggleButton = document.createElement('button');
                toggleButton.id = 'toggleArchivedButton';
                toggleButton.className = 'px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded-lg text-white text-sm ml-2';
                toggleButton.innerHTML = '<i class="ph ph-archive-box mr-2"></i> Mostrar Arquivados';
                
                toggleButton.addEventListener('click', () => {
                    const archivedSection = document.getElementById('archivedSection');
                    archivedSection.classList.toggle('hidden');
                    
                    // Atualizar ícone e texto do botão
                    if (archivedSection.classList.contains('hidden')) {
                        toggleButton.innerHTML = '<i class="ph ph-archive-box mr-2"></i> Mostrar Arquivados';
                    } else {
                        toggleButton.innerHTML = '<i class="ph ph-archive-box mr-2"></i> Ocultar Arquivados';
                    }
                });
                
                actionsContainer.appendChild(toggleButton);
            }
        }
    }
}

// Adicionar botão de reset para dados de exemplo
function addResetButton() {
    const actionsContainer = document.querySelector('.header-actions');
    
    if (actionsContainer && !document.getElementById('resetDataButton')) {
        const resetButton = document.createElement('button');
        resetButton.id = 'resetDataButton';
        resetButton.className = 'px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm ml-2';
        resetButton.innerHTML = '<i class="ph ph-recycle mr-2"></i> Resetar Dados';
        
        resetButton.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja resetar todos os dados para o estado inicial?')) {
                if (typeof window.resetMockData === 'function') {
                    window.resetMockData();
                    await loadProjects();
                    showNotification('Dados resetados com sucesso', 'success');
                } else {
                    showNotification('Função de reset não encontrada', 'error');
                }
            }
        });
        
        actionsContainer.appendChild(resetButton);
    }
}

// Função para resetar dados mock
window.resetMockData = function() {
    console.log('Resetando dados mock');
    
    // Projetos de exemplo
    const mockProjects = [
        {
            id: 'proj-001',
            name: 'Redesign do Site Corporativo',
            description: 'Atualização completa do site da empresa para melhorar a experiência do usuário e aumentar conversões.',
            status: 'in-progress',
            startDate: '2023-06-15',
            endDate: '2023-09-30',
            budget: 45000,
            archived: false,
            createdAt: '2023-06-10T10:30:00Z',
            updatedAt: '2023-07-05T14:20:00Z'
        },
        {
            id: 'proj-002',
            name: 'Implementação do CRM',
            description: 'Implementação de um sistema de CRM para melhorar o gerenciamento de relacionamento com clientes.',
            status: 'todo',
            startDate: '2023-08-01',
            endDate: '2023-11-15',
            budget: 60000,
            archived: false,
            createdAt: '2023-07-20T09:15:00Z',
            updatedAt: '2023-07-20T09:15:00Z'
        },
        {
            id: 'proj-003',
            name: 'Campanha de Marketing Digital Q3',
            description: 'Planejamento e execução da campanha de marketing digital para o terceiro trimestre.',
            status: 'completed',
            startDate: '2023-07-01',
            endDate: '2023-09-30',
            budget: 30000,
            archived: false,
            createdAt: '2023-06-25T11:45:00Z',
            updatedAt: '2023-10-02T16:30:00Z'
        },
        {
            id: 'proj-004',
            name: 'Desenvolvimento de App Mobile',
            description: 'Criação de um aplicativo mobile para clientes acessarem seus dados e fazerem pedidos.',
            status: 'on-hold',
            startDate: '2023-05-10',
            endDate: '2023-10-15',
            budget: 120000,
            archived: false,
            createdAt: '2023-04-28T13:20:00Z',
            updatedAt: '2023-06-15T10:10:00Z'
        },
        {
            id: 'proj-005',
            name: 'Treinamento de Equipe em Novas Tecnologias',
            description: 'Programa de capacitação da equipe técnica em novas tecnologias e metodologias.',
            status: 'cancelled',
            startDate: '2023-07-15',
            endDate: '2023-08-15',
            budget: 15000,
            archived: true, // Este projeto está arquivado
            createdAt: '2023-06-30T08:45:00Z',
            updatedAt: '2023-07-10T11:30:00Z'
        }
    ];
    
    // Salvar no localStorage
    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
    
    console.log('Dados mock resetados com sucesso');
    return mockProjects;
};

// Inicializar a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado');
    
    // Verificar autenticação
    if (!checkAuth()) return;
    
    // Aplicar tema
    if (typeof applyTheme === 'function') {
        applyTheme();
    }
    
    // Inicializar a página
    initPage();
});

// Exportar funções para uso global
window.editProject = editProject;
window.archiveProject = archiveProject;
window.restoreProject = restoreProject;
window.showProjectDetails = showProjectDetails;
window.loadProjects = loadProjects;
