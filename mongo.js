const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> <name> <number>')
  process.exit(1)
}

// Define arguments to add entries in CLI
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

// Database URL with 'phonebookApp' as the database name
const url = `mongodb+srv://jumay:${password}@cluster0.qif4b.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name && number) {
  // If name and number are provided, save a new entry
  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  // If no name and number are provided, list all entries in the phonebook
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
