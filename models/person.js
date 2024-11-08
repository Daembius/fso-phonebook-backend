const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        unique: true  // This makes the name field unique
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function (v) {
                // This regex will:
                // 1. Match 2 or 3 digits at the start (^\\d{2,3})
                // 2. Followed by a hyphen (-)
                // 3. Followed by numbers (\\d+)
                // 4. And nothing else ($)
                return /^(\d{2,3})-(\d+)$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number! Phone number must be in format: XX-XXXXXX or XXX-XXXXX where X is a number`
        },
        required: [true, 'User phone number required']
    }
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)