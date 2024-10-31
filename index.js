// Load environment variables from .env file
require('dotenv').config();

const Person = require('./models/person')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const person = require('./models/person');

const app = express()

app.use(cors())

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
app.use(express.static('dist'))

const password = process.argv[2]

// Handler to display info of all the people
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// Handler to display person info by id
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
      .then(person => {
  
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
  
      .catch(error => {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
      })
  })

app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date.toString()}</p>
        `)
})

// Delete a person by id
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

// create person entry
app.post('/api/persons', (request, response) => {
    console.log('POST /api/persons route hit')
    const body = request.body
    console.log('Received POST request with body:', body) 

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "name and number are required"
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            console.log('Person saved successfully:', savedPerson)
            response.json(savedPerson)
        })
        .catch(error => {
            console.log('Error saving person:', error)
            // Check if this is a duplicate key error
            if (error.code === 11000) { // MongoDB's error code for duplicate key
                return response.status(400).json({
                    error: "name must be unique"
                })
            }
            // Handle other potential errors
            response.status(500).json({ error: 'somehting went wrong' })
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})