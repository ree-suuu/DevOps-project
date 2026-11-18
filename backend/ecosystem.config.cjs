module.exports = {
  apps: [
    {
      name: 'klay-backend',
      script: 'server.js',
      cwd: '/var/www/app/backend',
      exec_mode: 'fork', // MUST be 'fork' on single-core t2.micro
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
}
