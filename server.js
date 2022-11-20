const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const schema = require('./schema/schema')


const app = express()

// use the expressGraphQL with express app. Inside expressGraphQL({}) put some configuration
app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
}))

app.listen(4000, () => {
    console.log('Listening to port: 4000');
})