// api-mock.js - Simulação de API para desenvolvimento
(function() {
    console.log('Inicializando API mock');
    
    // Interceptar chamadas fetch
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options = {}) {
        console.log(`API Mock: Interceptando chamada para ${url}`, options);
        
        // Verificar se é uma chamada para nossa API
        if (typeof url === 'string' && url.startsWith('/api/')) {
            return handleApiRequest(url, options);
        }
        
        // Caso contrário, usar o fetch original
        return originalFetch(url, options);
    };
    
    // Manipular requisições para a API
    async function handleApiRequest(url, options) {
        // Simular latência de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log(`API Mock: Processando requisição para ${url}`);
        
        // Rotas da API
        if (url === '/api/projects' && (!options.method || options.method === 'GET')) {
            return getProjects();
        } else if (url === '/api/projects' && options.method === 'POST') {
            return createProject(options.body);
        } else if (url.match(/\/api\/projects\/\d+$/) && (!options.method || options.method === 'GET')) {
            const id = parseInt(url.split('/').pop());
            return getProjectById(id);
        } else if (url.match(/\/api\/projects\/\d+$/) && options.method === 'PUT') {
            const id = parseInt(url.split('/').pop());
            return updateProject(id, options.body);
        } else if (url.match(/\/api\/projects\/\d+$/) && options.method === 'DELETE') {
            const id = parseInt(url.split('/').pop());
            return deleteProject(id);
        }
        
        // Rota não encontrada
        console.warn(`API Mock: Rota não encontrada - ${url}`);
        return createResponse(404, { error: 'Rota não encontrada' });
    }
    
    // Criar resposta simulada
    function createResponse(status, data) {
        console.log(`API Mock: Retornando resposta com status ${status}`, data);
        return Promise.resolve({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(data)
        });
    }
    
    // Obter projetos
    function getProjects() {
        try {
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            console.log('API Mock: Retornando projetos', projects);
            return createResponse(200, projects);
        } catch (error) {
            console.error('API Mock: Erro ao obter projetos', error);
            return createResponse(500, { error: 'Erro interno do servidor' });
        }
    }
    
    // Obter projeto por ID
    function getProjectById(id) {
        try {
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            const project = projects.find(p => p.id === id);
            
            if (!project) {
                console.warn(`API Mock: Projeto com ID ${id} não encontrado`);
                return createResponse(404, { error: 'Projeto não encontrado' });
            }
            
            console.log(`API Mock: Retornando projeto com ID ${id}`, project);
            return createResponse(200, project);
        } catch (error) {
            console.error(`API Mock: Erro ao obter projeto com ID ${id}`, error);
            return createResponse(500, { error: 'Erro interno do servidor' });
        }
    }
    
    // Criar projeto
    function createProject(body) {
        try {
            const projectData = typeof body === 'string' ? JSON.parse(body) : body;
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            
            // Gerar ID (maior ID + 1)
            const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0;
            const newId = maxId + 1;
            
            // Criar novo projeto
            const newProject = {
                id: newId,
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Adicionar à lista
            projects.push(newProject);
            localStorage.setItem('projects', JSON.stringify(projects));
            
            console.log('API Mock: Projeto criado com sucesso', newProject);
            return createResponse(201, newProject);
        } catch (error) {
            console.error('API Mock: Erro ao criar projeto', error);
            return createResponse(500, { error: 'Erro interno do servidor' });
        }
    }
    
    // Atualizar projeto
    function updateProject(id, body) {
        try {
            const projectData = typeof body === 'string' ? JSON.parse(body) : body;
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            
            // Encontrar índice do projeto
            const index = projects.findIndex(p => p.id === id);
            
            if (index === -1) {
                console.warn(`API Mock: Projeto com ID ${id} não encontrado para atualização`);
                return createResponse(404, { error: 'Projeto não encontrado' });
            }
            
            // Atualizar projeto
            const updatedProject = {
                ...projects[index],
                ...projectData,
                id, // Garantir que o ID não mude
                updatedAt: new Date().toISOString()
            };
            
            projects[index] = updatedProject;
            localStorage.setItem('projects', JSON.stringify(projects));
            
            console.log(`API Mock: Projeto com ID ${id} atualizado com sucesso`, updatedProject);
            return createResponse(200, updatedProject);
        } catch (error) {
            console.error(`API Mock: Erro ao atualizar projeto com ID ${id}`, error);
            return createResponse(500, { error: 'Erro interno do servidor' });
        }
    }
    
    // Excluir projeto
    function deleteProject(id) {
        try {
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            
            // Encontrar índice do projeto
            const index = projects.findIndex(p => p.id === id);
            
            if (index === -1) {
                console.warn(`API Mock: Projeto com ID ${id} não encontrado para exclusão`);
                return createResponse(404, { error: 'Projeto não encontrado' });
            }
            
            // Remover projeto
            projects.splice(index, 1);
            localStorage.setItem('projects', JSON.stringify(projects));
            
            console.log(`API Mock: Projeto com ID ${id} excluído com sucesso`);
            return createResponse(204, null);
        } catch (error) {
            console.error(`API Mock: Erro ao excluir projeto com ID ${id}`, error);
            return createResponse(500, { error: 'Erro interno do servidor' });
        }
    }
    
    // Forçar reinicialização dos dados para desenvolvimento
    function resetData() {
        localStorage.removeItem('dataInitialized');
        localStorage.removeItem('projects');
        
        // Recarregar a página para reinicializar os dados
        window.location.reload();
    }
    
    // Expor função de reset para desenvolvimento
    window.resetApiData = resetData;
    
    console.log('API mock inicializada com sucesso');
})();
