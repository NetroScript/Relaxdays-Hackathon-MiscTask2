const glob = require("glob")
const fs = require('fs')
const { generate } = require('@remusao/smaz-generate');

const promises = [];

const data = {};

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}


console.log("Started fetching files")

glob("./referencefiles/**/Dockerfile", function (er, files) {

    console.log("Got all files, start reading files. (" + files.length + ")")

    files.forEach(file => {
        promises.push(new Promise((resolve, reject) =>

            fs.readFile(file, 'utf8', (err, file_content) => {
                if(err == null){
                    data[file] = file_content;
                    resolve();
                } else {
                    resolve();
                }
            })

        ))
    })


    Promise.all(promises).then(() => {

        console.log("Finished reading all files. We now seperate stuff into lines.")
        console.log("Additionally because we don't need them we strip empty lines and comments.")
        console.log("Last step is extracting words using common symbols (space, /, ., \)")

        const lines = [];
        Object.values(data).forEach(allLines => {
            lines.push(...allLines.split("\n").filter(line => {
                if (line.trim().length === 0){
                    return false
                }

                if (line.trim()[0] === "#")
                    return false;

                if (line.trim().toUpperCase().startsWith("MAINTAINER"))
                    return false;

                return true;
            }).map(line => line += "\n"))
        })

        const words = [];

        lines.forEach(line => {
            words.push(...line.split(/ |\.|\\|_|=|\/|-/).filter(word => {
                // It is also unlikely that normal docker files have strings over 28 chars in length which are common
                // so we filter them out, also we dont need empty strings
                return word.length <= 28 && word.trim().length !== 0
            }).map(word => word.trim()));
        })

        console.log("Filtered Lines: " + lines.length + " - Filtered Words: " + words.length);

        console.log("Start generating Cookbook.")
        // Sample the dockerfiles because JavaScript seems to run out of available Map Ids
        const subset = getRandomSubarray(lines, lines.length/3);
        //const codebook = generate(subset);
        const codebook = generate(words);



        console.log("Done - Codebook is:")

        console.log(codebook);



        /* This outputs with the demo data:

        Following Repos were used

        * https://github.com/linux-on-ibm-z/dockerfile-examples
        * https://github.com/oracle/docker-images
        * https://github.com/komljen/dockerfile-examples
        * https://github.com/jessfraz/dockerfiles
        * https://github.com/projectatomic/docker-image-examples
        * https://github.com/StefanScherer/dockerfiles-windows
        * https://github.com/kstaken/dockerfile-examples
        * https://github.com/mritd/dockerfile
        * https://github.com/webdevops/Dockerfile
        * https://github.com/vimagick/dockerfiles
        * https://github.com/CentOS/CentOS-Dockerfiles
        * https://github.com/HariSekhon/Dockerfiles
        * https://github.com/zabbix/zabbix-docker
        * https://github.com/tianon/dockerfiles
        * https://github.com/schickling/dockerfiles

        [
          "install",
          "VERSION",
          "oracle",
          "opencontainers",
          "docker",
          "baselayout",
          "ENTRYPOINT",
          "zabbix",
          "https:",
          "entrypoint",
          "blackfire",
          "webdevops",
          "maintainer",
          "certificates",
          "download",
          "\"$ErrorActionPreference",
          "server",
          "&&",
          "githubusercontent",
          "bootstrap",
          "SecurityProtocolType]::Tls12",
          "WORKDIR",
          "conf",
          "local",
          "'SilentlyContinue';\"]",
          "github",
          "release",
          "container",
          "INSTALL",
          "update",
          "in",
          "HOME",
          "lib",
          "$ProgressPreference",
          "ORACLE",
          "EXPOSE",
          "RUN",
          "FROM",
          "apache",
          "recommends",
          "supervisor",
          "mkdir",
          "python",
          "usr",
          "APPLICATION",
          "SOURCE",
          "build",
          "clean",
          "service",
          "et",
          "DOCUMENT",
          "enable",
          "centos:centos",
          "COPY",
          "elasticsearch",
          "chmod",
          "cache",
          "script",
          "com",
          "ENV",
          "r",
          "apt",
          "ar",
          "system",
          "postgresql",
          "image",
          "DOMAIN",
          "PATH",
          "x",
          "properties",
          "patch",
          "7",
          "dev",
          "ubuntu",
          "php",
          ")",
          "module",
          "sentry",
          "er",
          "LABEL",
          "packages",
          "chown",
          "u01",
          "st",
          "y",
          ";",
          "curl",
          "export",
          "en",
          "FILE",
          "VOLUME",
          "echo",
          "source",
          "sh",
          "responseFile",
          "SCRIPT",
          "8",
          "on",
          "debian",
          "microsoft",
          "9",
          "make",
          "mysql",
          "i",
          "http",
          "PATCH",
          "USER",
          "re",
          "DIR",
          "yum",
          "root",
          "SOCKET",
          "it",
          "${SENTRY",
          "Frazelle",
          "s390x",
          "opt",
          "${",
          "or",
          "TIMEOUT",
          "$",
          "\"$(mktemp",
          "gosu",
          "zip",
          "add",
          "at",
          "FRONTEND",
          "file",
          "'",
          "DOWNLOAD",
          "base",
          "default",
          "tools",
          "WEB",
          "SERVER",
          "PORT",
          "u",
          "6",
          "UseBasicP",
          "java",
          "}",
          "CMD",
          "<jess@l",
          "\"Zabbix",
          "BASE",
          "(",
          "al",
          "group",
          "MANAGED",
          "ap",
          "*",
          "tmp",
          "key",
          ">",
          "CUSTOM",
          "an",
          "5",
          "chive",
          "ADMIN",
          "ROOT",
          "1",
          "WebReque",
          "de",
          "run",
          "k",
          "NAME",
          "amd64",
          "4",
          "li",
          "z",
          "ruby",
          "BINARIES",
          "b",
          "active",
          "rm",
          "home",
          "solr",
          "es",
          "utils",
          "\"$GNUPG",
          "LIBRARY",
          "n",
          ":",
          "0",
          "2",
          "OutFile",
          "c",
          "auto",
          "PATTERN",
          "ch",
          "e",
          "CONFIG",
          "src",
          "from",
          "pro",
          "j",
          "ARG",
          "SUFFIX",
          "l",
          "SETUP",
          "ssl",
          "t",
          "DEBIAN",
          "no",
          "00",
          "|",
          "o",
          "[\"",
          "ux",
          "f",
          "DOCKER",
          "el",
          "INDEX",
          "ALIAS",
          "log",
          "q",
          "\"]",
          "sed",
          "g",
          "3",
          "PKG",
          "ame",
          "si",
          "di",
          "\",",
          "ZBX",
          "h",
          "p",
          "PHP",
          "ma",
          "JAVA",
          "dows",
          "ex",
          "+",
          "rf",
          "GRID",
          "as",
          "op",
          "m",
          "ADD",
          "www",
          "s",
          "pip",
          "w",
          "move",
          "v",
          "gpg",
          "d",
          "up",
          "jdk",
          "\"",
          "wg",
          "go",
          "cd"
        ]

        this was manually refined

        You can find that in codebook.json

         */
    })
})

