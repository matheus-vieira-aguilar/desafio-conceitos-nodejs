const express = require('express');
const { uuid, isUuid } = require('uuidv4');
const cors = require('cors');


//settings of the server:
const app = express();

// the application will always return json:
app.use(express.json())
app.use(cors());

/**
 * Esse exemplo irá deixar os arquivos salvos em memória:
 */
const repositories = [];

/**
 * Middlewares
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 */
function validateUuid(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ message : 'The id is invalid' });
    }

    return next();
}


function validateRepository(request, response, next) {
    
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    
    if (repositoryIndex == -1) {
        return response.status(400).json({ message : 'Repository was not found' });
    }
    
    request.params.repositoryIndex = repositoryIndex;
    console.log(request.params)
    return next();
}

app.use('/repositories/:id', validateUuid, validateRepository);

/**
 * Routes
 */
app.get('/repositories', (request, response) => {
    return response.json(repositories);
});

app.post('/repositories', (request, response) => {

    const { title, url, techs } = request.body;

    const repository = { 
        id : uuid(),
        title,
        url,
        techs,
        likes: 0
    };

    repositories.push(repository);

    return response
        .status(201)
        .json(repository);
});

app.put('/repositories/:id', (request, response) => {
    const { title, url, techs } = request.body;
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    const repository = { ...repositories[repositoryIndex] , title, url, techs };
    repositories[repositoryIndex] = repository;
    
    return response
        .status(200)
        .json(repository);    
})

app.delete('/repositories/:id', (request, response) => {
    const { repositoryIndex } = request.params;
    
    repositories.splice(repositoryIndex);

    return response.status(204).json();
})

app.post('/repositories/:id/like', validateUuid, validateRepository, (request, response) => {
    const { repositoryIndex } = request.params;
    
    repositories[repositoryIndex].likes++;
    
    return response.status(201).json({
        likes: repositories[repositoryIndex].likes
    })
})

module.exports = app;