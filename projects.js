/**
 * Inicializa a página de projetos
 * @listens DOMContentLoaded
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    updateCurrentDate();
    setupEventListeners();
});

/**
 * Configura os event listeners para interações na página
 * @returns {void}
 */
function setupEventListeners() {
    // Toggle da barra lateral
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('expanded');
    });

    // Abrir modal para novo projeto
    document.getElementById('newProjectBtn').addEventListener('click', () => {
        openProjectModal();
    });

    // Fechar modal
    document.getElementById('closeModal').addEventListener('click', closeProjectModal);
    document.getElementById('cancelProject').addEventListener('click', closeProjectModal);

    // Formulário de projeto
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);

    // Filtros
    document.getElementById('searchProjects').addEventListener('input', filterProjects);
    document.getElementById('filterStatus').addEventListener('change', filterProjects);
}

/**
 * Carrega projetos da API e exibe na tabela
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Se falhar ao carregar projetos
 */
async function loadProjects() {
    const tableBody = document.getElementById('projectsTableBody');
    const loading = document.getElementById('loadingProjects');
    const noProjects = document.getElementById('noProjectsFound');
    
    try {
        loading.classList.remove('hidden');
        tableBody.innerHTML = '';
        noProjects.classList.add('hidden');
        
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
            throw new Error('Falha ao carregar projetos');
        }
        
        const projects = await response.json();
        
        if (projects.length === 0) {
            noProjects.classList.remove('hidden');
        } else {
            renderProjects(projects);
        }
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showNotification('Erro ao carregar projetos', 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

/**
 * Renderiza a lista de projetos na tabela HTML
 * @param {Array<Object>} projects - Lista de projetos
 * @returns {void}
 */
function renderProjects(projects) {
    const tableBody = document.getElementById('projectsTableBody');
    tableBody.innerHTML = '';
    
    projects.forEach(project => {
        // Determinar a classe de status
        let statusClass = '';
        switch (project.status.toLowerCase()) {
            case 'em andamento':
                statusClass = 'bg-green-500/20 text-green-500';
                break;
            case 'planejamento':
                statusClass = 'bg-yellow-500/20 text-yellow-500';
                break;
            case 'atrasado':
                statusClass = 'bg-red-500/20 text-red-500';
                break;
            case 'concluído':
                statusClass = 'bg-blue-500/20 text-blue-500';
                break;
            default:
                statusClass = 'bg-gray-500/20 text-gray-500';
        }
        
        // Determinar o ícone com base no tipo de projeto
        let iconClass = '';
        switch (project.type) {
            case 'building':
                iconClass = 'ph-buildings text-blue-500';
                break;
            case 'house':
                iconClass = 'ph-house-line text-purple-500';
                break;
            case 'commercial':
                iconClass = 'ph-storefront text-red-500';
                break;
            case 'infrastructure':
                iconClass = 'ph-roads text-yellow-500';
                break;
            default:
                iconClass = 'ph-buildings text-gray-500';
        }
        
        // Formatar a data de prazo
        const deadline = new Date(project.deadline).toLocaleDateString('pt-BR');
        
        // Criar a linha da tabela
        const row = document.createElement('tr');
        row.className = 'border-b border-darkBorder';
        row.innerHTML = `
            <td class="py-4">
                <div class="flex items-center">
                    <div class="bg-${iconClass.split(' ')[1].replace('text-', '')}/20 p-2 rounded mr-3">
                        <i class="${iconClass}"></i>
                    </div>
                    <span>${project.name}</span>
                </div>
            </td>
            <td class="py-4">${project.client}</td>
            <td class="py-4">
                <span class="px-2 py-1 ${statusClass} rounded text-xs">${project.status}</span>
            </td>
            <td class="py-4">
                <div class="w-full bg-darkBorder rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full" style="width: ${project.progress}%"></div>
                </div>
            </td>
            <td class="py-4">${deadline}</td>
            <td class="py-4">
                <div class="flex space-x-2">
                    <button class="text-grayText hover:text-white edit-project" data-id="${project.id}">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button class="text-grayText hover:text-red-500 delete-project" data-id="${project.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para os botões de editar e excluir
    document.querySelectorAll('.edit-project').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-id');
            openProjectModal(projectId);
        });
    });
    
    document.querySelectorAll('.delete-project').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.getAttribute('data-id');
            confirmDeleteProject(projectId);
        });
    });
}

/**
 * Filtra projetos com base nos critérios de busca
 * @returns {void}
 */
function filterProjects() {
    const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    
    const rows = document.querySelectorAll('#projectsTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const projectName = row.querySelector('td:first-child span').textContent.toLowerCase();
        const clientName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const status = row.querySelector('td:nth-child(3) span').textContent;
        
        const matchesSearch = projectName.includes(searchTerm) || clientName.includes(searchTerm);
        const matchesStatus = statusFilter === '' || status === statusFilter;
        
        if (matchesSearch && matchesStatus) {
            row.classList.remove('hidden');
            visibleCount++;
        } else {
            row.classList.add('hidden');
        }
    });
    
    // Mostrar mensagem se nenhum projeto for encontrado
    const noProjects = document.getElementById('noProjectsFound');
    if (visibleCount === 0) {
        noProjects.classList.remove('hidden');
    } else {
        noProjects.classList.add('hidden');
    }
}

/**
 * Abre o modal para adicionar ou editar um projeto
 * @param {string|null} projectId - ID do projeto para edição ou null para novo
 * @returns {Promise<void>}
 */
async function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('projectForm');
    
    // Resetar o formulário
    form.reset();
    
    if (projectId) {
        // Modo de edição
        modalTitle.textContent = 'Editar Projeto';
        document.getElementById('projectId').value = projectId;
        
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            
            if (!response.ok) {
                throw new Error('Falha ao carregar dados do projeto');
            }
            
            const project = await response.json();
            
            // Preencher o formulário com os dados do projeto
            document.getElementById('projectName').value = project.name;
            document.getElementById('clientName').value = project.client;
            document.getElementById('projectType').value = project.type;
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectProgress').value = project.progress;
            document.getElementById('projectDeadline').value = formatDateForInput(project.deadline);
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectBudget').value = project.budget;
            
        } catch (error) {
            console.error('Erro ao carregar dados do projeto:', error);
            showNotification('Erro ao carregar dados do projeto', 'error');
            closeProjectModal();
            return;
        }
    } else {
        // Modo de adição
        modalTitle.textContent = 'Novo Projeto';
        document.getElementById('projectId').value = '';
        
        // Definir valores padrão
        document.getElementById('projectProgress').value = 0;
        document.getElementById('projectStatus').value = 'Planejamento';
        document.getElementById('projectDeadline').value = formatDateForInput(new Date());
    }
    
    // Exibir o modal
    modal.classList.remove('hidden');
}

/**
 * Fecha o modal de projeto
 * @returns {void}
 */
function closeProjectModal() {
    document.getElementById('projectModal').classList.add('hidden');
}

// Validação de campos do formulário
function validateProjectForm() {
    let isValid = true;
    
    // Limpar erros anteriores
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    
    // Validar campos obrigatórios
    const requiredFields = [
        { id: 'projectName', name: 'Nome do Projeto' },
        { id: 'clientName', name: 'Nome do Cliente' },
        { id: 'projectDeadline', name: 'Prazo' }
    ];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input.value.trim()) {
            showFieldError(input, `${field.name} é obrigatório`);
            isValid = false;
        }
    });
    
    // Validar progresso (0-100)
    const progress = document.getElementById('projectProgress');
    if (progress.value < 0 || progress.value > 100) {
        showFieldError(progress, 'Progresso deve ser entre 0 e 100');
        isValid = false;
    }
    
    // Validar data (não pode ser no passado)
    const deadline = document.getElementById('projectDeadline');
    if (deadline.value && new Date(deadline.value) < new Date()) {
        showFieldError(deadline, 'Prazo não pode ser no passado');
        isValid = false;
    }
    
    return isValid;
}

// Mostrar erro de campo
function showFieldError(input, message) {
    input.classList.add('input-error');
    const error = document.createElement('div');
    error.className = 'error-message text-red-500 text-xs mt-1';
    error.textContent = message;
    input.parentNode.appendChild(error);
}

/**
 * Manipula o envio do formulário de projeto
 * @async
 * @param {Event} event - Evento de submit do formulário
 * @returns {Promise<void>}
 */
async function handleProjectSubmit(event) {
    event.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateProjectForm()) {
        return;
    }
    
    const projectId = document.getElementById('projectId').value;
    const isEditing = projectId !== '';
    
    // Mostrar estado de carregamento
    const submitBtn = document.getElementById('submitProject');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
        </span>
    `;
    
    // Coletar dados do formulário
    const projectData = {
        name: document.getElementById('projectName').value.trim(),
        client: document.getElementById('clientName').value.trim(),
        type: document.getElementById('projectType').value,
        status: document.getElementById('projectStatus').value,
        progress: parseInt(document.getElementById('projectProgress').value),
        deadline: document.getElementById('projectDeadline').value,
        description: document.getElementById('projectDescription').value.trim(),
        budget: parseFloat(document.getElementById('projectBudget').value) || 0
    };
    
    try {
        let url = '/api/projects';
        let method = 'POST';
        
        if (isEditing) {
            url = `/api/projects/${projectId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'criar'} projeto`);
        }
        
        showNotification(`Projeto ${isEditing ? 'atualizado' : 'criado'} com sucesso`, 'success');
        closeProjectModal();
        loadProjects(); // Recarregar a lista de projetos
        
    } catch (error) {
        console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} projeto:`, error);
        showNotification(`Erro ao ${isEditing ? 'atualizar' : 'criar'} projeto`, 'error');
    } finally {
        // Restaurar botão
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

/**
 * Solicita confirmação antes de excluir um projeto
 * @param {string} projectId - ID do projeto a ser excluído
 * @returns {void}
 */
function confirmDeleteProject(projectId) {
    if (confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
        deleteProject(projectId);
    }
}

/**
 * Exclui um projeto via API
 * @async
 * @param {string} projectId - ID do projeto a ser excluído
 * @returns {Promise<void>}
 */
async function deleteProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Falha ao excluir projeto');
        }
        
        showNotification('Projeto excluído com sucesso', 'success');
        loadProjects(); // Recarregar a lista de projetos
        
    } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        showNotification('Erro ao excluir projeto', 'error');
    }
}

/**
 * Formata uma data string para o formato de input date (YYYY-MM-DD)
 * @param {string} dateString - Data em formato string
 * @returns {string} Data formatada
 */
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Atualiza o elemento com a data atual formatada
 * @returns {void}
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    
    // Formatar a data em português do Brasil
    const formattedDate = today.toLocaleDateString('pt-BR', options);
    
    // Capitalizar a primeira letra
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    dateElement.textContent = capitalizedDate;
}

/**
 * Exibe uma notificação temporária na tela
 * @param {string} message - Mensagem a ser exibida
 * @param {'info'|'success'|'error'} [type='info'] - Tipo de notificação
 * @returns {void}
 */
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    
    // Adicionar ícone com base no tipo
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="ph ph-check-circle mr-2"></i>';
            break;
        case 'error':
            icon = '<i class="ph ph-x-circle mr-2"></i>';
            break;
        default:
            icon = '<i class="ph ph-info mr-2"></i>';
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            ${icon}
            <span>${message}</span>
        </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
