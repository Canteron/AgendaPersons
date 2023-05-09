require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
// Crear un token personalizado que muestre el cuerpo de la solicitud si la solicitud es un POST
morgan.token('req-body', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

// Configurar Morgan para mostrar los registros en la consola
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.use(express.static('build'))
app.use(express.json())

app.post('/api/persons', (req, res) => {
  const body = req.body

  // Verificar si el nombre ya existe en la agenda
  Person.find({ name: body.name }).then(result => {
    if (result.length > 0) {
      return res.status(409).json({ 
        error: 'name must be unique' 
      })
    }

    // Verificar si faltan el nombre o el número
    if (!body.name || !body.number) {
      return res.status(400).json({ 
        error: 'name or number is missing' 
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })

    person.save().then(savedPerson => {
      res.json(savedPerson)
    }).catch(error => next(error))
  }).catch(error => next(error))
})


app.get('/info', (req, res) => {
  Person.countDocuments({})
    .then(count => {
      res.send(
        `<p>Phonebook has info for ${count} people</p>` +
        `<p>${new Date()}</p>`
      )
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persona => {
      response.json(persona)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndRemove(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.use((error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoError' && error.code === 11000) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  next(error)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})