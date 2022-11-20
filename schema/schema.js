const graphql = require('graphql');
// const _ = require('lodash')
const axios = require('axios')

// destructure graphQL
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList
} = graphql


// some hardcode users
// const users = [
//     {id: "23", firstName: 'Samantha', age: 21},
//     {id: "24", firstName: 'Accord', age: 28},
// ]

const companyType = new GraphQLObjectType({
    name: 'Company',
    // this arrow function and first bracket creates a closure that makes it possible to get access to the UserType below 
    // Giving the fields object an arrow function which returns an object with id, name, description, etc. With the way closure in JS works that means the arrow function gets defined but not gets executed until after the entire file has been executed. So the entire file get executed, that will define the CompanyType & the UserType then graphQL internally will execute the arrow function and the UserType will be in the closure scope of the arrow function. That means everything will be correctly defined as we would expect 
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            // As the data will be a list of data, the "UserType" needs to be wrapped by GraphQLList 
            type: new GraphQLList(UserType),
            // No need of defining any args here to find out what set of users 
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data)
            }
        }
    })
})

// Create a user type/define a data. Give it name & fields, put list of data & their types inside fields
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            // "GraphQLString" is a built in type whereas "companyType" is our created type but both are created equally in GraphQL
            type: companyType,
            resolve(parentValue, args) {
                console.log(parentValue, args);
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        }
    })
})

// Create RootQuery 
// Root Query is a graphQL Object Type. just like the user & it will have the same properties: name, fields
// The purpose of RootQuery is to allow graphQL to jump & land on a very specific node on the graph of all of our data
// Everything that we have added in the schema.js file tells us what our data looks like. The resolve function's purpose it to actually go and reach out and grab that data
const RootQuery = new GraphQLObjectType({
    // The purpose of root query type is to take the query & enter into the graph of data 
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                // return _.find(users, {id: args.id})
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(resp => resp.data)
            }
        },
        company: {
            type: companyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(res => res.data)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})