const axios = require('axios')
const Dev = require('../models/Devs')
const parseStringAsArray = require('../utils/parseStringAsArray')
const {findConnections, senMessage} = require('../websocket')

module.exports = {
    async index(request, response){
        const devs = await Dev.find();
        return response.json(devs)
    },

    async update(request, response){
        const {github_username, techs, latitude, longitude, bio} = request.body
        const update = {
            techs: parseStringAsArray(techs),
            bio: bio,
            location: {
                type: 'Point',
                coordinates: [longitude,latitude]
            }
        }
        const dev = await Dev.findOneAndUpdate({github_username}, update, {new: true})

        return response.json({dev})
    },

    async store(request, response){
        const {github_username, techs, latitude, longitude} = request.body

        let dev = await Dev.findOne({github_username})

        if(!dev){

            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`)
            const {name = login, avatar_url, bio } = apiResponse.data
            const techsArray = parseStringAsArray(techs)
        
            const location ={
                type: 'Point',
                coordinates: [longitude,latitude],
            }
        
             dev = await Dev.create({
                name,
                github_username,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            })

            const sendSocketMessageTo = findConnections(
                {latitude, longitude},
                techsArray,
            )

            senMessage(sendSocketMessageTo,'new-dev', dev)
        }

        return response.json(dev)
    }
}