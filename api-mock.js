// api-mock.js - Simulação de API para desenvolvimento

(function() {
    // Verificar se já existe uma instância da API mock
    if (window.apiMockInitialized) return;
    
    console.log('Inicializando API mock...');
    
    // Inicializar dados de exemplo se não existirem
    if (!localStorage.getItem('mockTasks')) {
        initMockData();
    }
    
    // Interceptar requisições fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Verificar se é uma requisição para a API mock
        if (typeof url === 'string' && url.startsWith('/api/')) {
            return handleMockRequest(url, options);
        }
        
        // Caso contrário, usar o fetch original
        return originalFetch.apply(this, arguments);
    };
    
    // Marcar como inicializado
    window.apiMockInitialized = true;
    
    // Função para inicializar dados de exemplo
    function initMockData() {
        // Projetos de exemplo
        const projects = [
            {
                id: '1',
                name: 'Residencial Vila Verde',
                description: 'Condomínio residencial com 120 unidades',
                status: 'in-progress',
                startDate: '2023-01-15',
                endDate: '2024-06-30',
                budget: 15000000,
                createdAt: '2023-01-10T10:00:00Z',
                updatedAt: '2023-01-10T10:00:00Z'
            },
            {
                id: '2',
                name: 'Edifício Comercial Centro',
                description: 'Torre comercial com 18 andares',
                status: 'planning',
                startDate: '2023-04-01',
                endDate: '2025-03-31',
                budget: 22000000,
                createdAt: '2023-02-20T14:30:00Z',
                updatedAt: '2023-02-20T14:30:00Z'
            },
            {
                id: '3',
                name: 'Reforma Shopping Plaza',
                description: 'Reforma e ampliação de shopping center',
                status: 'todo',
                startDate: '2023-07-01',
                endDate: '2024-02-28',
                budget: 8500000,
                createdAt: '2023-03-15T09:15:00Z',
                updatedAt: '2023-03-15T09:15:00Z'
            }
        ];
        
        // Tarefas de exemplo
        const tasks = [
            {
                id: '1',
                title: 'Finalizar projeto arquitetônico',
                description: 'Revisar e finalizar o projeto arquitetônico com todas as alterações solicitadas pelo cliente.',
                status: 'todo',
                priority: 'high',
                projectId: '1',
                dueDate: '2023-04-15',
                createdAt: '2023-03-20T08:00:00Z',
                updatedAt: null
            },
            {
                id: '2',
                title: 'Obter licenças ambientais',
                description: 'Preparar documentação e solicitar licenças ambientais necessárias para início da obra.',
                status: 'in-progress',
                priority: 'urgent',
                projectId: '1',
                dueDate: '2023-04-10',
                createdAt: '2023-03-21T10:30:00Z',
                updatedAt: '2023-03-25T14:20:00Z'
            },
            {
                id: '3',
                title: 'Contratar equipe de terraplanagem',
                description: 'Selecionar e contratar empresa para serviços de terraplanagem.',
                status: 'done',
                priority: 'medium',
                projectId: '1',
                dueDate: '2023-03-30',
                createdAt: '2023-03-15T11:45:00Z',
                updatedAt: '2023-03-28T16:10:00Z'
            },
            {
                id: '4',
                title: 'Elaborar estudo de viabilidade',
                description: 'Realizar estudo de viabilidade econômica e técnica do projeto.',
                status: 'todo',
                priority: 'high',
                projectId: '2',
                dueDate: '2023-05-20',
                createdAt: '2023-03-22T09:15:00Z',
                updatedAt: null
            },
            {
                id: '5',
                title: 'Reunião com investidores',
                description: 'Preparar apresentação e realizar reunião com potenciais investidores.',
                status: 'todo',
                priority: 'medium',
                projectId: '2',
                dueDate: '2023-04-05',
                createdAt: '2023-03-23T13:20:00Z',
                updatedAt: null
            },
            {
                id: '6',
                title: 'Levantamento do local',
                description: 'Realizar levantamento topográfico e fotográfico do local da obra.',
                status: 'in-progress',
                priority: 'low',
                projectId: '3',
                dueDate: '2023-04-12',
                createdAt: '2023-03-24T10:00:00Z',
                updatedAt: '2023-03-26T11:30:00Z'
            }
        ];
        
            // Salvar dados
            localStorage.setItem('mockProjects', JSON.stringify(projects))
            localStorage.setItem('mockTasks', JSON.stringify(tasks))
        }
    
        // Função para lidar com requisições mock
        async function handleMockRequest(url, options = {}) {
            // Simular latência de rede
            await new Promise(resolve => setTimeout(resolve, 300))
        
            // Verificar autenticação
            const authHeader = options.headers?.Authorization
            if (url !== '/api/auth/login' && !authHeader) {
                return createResponse(401, { error: 'Não autorizado' })
            }
        
            // Extrair parâmetros da URL
            const urlParts = url.replace('/api/', '').split('/')
            const resource = urlParts[0]
            const id = urlParts[1]
            const method = options.method || 'GET'
        
            // Processar requisição com base no recurso
            switch (resource) {
                case 'tasks':
                    return handleTasksRequest(method, id, options)
                case 'projects':
                    return handleProjectsRequest(method, id, options)
                case 'auth':
                    return handleAuthRequest(method, urlParts[1], options)
                default:
                    return createResponse(404, { error: 'Recurso não encontrado' })
            }
        }
    
        // Lidar com requisições de tarefas
        function handleTasksRequest(method, id, options) {
            // Obter tarefas do localStorage
            const tasks = JSON.parse(localStorage.getItem('mockTasks') || '[]')
        
            switch (method) {
                case 'GET':
                    if (id) {
                        // Buscar tarefa específica
                        const task = tasks.find(t => t.id === id)
                        if (!task) {
                            return createResponse(404, { error: 'Tarefa não encontrada' })
                        }
                        return createResponse(200, task)
                    } else {
                        // Listar todas as tarefas
                        return createResponse(200, tasks)
                    }
            
                case 'POST':
                    // Criar nova tarefa
                    const newTask = JSON.parse(options.body || '{}')
                    newTask.id = String(Date.now())
                    newTask.createdAt = new Date().toISOString()
                    newTask.updatedAt = null
                
                    tasks.push(newTask)
                    localStorage.setItem('mockTasks', JSON.stringify(tasks))
                
                    return createResponse(201, newTask)
            
                case 'PUT':
                    // Atualizar tarefa existente
                    if (!id) {
                        return createResponse(400, { error: 'ID da tarefa não especificado' })
                    }
                
                    const taskIndex = tasks.findIndex(t => t.id === id)
                    if (taskIndex === -1) {
                        return createResponse(404, { error: 'Tarefa não encontrada' })
                    }
                
                    const updatedTask = JSON.parse(options.body || '{}')
                    updatedTask.id = id
                    updatedTask.createdAt = tasks[taskIndex].createdAt
                    updatedTask.updatedAt = new Date().toISOString()
                
                    tasks[taskIndex] = updatedTask
                    localStorage.setItem('mockTasks', JSON.stringify(tasks))
                
                    return createResponse(200, updatedTask)
            
                case 'PATCH':
                    // Atualizar parcialmente uma tarefa
                    if (!id) {
                        return createResponse(400, { error: 'ID da tarefa não especificado' })
                    }
                
                    const taskIdx = tasks.findIndex(t => t.id === id)
                    if (taskIdx === -1) {
                        return createResponse(404, { error: 'Tarefa não encontrada' })
                    }
                
                    const patchData = JSON.parse(options.body || '{}')
                    const patchedTask = { ...tasks[taskIdx], ...patchData }
                    patchedTask.updatedAt = new Date().toISOString()
                
                    tasks[taskIdx] = patchedTask
                    localStorage.setItem('mockTasks', JSON.stringify(tasks))
                
                    return createResponse(200, patchedTask)
            
                case 'DELETE':
                    // Excluir tarefa
                    if (!id) {
                        return createResponse(400, { error: 'ID da tarefa não especificado' })
                    }
                
                    const filteredTasks = tasks.filter(t => t.id !== id)
                    if (filteredTasks.length === tasks.length) {
                        return createResponse(404, { error: 'Tarefa não encontrada' })
                    }
                
                    localStorage.setItem('mockTasks', JSON.stringify(filteredTasks))
                
                    return createResponse(204)
            
                default:
                    return createResponse(405, { error: 'Método não permitido' })
            }
        }
    
        // Lidar com requisições de projetos
        function handleProjectsRequest(method, id, options) {
            // Obter projetos do localStorage
            const projects = JSON.parse(localStorage.getItem('mockProjects') || '[]')
        
            switch (method) {
                case 'GET':
                    if (id) {
                        // Buscar projeto específico
                        const project = projects.find(p => p.id === id)
                        if (!project) {
                            return createResponse(404, { error: 'Projeto não encontrado' })
                        }
                        return createResponse(200, project)
                    } else {
                        // Listar todos os projetos
                        return createResponse(200, projects)
                    }
            
                case 'POST':
                    // Criar novo projeto
                    const newProject = JSON.parse(options.body || '{}')
                    newProject.id = String(Date.now())
                    newProject.createdAt = new Date().toISOString()
                    newProject.updatedAt = null
                
                    projects.push(newProject)
                    localStorage.setItem('mockProjects', JSON.stringify(projects))
                
                    return createResponse(201, newProject)
            
                case 'PUT':
                    // Atualizar projeto existente
                    if (!id) {
                        return createResponse(400, { error: 'ID do projeto não especificado' })
                    }
                
                    const projectIndex = projects.findIndex(p => p.id === id)
                    if (projectIndex === -1) {
                        return createResponse(404, { error: 'Projeto não encontrado' })
                    }
                
                    const updatedProject = JSON.parse(options.body || '{}')
                    updatedProject.id = id
                    updatedProject.createdAt = projects[projectIndex].createdAt
                    updatedProject.updatedAt = new Date().toISOString()
                
                    projects[projectIndex] = updatedProject
                    localStorage.setItem('mockProjects', JSON.stringify(projects))
                
                    return createResponse(200, updatedProject)
            
                case 'DELETE':
                    // Excluir projeto
                    if (!id) {
                        return createResponse(400, { error: 'ID do projeto não especificado' })
                    }
                
                    const filteredProjects = projects.filter(p => p.id !== id)
                    if (filteredProjects.length === projects.length) {
                        return createResponse(404, { error: 'Projeto não encontrado' })
                    }
                
                    localStorage.setItem('mockProjects', JSON.stringify(filteredProjects))
                
                    return createResponse(204)
            
                default:
                    return createResponse(405, { error: 'Método não permitido' })
            }
        }
    
        // Lidar com requisições de autenticação
        function handleAuthRequest(method, endpoint, options) {
            if (endpoint === 'login' && method === 'POST') {
                const credentials = JSON.parse(options.body || '{}')
            
                // Verificar credenciais (simplificado para desenvolvimento)
                if (credentials.email === 'joao@exemplo.com' && credentials.password === 'senha123') {
                    return createResponse(200, {
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvYW8gU2lsdmEiLCJpYXQiOjE1MTYyMzkwMjJ9',
                        user: {
                            id: '1',
                            name: 'João Silva',
                            email: 'joao@exemplo.com',
                            role: 'admin'
                        }
                    })
                } else {
                    return createResponse(401, { error: 'Credenciais inválidas' })
                }
            }
        
            return createResponse(404, { error: 'Endpoint não encontrado' })
        }
    
        // Criar resposta mock
        function createResponse(status, body = null) {
            return Promise.resolve({
                ok: status >= 200 && status < 300,
                status,
                statusText: getStatusText(status),
                json: () => Promise.resolve(body),
                text: () => Promise.resolve(body ? JSON.stringify(body) : ''),
                headers: new Headers({ 'Content-Type': 'application/json' })
            })
        }
    
        // Obter texto do status HTTP
        function getStatusText(status) {
            const statusTexts = {
                200: 'OK',
                201: 'Created',
                204: 'No Content',
                400: 'Bad Request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Not Found',
                405: 'Method Not Allowed',
                500: 'Internal Server Error'
            }
        
            return statusTexts[status] || 'Unknown Status'
        }
    
        console.log('API mock inicializada com sucesso')
})()