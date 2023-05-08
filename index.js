const express = require('express')
const morgan = require('morgan')
const app = express()

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

// const unknownEndpoint = (request, response) => {
//   response.status(404).send({ error: 'unknown endpoint' })
// }

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-015112"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44516484"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "154-15-515"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-642122"
  },
  {
    id: 5,
    name: "a borrar",
    number: "11518"
  }
]



app.post('/api/persons', (req, res) => {
  const body = req.body

   // Verificar si el nombre ya existe en la agenda
  const existingPerson = persons.find(person => person.name === body.name)
  if (existingPerson) {
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

  // Crear una nueva entrada y agregarla a la agenda
  const person = {
    id: Math.floor(Math.random() * 100000),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)

  // Responder con la nueva entrada de la agenda
  res.json(person)
})

app.get('/info', (req, res) => {
  const date = new Date()
  const totalPersons = persons.length
  const message = `La agenda telefónica tiene ${totalPersons} entradas.`
  const time = `La solicitud se recibió en ${date}.`
  res.send(`${message}<br>${time}`)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(note => note.id !== id)

  response.status(204).end()
})

// app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})