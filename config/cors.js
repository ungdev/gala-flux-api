/**
 * This configuration file is automatically injected as options for Express cors
 * middleware. So take a look at https://github.com/expressjs/cors to find
 * available options
 *
 * Note that origin attribute is also used to configure socket.io
 */

module.exports = {
    origin: ['http://localhost:8080','http://localhost:8081','https://flux.uttnetgroup.fr','https://flux-dev.uttnetgroup.fr','https://bar.utt.fr'],
    allowedHeaders: ['Authorization','content-type'],
};
