const validUser = {
    username: 'testuser',
    email: 'test@test.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
}

const exempleUser = {
    username: 'XxXDarkKnight64XxX',
    email: 'dark.knight@gmail.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
}


const userMock1 = {
    username: 'Zaza64',
    email: 'zaza.ma@gmail.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
}

const movieUser = {
    username: 'adminera64',
    email: 'admin@gmail.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
}

const favouritesUser = {
    username: 'fan',
    email: 'fan@gmail.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
}

const recMovieListUser = {
    username: 'amateurDeFilm',
    email: 'amateurDeFilm@gmail.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
};

const privateMockList = {
    title: 'Hidden list',
    description: 'Best list ever',
    isPublic: false
};

const publicMockList = {
    title: 'Top 1%',
    description: 'Surgeon Law everything good',
    isPublic: true
};


const likeListUser = {
    username: 'kiffeurDeFilm',
    email: 'kiff@gmail.com',
    password: 'Strongpassword1!',
    hashedPassword: '$2a$10$GFL9aZkO6neJtqOPJzmFAuErCITFjhpwBwev.FFKxRdYe24n0lhVW', // Strongpassword1!
};

module.exports = { 
    validUser, 
    exempleUser, userMock1,
    movieUser,
    favouritesUser,
    recMovieListUser,
    privateMockList,
    publicMockList,
    likeListUser,
};