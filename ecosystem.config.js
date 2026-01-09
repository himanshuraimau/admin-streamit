module.exports = {
    apps: [
        {
            name: 'streamit-backend',
            cwd: '/home/ubuntu/streamit-admin/admin-backend',
            script: 'bun',
            args: 'run index.ts',
            interpreter: 'none',
            env: {
                NODE_ENV: 'production',
                PORT: 4000
            },
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            error_file: '/home/ubuntu/logs/backend-error.log',
            out_file: '/home/ubuntu/logs/backend-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            // Restart on crash
            min_uptime: '10s',
            max_restarts: 10,
            // Environment-specific settings
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ]
};
