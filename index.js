//*** IMPORTS ***//
const express = require('express')
const app = express()
// Load environment variables from .env file
require('dotenv').config();
const Person = require('./models/person')
const cors = require('cors');
const morgan = require('morgan')

//*** MIDDLEWARE ***//
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

// Morgan setup
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//*** ROUTES ***//

// GET routes
// Display info of all the people
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// Display person info by id
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {

      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const date = new Date()
  Person.countDocuments({})
    .then(count => {
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${date.toString()}</p>
      `)
    })
    .catch(error => next(error))
})

// DELETE route
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// POST route
// Create person entry
app.post('/api/persons', (request, response, next) => {
  const body = request.body

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
      response.json(savedPerson)
    })
    .catch(error => {
      // Check if this is a duplicate key error
      if (error.code === 11000) { // MongoDB's error code for duplicate key
        return response.status(400).json({
          error: "name must be unique"
        })
      }
      // Pass any other errors to the error handling middleware
      next(error)
    })
})

// PUT route
// Update the phone number of an existing entry
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

//*** ERROR HANDLING ***//
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })

  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// Apply error handling middleware
app.use(unknownEndpoint)  // Handle unknown endpoints
app.use(errorHandler)      // Handle errors

//*** SERVER ***//
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})