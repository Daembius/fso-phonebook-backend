const express = require('express')
const morgan = require('morgan')

const app = express()

// Define a custom token named body, 
// which logs the request body in POST requests, 
// by converting it into a string using JSON.stringify()
morgan.token('body', (req) => JSON.stringify(req.body))

// Configure Morgan to use the 'tiny' format and append the request body 
// for POST requests.
// This tells Morgan to log the HTTP method, URL, 
// status code, content length, response time, and the custom body token.
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// alternative solution
// morgan.format('tiny-with-body', ':method :url :status :res[content-length] - :response-time ms :body')
// app.use(morgan('tiny-with-body'))

app.use(express.json())

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date.toString()}</p>
        `)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    let newId;
    do {
        newId = Math.floor(Math.random() * 1000000);
    } while (persons.find(person => person.id === newId));
    return newId;
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and number are required'
        })
    }

    const existingPerson = persons.find(person => person.name === body.name)
    if (existingPerson) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
