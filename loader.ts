import axios from 'axios';

const faker = require('faker');

const client = axios.create({
    baseURL: 'https://tj0g9y3i11.execute-api.eu-west-1.amazonaws.com/prod',
    headers: {
        'origin': 'https://localhost:3000'
    }
})



const generateTournament = () => {
    const name = faker.name.firstName();
    const email = faker.internet.email(name);

    return {
        creatorEmail: email,
        creatorName: name,
        tournamentName: faker.address.cityName(),
        tournamentDate: faker.date.soon()
    }
}

const generatePlayer = () => {
    const name = faker.name.firstName();
    const email = faker.internet.email(name);

    return {
        name,
        email
    }
}

for(let t=0; t < 99; t++) {
    const tournament = generateTournament();
    client.post('/tournaments', tournament).then(response => {
        const tournamentId = response.data.id;
        const token = response.data.token;

        // subscribe players
        for(let p = 0; p < 15; p++) {
            const player = generatePlayer();
            client.post(`/tournament/${tournamentId}/subscriptions`, player).then(() => {})
        }

        // generate tournament
        client.post(`/tournament/${tournamentId}/schedule`, {
            numberOfRounds: 3,
            numberOfCourts: 5,
            gameType: 'double'
        }, {
            headers: {
                token: token
            }
        }).then(() => console.log('done')).catch(error => console.log(error));
    }).catch(error => console.log(error))
}