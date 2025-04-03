// api-mock.js - Simulação de API para desenvolvimento

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o mock já foi inicializado
    if (window.apiMockInitialized) return;
    
    console.log('Inicializando API mock...');
    
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options = {}) {
        console.log(`Mock API Request: ${options?.method || 'GET'} ${url}`);
        
        // Verificar se é uma requisição de API
        if (!url.startsWith('/api/')) {
            return originalFetch(url, options);
        }
        
        // Extrair token de autenticação
        const authHeader = options.headers?.Authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        
        // Verificar autenticação para rotas protegidas
        if (url !== '/api/auth/login' && !token) {
            return Promise.resolve({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Não autorizado' })
            });
        }
        
        // Rotas de autenticação
        if (url === '/api/auth/login' && options.method === 'POST') {
            const credentials = JSON.parse(options.body);
            
            if (credentials.email === 'joao@exemplo.com' && credentials.password === 'senha123') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvYW8gU2lsdmEiLCJpYXQiOjE1MTYyMzkwMjJ9',
                        user: {
                            id: '1',
                            name: 'João Silva',
                            email: 'joao@exemplo.com',
                            role: 'admin'
                        }
                    })
                });
            } else {
                return Promise.resolve({
                    ok: false,
                    status: 401,
                    json: () => Promise.resolve({ error: 'Credenciais inválidas' })
                });
            }
        }
        
        // Extrair ID do projeto da URL
        const projectIdMatch = url.match(/\/api\/projects\/([^\/]+)(?:\/tasks)?$/);
        const projectId = projectIdMatch ? projectIdMatch[1] : null;
        
        // Extrair ID da tarefa da URL
        const taskIdMatch = url.match(/\/api\/tasks\/([^\/]+)$/);
        const taskId = taskIdMatch ? taskIdMatch[1] : null;
        
        // Obter projetos do localStorage
        let mockProjects = JSON.parse(localStorage.getItem('mockProjects') || '[]');
        let mockTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
        
        // Rotas de projetos
        if (url === '/api/projects') {
            // Listar projetos
            if (!options.method || options.method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProjects)
                });
            }
            
            // Criar projeto
            if (options.method === 'POST') {
                const newProject = JSON.parse(options.body);
                newProject.id = Date.now().toString();
                newProject.createdAt = new Date().toISOString();
                
                mockProjects.push(newProject);
                localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
                
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(newProject)
                });
            }
        }
        
        // Projeto específico
        if (projectId && !url.includes('/tasks')) {
            // Obter projeto
            if (!options.method || options.method === 'GET') {
                const project = mockProjects.find(p => p.id === projectId);
                
                if (project) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(project)
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Projeto não encontrado' })
                    });
                }
            }
            
            // Atualizar projeto
            if (options.method === 'PUT') {
                const projectIndex = mockProjects.findIndex(p => p.id === projectId);
                
                if (projectIndex !== -1) {
                    const updatedProject = JSON.parse(options.body);
                    mockProjects[projectIndex] = {
                        ...mockProjects[projectIndex],
                        ...updatedProject,
                        updatedAt: new Date().toISOString()
                    };
                    
                    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
                    
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockProjects[projectIndex])
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Projeto não encontrado' })
                    });
                }
            }
            
            // Excluir projeto
            if (options.method === 'DELETE') {
                const projectIndex = mockProjects.findIndex(p => p.id === projectId);
                
                if (projectIndex !== -1) {
                    mockProjects.splice(projectIndex, 1);
                    localStorage.setItem('mockProjects', JSON.stringify(mockProjects));
                    
                    // Também excluir tarefas associadas
                    mockTasks = mockTasks.filter(t => t.projectId !== projectId);
                    localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
                    
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ success: true })
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Projeto não encontrado' })
                    });
                }
            }
        }
        
        // Tarefas de um projeto específico
        if (projectId && url.includes('/tasks')) {
            // Listar tarefas do projeto
            if (!options.method || options.method === 'GET') {
                const projectTasks = mockTasks.filter(t => t.projectId === projectId);
                
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(projectTasks)
                });
            }
        }
        
        // Rotas de tarefas
        if (url === '/api/tasks') {
            // Listar todas as tarefas
            if (!options.method || options.method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockTasks)
                });
            }
            
            // Criar tarefa
            if (options.method === 'POST') {
                const newTask = JSON.parse(options.body);
                newTask.id = Date.now().toString();
                newTask.createdAt = new Date().toISOString();
                
                mockTasks.push(newTask);
                localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
                
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(newTask)
                });
            }
        }
        
        // Tarefa específica
        if (taskId) {
            // Obter tarefa
            if (!options.method || options.method === 'GET') {
                const task = mockTasks.find(t => t.id === taskId);
                
                if (task) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(task)
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Tarefa não encontrada' })
                    });
                }
            }
            
            // Atualizar tarefa
            if (options.method === 'PUT') {
                const taskIndex = mockTasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    const updatedTask = JSON.parse(options.body);
                    mockTasks[taskIndex] = {
                        ...mockTasks[taskIndex],
                        ...updatedTask,
                        updatedAt: new Date().toISOString()
                    };
                    
                    localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
                    
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockTasks[taskIndex])
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Tarefa não encontrada' })
                    });
                }
            }
            
            // Atualizar parcialmente tarefa (ex: status)
            if (options.method === 'PATCH') {
                const taskIndex = mockTasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    const updates = JSON.parse(options.body);
                    mockTasks[taskIndex] = {
                        ...mockTasks[taskIndex],
                        ...updates,
                        updatedAt: new Date().toISOString()
                    };
                    
                    localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
                    
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockTasks[taskIndex])
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Tarefa não encontrada' })
                    });
                }
            }
            
            // Excluir tarefa
            if (options.method === 'DELETE') {
                const taskIndex = mockTasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    mockTasks.splice(taskIndex, 1);
                    localStorage.setItem('mockTasks', JSON.stringify(mockTasks));
                    
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ success: true })
                    });
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 404,
                        json: () => Promise.resolve({ error: 'Tarefa não encontrada' })
                    });
                }
            }
        }
    };
});
