module.exports = {
    apps: [
        {
            name: 'safelyhands-app',
            script: 'backend/server.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 5000
            }
        }
    ]
};
