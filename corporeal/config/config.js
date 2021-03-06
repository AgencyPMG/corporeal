module.exports = {
    corporeal: {
        whitelabel: {
            name: 'Corporeal'
        },
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
        uploads: {
            dir: __dirname + '/public/uploads/',
            cdnhost: '',
            baseUrl: '/uploads'
        },
        sessionSecret: 'jg8vtg5JuYrK0VY',
        debug: true,
        templates: [],
        whitelistedGoogleAppDomains: [],
        cacheTimeout: 60000
    },
    redis: {
        port: 6379,
        host: '127.0.0.1'
    }
}
