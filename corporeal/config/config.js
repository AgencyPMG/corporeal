module.exports = {
    corporeal: {
        admin: {
            baseUrl: '/corporeal-admin',
        },
        template: {
            baseUrl: '/d'
        },
        database: {
            host:'127.0.0.1',
            port:'27017',
            dbname:'corporeal'
        },
        sessionSecret: 'jg8vtg5JuYrK0VY',
        debug: true
    },
    redis: {
        port: 6379,
        host: '127.0.0.1'
    }
}
