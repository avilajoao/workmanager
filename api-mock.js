// api-mock.js - Simulação de API para desenvolvimento

// Interceptar requisições fetch
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    console.log(`[API Mock] Requisição para: ${url}`, options);
    
    // Verificar se é uma requisição para nossa API
    if (url.startsWith('/api/')) {
        return handleMockRequest(url, options);
    }
    
    // Caso contrário, usar o fetch original
    return originalFetch(url, options);
};

// Função para verificar autenticação
function checkAuth() {
  if (!auth || typeof auth.isAuthenticated !== 'function') {
    console.error('Objeto auth não está definido ou não tem o método isAuthenticated');
    return false;
  }
  
  if (!auth.isAuthenticated()) {
    console.log('Usuário não autenticado, redirecionando para login');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Função principal para lidar com requisições mock
function handleMockRequest(url, options = {}) {
    // Verificar autenticação para endpoints protegidos
    if (url !== '/api/auth/login' && !checkAuth(options)) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(new Response(JSON.stringify({ 
                    error: 'Não autorizado',
                    message: 'Você precisa estar autenticado para acessar este recurso'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }, 300);
        });
    }
    
    // Simular delay de rede
    return new Promise(resolve => {
        setTimeout(() => {
            // Verificar tipo de requisição
            if (url.startsWith('/api/projects')) {
                resolve(handleProjectsRequest(url, options));
            } else if (url === '/api/metrics') {
                resolve(handleMetricsRequest(options));
            } else if (url === '/api/auth/login') {
                resolve(handleLoginRequest(options));
            } else if (url === '/api/auth/logout') {
                resolve(handleLogoutRequest(options));
            } else {
                // Requisição não suportada
                resolve(new Response(JSON.stringify({ 
                    error: 'API não suportada',
                    message: 'O endpoint solicitado não existe'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }));
            }
        }, 300); // Delay de 300ms para simular rede
    });
}

// Função para lidar com requisições de projetos
function handleProjectsRequest(url, options) {
    // Obter projetos do localStorage
    const projectsString = localStorage.getItem('mockProjects');
    let projects = [];
    
    try {
        projects = projectsString ? JSON.parse(projectsString) : [];
    } catch (error) {
        console.error('Erro ao analisar projetos do localStorage:', error);
        // Se houver erro ao analisar, inicializar com array vazio
        localStorage.setItem('mockProjects', JSON.stringify([]));
    }
    
    // Verificar se é uma requisição para um projeto específico
    const projectIdMatch = url.match(/\/api\/projects\/([^\/]+)$/);
    
    if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        
        // Buscar projeto por ID
        if (!options.method || options.method === 'GET') {  // Modificar para aceitar requisições sem método
            console.log(`[API Mock] Buscando projeto com ID: ${projectId}`);
            const project = projects.find(p => p.id === projectId);
            
            if (!project) {
                console.log(`[API Mock] Projeto não encontrado: ${projectId}`);
                return new Response(JSON.stringify({ 
                    error: 'Projeto não encontrado',
                    message: 'O projeto solicitado não existe'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            console.log(`[API Mock] Projeto encontrado:`, project);
            return new Response(JSON.stringify(project), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Atualizar projeto
        if (options.method === 'PUT') {
            let projectData;
            
            try {
                projectData = JSON.parse(options.body);
            } catch (error) {
                return new Response(JSON.stringify({ 
                    error: 'Dados inválidos',
                    message: 'Os dados enviados não são um JSON válido'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            const projectIndex = projects.findIndex(p => p.id === projectId);
            
            if (projectIndex === -1) {
                return new Response(JSON.stringify({ 
                    error: 'Projeto não encontrado',
                    message: 'O projeto que você está tentando atualizar não existe'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Atualizar dados do projeto
            projects[projectIndex] = {
                ...projects[projectIndex],
                ...projectData,
                updatedAt: new Date().toISOString()
            };
            
            // Salvar no localStorage
            localStorage.setItem('mockProjects', JSON.stringify(projects));
            
            return new Response(JSON.stringify(projects[projectIndex]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Excluir projeto
        if (options.method === 'DELETE') {
            const projectIndex = projects.findIndex(p => p.id === projectId);
            
            if (projectIndex === -1) {
                return new Response(JSON.stringify({ 
                    error: 'Projeto não encontrado',
                    message: 'O projeto que você está tentando excluir não existe'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Remover projeto
            projects.splice(projectIndex, 1);
            
            // Salvar no localStorage
            localStorage.setItem('mockProjects', JSON.stringify(projects));
            
            return new Response(JSON.stringify({ 
                success: true,
                message: 'Projeto excluído com sucesso'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
    
    // Listar todos os projetos
    if (url === '/api/projects' && (!options.method || options.method === 'GET')) {
        return new Response(JSON.stringify(projects), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Criar novo projeto
    if (url === '/api/projects' && options.method === 'POST') {
        let projectData;
        
        try {
            projectData = JSON.parse(options.body);
        } catch (error) {
            return new Response(JSON.stringify({ 
                error: 'Dados inválidos',
                message: 'Os dados enviados não são um JSON válido'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Validar dados mínimos
        if (!projectData.name || !projectData.status) {
            return new Response(JSON.stringify({ 
                error: 'Dados incompletos',
                message: 'Nome e status são campos obrigatórios'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Gerar ID único
        const newId = Date.now().toString();
        
        // Criar novo projeto
        const newProject = {
            id: newId,
            ...projectData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Adicionar à lista
        projects.push(newProject);
        
        // Salvar no localStorage
        localStorage.setItem('mockProjects', JSON.stringify(projects));
        
        return new Response(JSON.stringify(newProject), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Método não suportado
    return new Response(JSON.stringify({ 
        error: 'Método não suportado',
        message: `O método ${options.method} não é suportado para este endpoint`
    }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Função para lidar com requisições de métricas
function handleMetricsRequest(options) {
    // Implementar conforme necessário para o dashboard
    const metrics = {
        projectsCount: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        totalBudget: 0,
        // Adicionar outras métricas conforme necessário
    };
    
    // Calcular métricas com base nos projetos
    try {
        const projectsString = localStorage.getItem('mockProjects');
        const projects = projectsString ? JSON.parse(projectsString) : [];
        
        metrics.projectsCount = projects.length;
        metrics.completedProjects = projects.filter(p => p.status === 'completed').length;
        metrics.inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
        metrics.totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    } catch (error) {
        console.error('Erro ao calcular métricas:', error);
    }
    
    return new Response(JSON.stringify(metrics), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Função para lidar com requisições de login
function handleLoginRequest(options) {
    try {
        const credentials = JSON.parse(options.body);
        
        // Verificar credenciais (simplificado para desenvolvimento)
        if (credentials.email && credentials.password) {
            // Usuário de exemplo
            const user = {
                id: '1',
                name: 'Carlos Oliveira',
                email: credentials.email,
                role: 'Gerente de Projetos'
            };
            
            // Token de exemplo (não use isso em produção!)
            const token = 'mock-jwt-token-' + Date.now();
            
            // Salvar usuário e token no localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', token);
            
            return new Response(JSON.stringify({ 
                user,
                token,
                message: 'Login realizado com sucesso'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ 
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: 'Erro no servidor',
            message: 'Ocorreu um erro ao processar a requisição'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Função para lidar com requisições de logout
function handleLogoutRequest(options) {
    // Remover dados de autenticação
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    return new Response(JSON.stringify({ 
        success: true,
        message: 'Logout realizado com sucesso'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Inicializar dados de exemplo se não existirem
function initMockData() {
    // Verificar se já existem projetos
    if (!localStorage.getItem('mockProjects')) {
        // Projetos de exemplo
        const exampleProjects = [
            {
                id: '1',
                name: 'Construção de Edifício Residencial',
                description: 'Projeto de construção de um edifício residencial com 12 andares e 48 apartamentos.',
                status: 'in-progress',
                startDate: '2023-01-15',
                endDate: '2024-06-30',
                budget: 4500000,
                createdAt: '2023-01-10T10:00:00Z',
                updatedAt: '2023-01-10T10:00:00Z'
            },
            {
                id: '2',
                name: 'Reforma de Escritório Corporativo',
                description: 'Reforma completa de um escritório de 500m² no centro empresarial.',
                status: 'planning',
                startDate: '2023-03-01',
                endDate: '2023-05-15',
                budget: 350000,
                createdAt: '2023-02-20T14:30:00Z',
                updatedAt: '2023-02-20T14:30:00Z'
            },
            {
                id: '3',
                name: 'Construção de Ponte Municipal',
                description: 'Projeto de engenharia para construção de uma ponte sobre o Rio Verde.',
                status: 'on-hold',
                startDate: '2023-06-10',
                endDate: '2024-12-20',
                budget: 12000000,
                createdAt: '2023-01-05T09:15:00Z',
                updatedAt: '2023-01-05T09:15:00Z'
            }
        ];
        
        localStorage.setItem('mockProjects', JSON.stringify(exampleProjects));
        console.log('[API Mock] Dados de exemplo inicializados');
    }
}

// Função para resetar os dados mock
function resetMockData() {
    console.log('[API Mock] Resetando dados de exemplo...');
    
    // Projetos de exemplo
    const exampleProjects = [
        {
            id: '1',
            name: 'Construção de Edifício Residencial',
            description: 'Projeto de construção de um edifício residencial com 12 andares e 48 apartamentos.',
            status: 'in-progress',
            startDate: '2023-01-15',
            endDate: '2024-06-30',
            budget: 4500000,
            createdAt: '2023-01-10T10:00:00Z',
            updatedAt: '2023-01-10T10:00:00Z'
        },
        {
            id: '2',
            name: 'Reforma de Escritório Corporativo',
            description: 'Reforma completa de um escritório de 500m² no centro empresarial.',
            status: 'planning',
            startDate: '2023-03-01',
            endDate: '2023-05-15',
            budget: 350000,
            createdAt: '2023-02-20T14:30:00Z',
            updatedAt: '2023-02-20T14:30:00Z'
        },
        {
            id: '3',
            name: 'Construção de Ponte Municipal',
            description: 'Projeto de engenharia para construção de uma ponte sobre o Rio Verde.',
            status: 'on-hold',
            startDate: '2023-06-10',
            endDate: '2024-12-20',
            budget: 12000000,
            createdAt: '2023-01-05T09:15:00Z',
            updatedAt: '2023-01-05T09:15:00Z'
        }
    ];
    
    // Salvar no localStorage
    localStorage.setItem('mockProjects', JSON.stringify(exampleProjects));
    
    console.log('[API Mock] Dados resetados com sucesso');
    return exampleProjects;
}

// Expor a função globalmente para poder chamá-la do console
window.resetMockData = resetMockData;

// Inicializar ou resetar dados mock
resetMockData();
console.log('[API Mock] API mock inicializada com dados resetados');
// Adicione este código ao final do api-mock.js para verificar se os dados estão sendo inicializados
console.log('[API Mock] Verificando dados de exemplo:');
console.log(JSON.parse(localStorage.getItem('mockProjects') || '[]'));

// Substituir ou adicionar ao final do backlog.js
window.addEventListener('pageshow', (event) => {
    console.log('Evento pageshow disparado, bfcache:', event.persisted);
    
    // Verificar autenticação
    if (!checkAuth()) return;
    
    // Aplicar tema
    applyTheme();
    
    // Inicializar a página
    initPage();
});
