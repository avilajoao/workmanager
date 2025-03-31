// API Mock para desenvolvimento
class ApiMock {
    constructor() {
        // Inicializar dados de exemplo se necessário
        this.initializeData();
        
        // Interceptar requisições fetch
        this.setupFetchInterceptor();
    }
    
    // Inicializar dados de exemplo
    initializeData() {
        if (!localStorage.getItem('dataInitialized')) {
            // Carregar script de inicialização
            const script = document.createElement('script');
            script.src = 'init-data.js';
            document.head.appendChild(script);
        }
    }
    
    // Configurar interceptador de fetch
    setupFetchInterceptor() {
        const originalFetch = window.fetch;
        const self = this;
        
        window.fetch = function(url, options = {}) {
            // Verificar se é uma requisição para a API
            if (url.startsWith('/api/')) {
                return self.handleApiRequest(url, options);
            }
            
            // Caso contrário, usar fetch original
            return originalFetch.apply(this, arguments);
        };
        
        console.log('[API Mock] Interceptador de fetch configurado');
    }
    
    // Manipular requisição para a API
    handleApiRequest(url, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;
        
        console.log(`[API Mock] ${method} ${url}`, body);
        
        // Simular latência de rede
        return new Promise(resolve => {
            setTimeout(() => {
                // Rotear para o manipulador apropriado
                let response;
                
                if (url.startsWith('/api/auth/')) {
                    response = this.handleAuthRoutes(url, method, body);
                } else if (url.startsWith('/api/tasks')) {
                    response = this.handleTaskRoutes(url, method, body);
                } else if (url.startsWith('/api/projects')) {
                    response = this.handleProjectRoutes(url, method, body);
                } else if (url.startsWith('/api/users')) {
                    response = this.handleUserRoutes(url, method, body, options);
                } else {
                    response = this.createResponse(404, { message: 'Rota não encontrada' });
                }
                
                resolve(response);
            }, 300); // Simular 300ms de latência
        });
    }
    
    // Criar resposta simulada
    createResponse(status, body = null) {
        return new Response(body ? JSON.stringify(body) : null, {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // Manipular rotas de autenticação
    handleAuthRoutes(url, method, body) {
        // Login
        if (url === '/api/auth/login' && method === 'POST') {
            return this.handleLogin(body);
        }
        
        // Registro
        if (url === '/api/auth/register' && method === 'POST') {
            return this.handleRegister(body);
        }
        
        // Renovação de token
        if (url === '/api/auth/refresh' && method === 'POST') {
            return this.handleRefreshToken();
        }
        
        return this.createResponse(404, { message: 'Rota de autenticação não encontrada' });
    }
    
    // Manipular login
    handleLogin(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
            return this.createResponse(400, { message: 'Email e senha são obrigatórios' });
        }
        
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const user = users.find(u => u.email === credentials.email);
        
        if (!user || user.password !== credentials.password) {
            return this.createResponse(401, { message: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT simulado
        const token = this.generateToken(user);
        
        // Data de expiração (24 horas)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Remover senha do objeto de usuário
        const { password, ...userWithoutPassword } = user;
        
        return this.createResponse(200, {
            token,
            user: userWithoutPassword,
            expiresAt
        });
    }
    
    // Manipular registro
    handleRegister(userData) {
        if (!userData || !userData.name || !userData.email || !userData.password) {
            return this.createResponse(400, { message: 'Nome, email e senha são obrigatórios' });
        }
        
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        
        // Verificar se o email já está em uso
        if (users.some(u => u.email === userData.email)) {
            return this.createResponse(400, { message: 'Este email já está em uso' });
        }
        
        // Criar novo usuário
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'user', // Novos usuários são sempre 'user'
            createdAt: new Date().toISOString()
        };
        
        // Adicionar à lista de usuários
        users.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(users));
        
        // Gerar token JWT simulado
        const token = this.generateToken(newUser);
        
        // Data de expiração (24 horas)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        // Remover senha do objeto de usuário
        const { password, ...userWithoutPassword } = newUser;
        
        return this.createResponse(201, {
            token,
            user: userWithoutPassword,
            expiresAt
        });
    }
    
    // Manipular renovação de token
    handleRefreshToken() {
        // Na implementação real, verificaríamos o token atual
        // e emitiríamos um novo token se válido
        
        // Para simplificar, apenas emitimos um novo token com validade estendida
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        return this.createResponse(200, {
            token: 'refreshed-token-' + Date.now(),
            expiresAt
        });
    }
    
    // Gerar token JWT simulado
    generateToken(user) {
        // Em uma implementação real, usaríamos uma biblioteca JWT
        // Aqui, apenas simulamos um token
        
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
        }));
        const signature = btoa('mock-signature');
        
        return `${header}.${payload}.${signature}`;
    }
    
    // Manipular rotas de tarefas
    handleTaskRoutes(url, method, body) {
        // Obter todas as tarefas
        if (url === '/api/tasks' && method === 'GET') {
            const tasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
            return this.createResponse(200, tasks);
        }
        
        // Criar nova tarefa
        if (url === '/api/tasks' && method === 'POST') {
            return this.createTask(body);
        }
        
        // Extrair ID da tarefa da URL
        const taskIdMatch = url.match(/\/api\/tasks\/([^\/]+)$/);
        if (taskIdMatch) {
            const taskId = taskIdMatch[1];
            
            // Obter tarefa específica
            if (method === 'GET') {
                return this.getTaskById(taskId);
            }
            
            // Atualizar tarefa
            if (method === 'PUT') {
                return this.updateTask(taskId, body);
            }
            
            // Atualizar parcialmente tarefa
            if (method === 'PATCH') {
                return this.patchTask(taskId, body);
            }
            
            // Excluir tarefa
            if (method === 'DELETE') {
                return this.deleteTask(taskId);
            }
        }
        
        return this.createResponse(404, { message: 'Rota de tarefas não encontrada' });
    }
    
    // Obter tarefa por ID
    getTaskById(taskId) {
        const tasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
            return this.createResponse(404, { message: 'Tarefa não encontrada' });
        }
        
        return this.createResponse(200, task);
    }
    
    // Criar nova tarefa
    createTask(taskData) {
        const tasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
        
        // Validar dados
        if (!taskData || !taskData.title || !taskData.description || !taskData.status || !taskData.priority || !taskData.projectId || !taskData.assigneeId || !taskData.dueDate) {
            return this.createResponse(400, { message: 'Dados incompletos' });
        }
        
        // Criar nova tarefa
        const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            projectId: taskData.projectId,
            assigneeId: taskData.assigneeId,
            dueDate: taskData.dueDate,
            createdAt: new Date().toISOString()
        };
        
        // Adicionar à lista de tarefas
        tasks.push(newTask);
        localStorage.setItem('mockTasks', JSON.stringify(tasks));
        
        return this.createResponse(201, newTask);
    }
    
    // Manipular rotas de projetos
    handleProjectRoutes(url, method, body) {
        // Obter todos os projetos
        if (url === '/api/projects' && method === 'GET') {
            const projects = JSON.parse(localStorage.getItem('mockProjects') || '[]');
            return this.createResponse(200, projects);
        }
        
        // Criar novo projeto
        if (url === '/api/projects' && method === 'POST') {
            return this.createProject(body);
        }
        
        // Extrair ID do projeto da URL
        const projectIdMatch = url.match(/\/api\/projects\/([^\/]+)$/);
        if (projectIdMatch) {
            const projectId = projectIdMatch[1];
            
            // Obter projeto específico
            if (method === 'GET') {
                return this.getProjectById(projectId);
            }
            
            // Atualizar projeto
            if (method === 'PUT') {
                return this.updateProject(projectId, body);
            }
            
            // Excluir projeto
            if (method === 'DELETE') {
                return this.deleteProject(projectId);
            }
            
            // Obter tarefas do projeto
            if (url.endsWith('/tasks') && method === 'GET') {
                return this.getProjectTasks(projectId);
            }
        }
        
        return this.createResponse(404, { message: 'Rota de projetos não encontrada' });
    }
    
    // Obter projeto por ID
    getProjectById(projectId) {
        const projects = JSON.parse(localStorage.getItem('mockProjects') || '[]');
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
            return this.createResponse(404, { message: 'Projeto não encontrado' });
        }
        
        return this.createResponse(200, project);
    }
