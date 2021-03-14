# Relaxdays-Hackathon-MiscTask2

This project was created in the Relaxdays Code Challenge Vol. 1. 
See https://sites.google.com/relaxdays.de/hackathon-relaxdays/startseite for more information.
My participant ID in the challenge was: CC-VOL1-23

## DockerFileCompressor

This is a NodeJS script to compress (and decompress) Dockerfiles. This repo solves the task of the Hackathon requiring compression of dockerfiles. The special thing about Dockerfiles is how small they are, so at small sizes most compression algorithms would actually add overhead.

A short overview how it works:

The dockerfile is loaded and unneeded data is removed (unless the argument --do-not-clean is supplied):
 * Comments
 * Mantainer Tag
 * Multiline Commands
 * Empty lines
 
 All of these things are not required to run a dockerfile, so they are sacrificed for a smaller size.
 
 Then multiple compression algorithms are tested and the smallest one is used. Which algorithm was used is added as a single byte at the beginning of the file.
 
 Following "compressions" are possible:
 * None, file remains as original
 * [SMAZ](https://github.com/antirez/smaz) with a custom codebook
 * [Unishox2](https://github.com/siara-cc/Unishox) 
 * [zlib](https://zlib.net/)
 
 The original idea was using SMAZ with a codebook for Dockerfiles. This (included) codebook was created with the contained `generate.js` (the script loads and processes all Dockerfiles in the `referencefiles` folder) and then manually adjusted. As source about 1500 Dockerfiles were collected from GitHub. But during testing I came to the conclusion that Unishox2 had better compression in most cases.  
 
 For that reason I also compared SMAZ, Unishox and zlib against all those sourced Dockerfiles. Over all files the best compression was zlib because most of those sourced files were pretty big. But for very small files it was either Unishox2 or SMAZ. But for this challenge the focus is small files so I decided to just always use the algorithm producing the smallest size and add the small overhead of a byte to decide which algorithm to use when decompressing.
 
 Quite a bit data is also shaved off by "uglifying" the Dockerfile, but because that maybe isn't compression anymore (after all information like comments is lost) an argument was added which disables the stripping of unneeded information.


## Build Setup and Arguments - No Docker

The following assumes you have NodeJS installed.

```bash
# install dependencies
yarn install
```

or with NPM:

```bash
# install dependencies
npm install
```

to run just execute 

```bash
node index.js
```

This tells you the options then. This looks like the following:

```
$ node index.js
Following parameters are allowed: <input-file> <?output-path> <?output-filename>
         <input-file>            - the docker to be compressed or decompressed (judged by extension)
         <?output-path>          - optional output path, by default /output
         <?output-filename>      - optional output file name, by default original name + .decompressed
         --do-not-clean          - optional parameter (possible at every position) - if this is added the script
                                   will not strip the dockerfiles of data which is not needed to generate the image
```

So to for example compress a dockerfile in your current directory lossless you would do: 

```
node index.js --do-not-clean Dockerfile ./
```

To decompress the same file and give it the custom name `restored.txt`

```
node index.js Dockerfile.compressed ./ restored.txt
```

When you compress a file it shows you some info about original filesize and new filesize. If you for example compress the dockerfile of this repo (without the --do-not-clean parameter) it would show you the following:

```
Original filesize: 175 bytes - New size: 82 bytes. Space saved: 0.53%
```

## Build Setup - Docker

Get a running version of this code using the following commands:

```bash
git clone https://github.com/NetroScript/Relaxdays-Hackathon-MiscTask2.git
cd Relaxdays-Hackathon-MiscTask2
docker build -t dockerfilecompressor .
docker run -v $(pwd)/files:/output -it dockerfilecompressor <file>
```

Assuming a file called Dockerfile is in the ./files folder of the host you can run the following command to generate a compressed version of it:

```bash
docker run -v $(pwd)/files:/output -it dockerfilecompressor Dockerfile
```

and to uncompress the newly created compressed version:

```bash
docker run -v $(pwd)/files:/output -it dockerfilecompressor Dockerfile.compressed
```