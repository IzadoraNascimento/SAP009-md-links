const fs = require('fs'); // fs = File System (ficheiro do node.js)
const path = require('path');
const chalk = require('chalk');
//const fetch = require('node-fetch');

function mdLinks(pathFile, options = {}) {
  /* Promise: define uma ação que vai ser
    executada no futuro, ou seja, ela pode ser
    resolvida (resolve) ou rejeitada (reject). */
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(pathFile);
    const fileExists = fs.existsSync(pathFile); // existsSync = verifica se um arquivo existe ou não
    const fileSize = fs.statSync(pathFile).size; // statSync = retorna informações síncronas sobre o caminho do arquivo

    if (!fileExists || fileSize === 0) {
      reject(new Error(chalk.red('\u2717') + ' ' + `O arquivo: ${chalk.red(pathFile)} está vazio ou não existe.`));
    } else {
      fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          const regex = /\[(.*?)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/g; // usada para extrair ou substituir porções de texto, endereço ou link etc
          const searchLinks = Array.from(data.matchAll(regex)) || [];

          const extractLinks = searchLinks.map(link => {
            return {
              href: link[2],
              text: link[1],
              file: absolutePath,
            };
          });

          if (options.validate){
            const fetchRequests = extractLinks.map((link) =>{
              return fetch(link.href)
              .then((response) => {
                link.status = response.status;
                link.statusText = response.statusText;
                return link;
              })
              .catch((error) => {
                link.status = error.code || 'FAIL';
                link.statusText = error.message;
                return link;
              });
            });

            Promise.all(fetchRequests)
            .then((result) => {
              if(options.stats){
                const uniqueLinks = [...new Set(result.map((link) => link.href))];
                const stats = {
                  total: result.length,
                  unique: uniqueLinks.length,
                  broken: result.filter((link) => link.status !== 200).length,
                };
                resolve(stats);
              } else {
                resolve(result);
              }
            })
            .catch((error)=> {
              reject(error);
            });
          } else if (options.validateAndStats) {
            const fetchRequests = extractLinks.map((link) => {
              return fetch(link.href)
                .then((response) =>{
                  link.status = response.status;
                  link.statusText = response.statusText;
                  return link;
                })
                .catch((error) => {
                  link.status = error.code || 'FAIL';
                  link.statusText = error.message;
                  return link;
                });
              });

              Promise.all(fetchRequests)
              .then((result) => {
                const uniqueLinks = [... new Set(result.map((link) => link.href))];
                const stats = {
                  total: result.length,
                  unique: uniqueLinks.length,
                  broken: result.filter((link) => link.status !== 200).lenght,
                };
                resolve(stats);
              })
              .catch((error) => {
                reject(error);
              });
          }else{
            if (options.stats){
              const uniqueLinks = [...new Set(extractLinks.map((link) => link.href))];
              const stats = {
                total: extractLinks.length,
                unique: uniqueLinks.length,
              };
              resolve(stats);
            } else{
              resolve(extractLinks);
            }
          }
        }
      });
    }
  });
}
module.exports = mdLinks;









































































/*const fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch')

function mdLinks(pathFile) {
  return new Promise((resolve, reject) => {
    const fileExists = fs.existsSync(pathFile);
    const fileSize = fs.statSync(pathFile).size;

    if (!fileExists || fileSize === 0) {
      reject(chalk.red('\u2717') + ' ' + `O arquivo: ${chalk.red(pathFile)} está vazio ou não existe.`);
    } else {
      fs.readFile(pathFile, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          const regex = /\[([^[\]]*?)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/gm;
          const searchLinks = data.match(regex);

          const extraiLinks = searchLinks.map(link => {
            const removeItens = link.replace(/.$/, '').replace('[', '');
            const split = removeItens.split('](');
            const newObj = {
              href: split[1],
              text: split[0],
              file: pathFile,
            };
            return newObj;
          });
          resolve(extraiLinks);
        }
      });
    }
  });
}
module.exports = mdLinks;*/