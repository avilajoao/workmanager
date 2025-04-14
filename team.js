// team.js - Gerenciamento da equipe

// Variáveis globais
let teamMembers = [];
let currentMember = null;

// Inicializar a página de equipe
function initTeam() {
    console.log('Inicializando página de equipe');
    
    // Verificar autenticação
    if (typeof checkAuth === 'function' && !checkAuth()) return;
    
    // Aplicar tema
    if (typeof applyTheme === 'function') {
        applyTheme();
    }
    
    // Atualizar data atual
    updateCurrentDate();
    
    // Carregar dados
    loadTeamMembers();
    
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

// Carregar membros da equipe
function loadTeamMembers() {
    // Verificar se temos dados de membros da equipe no localStorage
    const storedMembers = localStorage.getItem('teamMembers');
    
    if (storedMembers) {
        teamMembers = JSON.parse(storedMembers);
    } else {
        // Criar membros de exemplo
        teamMembers = [
            { 
                id: 'user-1', 
                name: 'Carlos Oliveira', 
                role: 'Gerente de Projetos', 
                email: 'carlos.oliveira@exemplo.com',
                phone: '(11) 98765-4321',
                department: 'Gerência',
                avatar: 'CO',
                joinDate: '2022-01-15'
            },
            { 
                id: 'user-2', 
                name: 'Ana Silva', 
                role: 'Desenvolvedor Front-end', 
                email: 'ana.silva@exemplo.com',
                phone: '(11) 91234-5678',
                department: 'Desenvolvimento',
                avatar: 'AS',
                joinDate: '2022-03-10'
            },
            { 
                id: 'user-3', 
                name: 'Pedro Santos', 
                role: 'Desenvolvedor Back-end', 
                email: 'pedro.santos@exemplo.com',
                phone: '(11) 92345-6789',
                department: 'Desenvolvimento',
                avatar: 'PS',
                joinDate: '2022-02-20'
            },
            { 
                id: 'user-4', 
                name: 'Mariana Costa', 
                role: 'Designer UX/UI', 
                email: 'mariana.costa@exemplo.com',
                phone: '(11) 93456-7890',
                department: 'Design',
                avatar: 'MC',
                joinDate: '2022-04-05'
            },
            { 
                id: 'user-5', 
                name: 'Lucas Mendes', 
                role: 'Analista de QA', 
                email: 'lucas.mendes@exemplo.com',
                phone: '(11) 94567-8901',
                department: 'Qualidade',
                avatar: 'LM',
                joinDate: '2022-05-15'
            }
        ];
        
        // Salvar no localStorage
        localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    }
    
    // Renderizar membros
    renderTeamMembers();
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de novo membro
    const newMemberBtn = document.getElementById('newMemberBtn');
    if (newMemberBtn) {
        newMemberBtn.addEventListener('click', () => {
            openModal('newMemberModal');
        });
    }
    
    // Formulário de novo membro
    const newMemberForm = document.getElementById('newMemberForm');
    if (newMemberForm) {
        newMemberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createMember();
        });
    }
    
    // Formulário de edição de membro
    const editMemberForm = document.getElementById('editMemberForm');
    if (editMemberForm) {
        editMemberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateMember();
        });
    }
    
    // Botão de editar membro
    const editMemberBtn = document.getElementById('editMemberBtn');
    if (editMemberBtn) {
        editMemberBtn.addEventListener('click', () => {
            if (currentMember) {
                openEditMemberModal(currentMember);
            }
        });
    }
    
    // Botão de excluir membro
    const deleteMemberBtn = document.getElementById('deleteMemberBtn');
    if (deleteMemberBtn) {
        deleteMemberBtn.addEventListener('click', () => {
            if (currentMember) {
                deleteMember(currentMember.id);
            }
        });
    }
    
    // Filtros
    const searchInput = document.getElementById('searchMembers');
    if (searchInput) {
        searchInput.addEventListener('input', renderTeamMembers);
    }
    
    const filterRole = document.getElementById('filterRole');
    if (filterRole) {
        filterRole.addEventListener('change', renderTeamMembers);
    }
    
    // Fechar modais
    const closeButtons = document.querySelectorAll('.close-modal, .cancel-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            closeModal(modalId);
        });
    });
}

// Abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Renderizar membros da equipe
function renderTeamMembers() {
    // Obter filtros
    const searchTerm = document.getElementById('searchMembers')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('filterRole')?.value || '';
    
    // Filtrar membros
    const filteredMembers = teamMembers.filter(member => {
        // Filtro de busca
        if (searchTerm && !member.name.toLowerCase().includes(searchTerm) && 
            !member.role.toLowerCase().includes(searchTerm) &&
            !member.email.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Filtro de função
        if (roleFilter && !member.role.includes(roleFilter)) {
            return false;
        }
        
        return true;
    });
    
    // Obter container
    const container = document.getElementById('team-members-container');
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Verificar se há membros
    if (filteredMembers.length === 0) {
        container.innerHTML = `
            <div class="col-span-full member-placeholder text-center text-grayText p-8">
                <i class="ph ph-users text-5xl mb-4"></i>
                <p>Nenhum membro encontrado</p>
            </div>
        `;
        return;
    }
    
    // Renderizar membros
    filteredMembers.forEach(member => {
        const memberElement = createMemberElement(member);
        container.appendChild(memberElement);
    });
}

// Criar elemento de membro
function createMemberElement(member) {
    const memberElement = document.createElement('div');
    memberElement.className = 'bg-darkPanel border border-darkBorder rounded-lg p-6 hover:border-primary transition-colors';
    memberElement.dataset.memberId = member.id;
    
    // Obter iniciais para avatar
    const avatar = member.avatar || getInitials(member.name);
    
    // Formatar data de entrada
    let joinDate = 'Data desconhecida';
    if (member.joinDate) {
        joinDate = new Date(member.joinDate).toLocaleDateString('pt-BR');
    }
    
    // Construir HTML
    memberElement.innerHTML = `
        <div class="flex items-start">
            <div class="w-14 h-14 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span class="text-xl">${avatar}</span>
            </div>
            <div class="flex-grow">
                <h3 class="font-medium text-lg">${member.name}</h3>
                <p class="text-grayText">${member.role}</p>
                <div class="mt-4 space-y-2">
                    <div class="flex items-center text-sm">
                        <i class="ph ph-envelope text-grayText mr-2"></i>
                        <span>${member.email}</span>
                    </div>
                    ${member.phone ? `
                        <div class="flex items-center text-sm">
                            <i class="ph ph-phone text-grayText mr-2"></i>
                            <span>${member.phone}</span>
                        </div>
                    ` : ''}
                    ${member.department ? `
                        <div class="flex items-center text-sm">
                            <i class="ph ph-buildings text-grayText mr-2"></i>
                            <span>${member.department}</span>
                        </div>
                    ` : ''}
                    <div class="flex items-center text-sm">
                        <i class="ph ph-calendar text-grayText mr-2"></i>
                        <span>Entrou em ${joinDate}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar evento de clique
    memberElement.addEventListener('click', () => {
        showMemberDetails(member);
    });
    
    return memberElement;
}

// Obter iniciais do nome
function getInitials(name) {
    if (!name) return '??';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Mostrar detalhes do membro
function showMemberDetails(member) {
    // Armazenar membro atual
    currentMember = member;
    
    // Obter iniciais para avatar
    const avatar = member.avatar || getInitials(member.name);
    
    // Formatar data de entrada
    let joinDate = 'Data desconhecida';
    if (member.joinDate) {
        joinDate = new Date(member.joinDate).toLocaleDateString('pt-BR');
    }
    
    // Preencher modal
    document.getElementById('memberDetailsTitle').textContent = member.name;
    
    const contentElement = document.getElementById('memberDetailsContent');
    contentElement.innerHTML = `
        <div class="flex items-center mb-6">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
                <span class="text-2xl">${avatar}</span>
            </div>
            <div>
                <h3 class="font-medium text-xl">${member.name}</h3>
                <p class="text-grayText">${member.role}</p>
            </div>
        </div>
        
        <div class="space-y-4">
            <div>
                <h4 class="text-sm text-grayText mb-1">Email</h4>
                <p>${member.email}</p>
            </div>
            
            ${member.phone ? `
                <div>
                    <h4 class="text-sm text-grayText mb-1">Telefone</h4>
                    <p>${member.phone}</p>
                </div>
            ` : ''}
            
            ${member.department ? `
                <div>
                    <h4 class="text-sm text-grayText mb-1">Departamento</h4>
                    <p>${member.department}</p>
                </div>
            ` : ''}
            
            <div>
                <h4 class="text-sm text-grayText mb-1">Data de Entrada</h4>
                <p>${joinDate}</p>
            </div>
        </div>
    `;
    
    // Abrir modal
    openModal('memberDetailsModal');
}

// Abrir modal de edição de membro
function openEditMemberModal(member) {
    // Preencher formulário
    document.getElementById('editMemberId').value = member.id;
    document.getElementById('editMemberName').value = member.name;
    document.getElementById('editMemberEmail').value = member.email;
    document.getElementById('editMemberRole').value = member.role;
    document.getElementById('editMemberPhone').value = member.phone || '';
    document.getElementById('editMemberDepartment').value = member.department || '';
    
    // Fechar modal de detalhes
    closeModal('memberDetailsModal');
    
    // Abrir modal de edição
    openModal('editMemberModal');
}

// Criar novo membro
function createMember() {
    // Obter dados do formulário
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;
    const role = document.getElementById('memberRole').value;
    const phone = document.getElementById('memberPhone').value;
    const department = document.getElementById('memberDepartment').value;
    
    // Criar objeto de membro
    const newMember = {
        id: 'user-' + Date.now(),
        name,
        email,
        role,
        phone,
        department,
        avatar: getInitials(name),
        joinDate: new Date().toISOString()
    };
    
    // Adicionar à lista de membros
    teamMembers.push(newMember);
    
    // Salvar no localStorage
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    // Fechar modal
    closeModal('newMemberModal');
    
    // Limpar formulário
    document.getElementById('newMemberForm').reset();
    
    // Atualizar interface
    renderTeamMembers();
    
    // Mostrar notificação
    showNotification('Membro adicionado com sucesso', 'success');
}

// Atualizar membro
function updateMember() {
    // Obter ID do membro
    const memberId = document.getElementById('editMemberId').value;
    
    // Encontrar índice do membro
    const memberIndex = teamMembers.findIndex(member => member.id === memberId);
    
    if (memberIndex === -1) {
        showNotification('Membro não encontrado', 'error');
        return;
    }
    
    // Obter dados do formulário
    const name = document.getElementById('editMemberName').value;
    const email = document.getElementById('editMemberEmail').value;
    const role = document.getElementById('editMemberRole').value;
    const phone = document.getElementById('editMemberPhone').value;
    const department = document.getElementById('editMemberDepartment').value;
    
    // Atualizar membro
    teamMembers[memberIndex] = {
        ...teamMembers[memberIndex],
        name,
        email,
        role,
        phone,
        department,
        avatar: getInitials(name)
    };
    
    // Salvar no localStorage
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    // Fechar modal
    closeModal('editMemberModal');
    
    // Atualizar interface
    renderTeamMembers();
    
    // Mostrar notificação
    showNotification('Membro atualizado com sucesso', 'success');
}

// Excluir membro
function deleteMember(memberId) {
    // Confirmar exclusão
    if (!confirm('Tem certeza que deseja excluir este membro?')) {
        return;
    }
    
    // Filtrar membros
    teamMembers = teamMembers.filter(member => member.id !== memberId);
    
    // Salvar no localStorage
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    
    // Fechar modal
    closeModal('memberDetailsModal');
    
    // Atualizar interface
    renderTeamMembers();
    
    // Mostrar notificação
    showNotification('Membro excluído com sucesso', 'success');
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
window.initTeam = initTeam;