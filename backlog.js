// backlog.js - Gerenciamento do backlog de projetos
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando página de backlog');
    
    // Verificar autenticação
    if (!window.auth || !window.auth.isAuthenticated) {
        console.error('Módulo de autenticação não encontrado ou incompleto');
        return;
    }
    
    if (!window.auth.isAuthenticated()) {
        console.log('Usuário não autenticado, redirecionando...');
        window.location.href = 'login.html';
        return;
    }
    
    // Inicializar a página
    initPage();
});

// Função para inicializar a página
async function initPage() {
    console.log('Configurando página de backlog');
    
    // Configurar data atual
    updateCurrentDate();
    
    // Configurar iniciais do usuário
    setupUserInfo();
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar projetos
    await loadProjects();
    
    // Configurar drag and drop
    setupDragAndDrop();
    
    console.log('Página de backlog inicializada com sucesso');
}

// Função para atualizar a data atual
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement) return;
    
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('pt-BR', options);
    
    currentDateElement.textContent = formattedDate;
    console.log('Data atual atualizada:', formattedDate);
}

// Função para configurar informações do usuário
function setupUserInfo() {
    const user = auth.getCurrentUser();
    if (!user) return;
    
    // Configurar iniciais do usuário
    const userInitialsElement = document.getElementById('userInitials');
    if (userInitialsElement) {
        const initials = user.name.split(' ')
            .map(name => name[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
        
        userInitialsElement.textContent = initials;
    }
    
    // Configurar nome do usuário
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Configurar cargo do usuário
    const userRoleElement = document.getElementById('userRole');
    if (userRoleElement && user.role) {
        userRoleElement.textContent = user.role;
    }
    
    console.log('Informações do usuário configuradas');
}

// Função para carregar projetos
async function loadProjects() {
    console.log('Carregando projetos...');
    
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) {
        console.error('Elemento projectsList não encontrado');
        return;
    }
    
    try {
        // Obter filtros
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        const searchTerm = document.getElementById('searchProjects')?.value?.toLowerCase() || '';
        
        console.log('Filtros:', { statusFilter, searchTerm });
        
        // Mostrar indicador de carregamento
        projectsList.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        `;
        
        // Fazer requisição para a API
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao carregar projetos: ${response.status}`);
        }
        
        let projects = await response.json();
        console.log('Projetos carregados:', projects);
        
        // Aplicar filtros
        if (statusFilter) {
            projects = projects.filter(project => project.status === statusFilter);
        }
        
        if (searchTerm) {
            projects = projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) || 
                (project.description && project.description.toLowerCase().includes(searchTerm))
            );
        }
        
        console.log('Projetos após filtros:', projects);
        
        // Limpar lista
        projectsList.innerHTML = '';
        
        // Verificar se há projetos
        if (projects.length === 0) {
            projectsList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="ph ph-folder-notch-open text-5xl text-grayText mb-4"></i>
                    <p class="text-grayText">Nenhum projeto encontrado</p>
                </div>
            `;
            return;
        }
        
        // Renderizar projetos
        projects.forEach(project => {
            const card = createProjectCard(project);
            projectsList.appendChild(card);
        });
        
        // Aplicar ordem salva
        if (window.applyProjectOrder) {
            window.applyProjectOrder();
        }
        
        console.log('Projetos renderizados com sucesso');
        
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        projectsList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="ph ph-warning-circle text-5xl text-red-500 mb-4"></i>
                <p class="text-red-500">Erro ao carregar projetos: ${error.message}</p>
                <button id="retryLoadProjects" class="mt-4 px-4 py-2 bg-primary hover:bg-purple-700 rounded-lg transition-colors">
                    Tentar novamente
                </button>
            </div>
        `;
        
        // Adicionar event listener para o botão de tentar novamente
        const retryButton = document.getElementById('retryLoadProjects');
        if (retryButton) {
            retryButton.addEventListener('click', loadProjects);
        }
    }
}

// Função para configurar os event listeners da página
function setupEventListeners() {
    console.log('Configurando event listeners');
    
    // Event listener para o filtro de status
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', async () => {
            await loadProjects();
        });
    }
    
    // Event listener para a busca
    const searchProjects = document.getElementById('searchProjects');
    if (searchProjects) {
        searchProjects.addEventListener('input', debounce(async () => {
            await loadProjects();
        }, 300)); // Debounce para evitar muitas requisições
    }
    
    // Event listener para o botão de novo projeto
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            openModal('newProjectModal');
        });
    }
    
    // Event listener para o formulário de novo projeto
    const newProjectForm = document.getElementById('newProjectForm');
    if (newProjectForm) {
        newProjectForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await createProject();
        });
    }
    
    // Event listeners para fechar modais
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal') || button.closest('.modal').id;
            closeModal(modalId);
        });
    });
    
    // Event listener para botões de cancelar nos modais
    const cancelButtons = document.querySelectorAll('.cancel-modal');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal') || button.closest('.modal').id;
            closeModal(modalId);
        });
    });
    
    // Event listener para fechar modal clicando fora
    document.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    console.log('Event listeners configurados com sucesso');
}

// Função para criar um card de projeto
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'bg-darkPanel border border-darkBorder rounded-lg p-4 hover:shadow-lg transition-all';
    card.setAttribute('data-project-id', project.id);
    
    // Formatar datas
    const startDate = project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definida';
    const endDate = project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Não definida';
    
    // Formatar orçamento
    const budget = project.budget 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget) 
        : 'Não definido';
    
    // Mapear status para texto em português
    const statusMap = {
        'planning': 'Planejamento',
        'in-progress': 'Em Andamento',
        'on-hold': 'Em Espera',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    };
    
    const statusText = statusMap[project.status] || project.status;
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="flex items-center">
                <div class="drag-handle cursor-move mr-2 text-gray-400 hover:text-white">
                    <i class="ph ph-dots-six-vertical"></i>
                </div>
                <h3 class="text-lg font-semibold">${project.name}</h3>
            </div>
            <div class="flex space-x-2">
                <button class="edit-project text-gray-400 hover:text-white" data-project-id="${project.id}">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="delete-project text-gray-400 hover:text-red-500" data-project-id="${project.id}">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        </div>
        <p class="text-grayText mb-4">${project.description || 'Sem descrição'}</p>
        <div class="flex flex-wrap gap-2 mb-4">
            <span class="status-${project.status} text-xs px-2 py-1 rounded-full border">
                ${statusText}
            </span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p class="text-grayText">Data de início</p>
                <p>${startDate}</p>
            </div>
            <div>
                <p class="text-grayText">Data de término</p>
                <p>${endDate}</p>
            </div>
            <div class="col-span-2">
                <p class="text-grayText">Orçamento</p>
                <p>${budget}</p>
            </div>
        </div>
    `;
    
    // Adicionar event listeners para os botões de editar e excluir
    const editButton = card.querySelector('.edit-project');
    if (editButton) {
        editButton.addEventListener('click', () => {
            editProject(project.id);
        });
    }
    
    const deleteButton = card.querySelector('.delete-project');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            confirmDeleteProject(project.id);
        });
    }
    
    return card;
}

// Função para criar um novo projeto
async function createProject() {
    const form = document.getElementById('newProjectForm');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Criar objeto com os dados do projeto
    const projectData = {
        name: formData.get('name'),
        description: formData.get('description'),
        status: formData.get('status'),
        startDate: formData.get('startDate') || null,
        endDate: formData.get('endDate') || null,
        budget: formData.get('budget') ? Number(formData.get('budget')) : null
    };
    
    try {
        // Mostrar indicador de carregamento
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin mr-1"></i> Criando...';
        submitBtn.disabled = true;
        
        // Fazer requisição para a API
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error('Falha ao criar projeto');
        }
        
        // Fechar modal e limpar formulário
        closeModal('newProjectModal');
        form.reset();
        
        // Recarregar projetos
        await loadProjects();
        
        // Mostrar notificação de sucesso
        showNotification('Projeto criado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao criar projeto:', error);
        showNotification('Erro ao criar projeto. Por favor, tente novamente.', 'error');
    } finally {
        // Restaurar botão de submissão
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Criar Projeto';
            submitBtn.disabled = false;
        }
    }
}

// Funções auxiliares para manipulação de modais
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all transform translate-x-0`;
    
    // Definir cores com base no tipo
    if (type === 'success') {
        notification.classList.add('bg-green-600', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-600', 'text-white');
    } else if (type === 'warning') {
        notification.classList.add('bg-yellow-500', 'text-white');
    } else {
        notification.classList.add('bg-primary', 'text-white');
    }
    
    // Adicionar conteúdo
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="ph ${getIconForType(type)} mr-2 text-xl"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('opacity-100');
    }, 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
        notification.classList.add('opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Função auxiliar para obter ícone com base no tipo
    function getIconForType(type) {
        switch (type) {
            case 'success': return 'ph-check-circle';
            case 'error': return 'ph-x-circle';
            case 'warning': return 'ph-warning-circle';
            default: return 'ph-info';
        }
    }
}

// Função de debounce para limitar a frequência de execução
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para forçar a reinicialização dos dados (para desenvolvimento)
function resetData() {
    localStorage.removeItem('dataInitialized');
    localStorage.removeItem('projects');
    
    // Recarregar a página para reinicializar os dados
    window.location.reload();
}

// Expor função de reset para desenvolvimento
window.resetBacklogData = resetData;

// Função para confirmar exclusão de projeto
function confirmDeleteProject(projectId) {
    // Criar modal de confirmação
    const confirmModal = document.createElement('div');
    confirmModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    confirmModal.id = 'confirmDeleteModal';
    
    confirmModal.innerHTML = `
        <div class="bg-darkPanel border border-darkBorder rounded-lg w-full max-w-md p-6">
            <h3 class="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
            <p class="mb-6">Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.</p>
            <div class="flex justify-end gap-3">
                <button id="cancelDelete" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                    Cancelar
                </button>
                <button id="confirmDelete" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    Excluir
                </button>
            </div>
        </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(confirmModal);
    
    // Configurar event listeners
    document.getElementById('cancelDelete').addEventListener('click', () => {
        confirmModal.remove();
    });
    
    document.getElementById('confirmDelete').addEventListener('click', async () => {
        try {
            // Mostrar indicador de carregamento
            document.getElementById('confirmDelete').innerHTML = '<i class="ph ph-spinner ph-spin mr-1"></i> Excluindo...';
            document.getElementById('confirmDelete').disabled = true;
            
            // Fazer requisição para a API
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Falha ao excluir projeto');
            }
            
            // Remover modal
            confirmModal.remove();
            
            // Recarregar projetos
            await loadProjects();
            
            // Mostrar notificação de sucesso
            showNotification('Projeto excluído com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
            showNotification('Erro ao excluir projeto. Por favor, tente novamente.', 'error');
            
            // Restaurar botão
            document.getElementById('confirmDelete').innerHTML = 'Excluir';
            document.getElementById('confirmDelete').disabled = false;
        }
    });
}
