module.exports = {
  apps: [{
    name: "etara",
    cwd: "/var/www/etara",
    script: "npm",
    args: "start",
    env_file: ".env",
    env: { NODE_ENV: "production", PORT: "3005" }
  }]
}
