const smaz = require('@remusao/smaz');
const data = require('./codebook.json')
const strip = require('strip-comments');
const usx = require("unishox2.siara.cc");
const zlib = require('zlib');
const fs = require('fs');
const path = require('path')

const smaz_custom = new smaz.Smaz(data.codebook);



function cleanUpFile(file){
    // Remove comments
    file = strip(file, {
        language: "perl",
        preserveNewlines: false,
    }).trim()
    // Remove empty lines
    file = file.replace(/^\s*$(?:\r\n?|\n)/gm, "");
    // I hope you like single lines, because now we remove those readable multiline commands
    file = file.replace(/\\\r?\n\s*/g, " ");
    // Strip Mantainer Tag
    return file.split(/\r?\n/).filter(line => !line.trim().toLowerCase().startsWith("maintainer")).join("\n");
}


function compress(file, cleanFile=true){
    if (cleanFile)
        file = cleanUpFile(file);

    //console.log(file);
    const possible_compressions = {
        "default_file": new Buffer.from(file),
        "smaz_custom": smaz_custom.compress(file),
        "unishox2default": new Uint8Array(file.length*1.5),
        "zlib": zlib.deflateRawSync(new Buffer.from(file))
    }

    const unishox2defaultsize = usx.unishox2_compress_simple(file, file.length, possible_compressions.unishox2default)


    possible_compressions.unishox2default = possible_compressions.unishox2default.subarray(0, unishox2defaultsize)



    let smallest = possible_compressions.default_file.length;
    let type = "default_file";

    for([key, value] of Object.entries(possible_compressions)){
        if(value.length < smallest){
            smallest = value.length;
            type = key;
        }
    }

    let byte = 0;

    switch (type) {
        case "smaz_custom":
            byte = 1
            break;
        case "unishox2default":
            byte = 2
            break;
        case "zlib":
            byte = 3
            break;
    }

    return Buffer.concat([new Buffer.from([byte]), possible_compressions[type]]);
}

function decompress(file){

    const type = file[0];
    switch (type) {
        case 0:
            return file.subarray(1, file.length);
        case 1:
            return smaz_custom.decompress(file.subarray(1, file.length));
        case 2:
            return usx.unishox2_decompress_simple(file.subarray(1, file.length), file.length-1);
        case 3:
            return zlib.inflateRawSync(file.subarray(1, file.length)).toString();
    }
}

let arguments = process.argv.slice(2);

const clean = !arguments.includes("--do-not-clean");

arguments = arguments.filter(argument => argument !== "--do-not-clean")

if(arguments.length === 0){
    console.log("Following parameters are allowed: <input-file> <?output-path> <?output-filename>")
    console.log("\t <input-file>\t\t - the docker to be compressed or decompressed (judged by extension)")
    console.log("\t\t\t\t   first looks for the file in the output path, if there no file is found it uses exactly the given path")
    console.log("\t <?output-path>\t\t - optional output path, by default /output")
    console.log("\t <?output-filename>\t - optional output file name, by default original name + .decompressed")
    console.log("\t --do-not-clean\t\t - optional parameter (possible at every position) - if this is added the script ")
    console.log("\t\t\t\t   will not strip the dockerfiles of data which is not needed to generate the image")

} else {
    let output_path = "/output";
    if(arguments.length > 1) {
        output_path = arguments[1];
    }

    let filename = arguments[0];


    let completePath = "";
    if (fs.existsSync(path.join(output_path, filename))){
        completePath = path.join(output_path, filename);
    } else if(fs.existsSync(filename)){
        completePath = filename;
    }

    output_path = path.resolve(output_path);
    filename = path.basename(filename);



    if (completePath !== ""){
        console.log("Reading file: " + path.resolve(completePath));
        if(filename.endsWith(".compressed")){
            fs.readFile(completePath, (err, data) => {
                if (err != null){
                    console.log("An error happened while reading the file.")
                    console.log(err);
                    process.exit();
                }
                const decompressed = decompress(data);

                if (arguments.length > 2) {
                    fs.writeFileSync(path.join(output_path, arguments[2]), decompressed);
                } else {
                    fs.writeFileSync(path.join(output_path, path.basename(filename, ".compressed") + ".decompressed"), decompressed);
                }
            })
        } else {

            fs.readFile(completePath, "utf-8", (err, data) => {

                const size = Buffer.from(data).length;

                if (err != null){
                    console.log("An error happened while reading the file.")
                    console.log(err);
                    process.exit();
                }
                const compressed = compress(data, clean);

                if (arguments.length > 2) {
                    fs.writeFileSync(path.join(output_path, arguments[2]), compressed);
                } else {
                    fs.writeFileSync(path.join(output_path, filename + ".compressed"), compressed);
                }

                console.log("Encoded using: " + (["None, file left unchanged", "SMAZ with custom codebook", "Unishox2", "zlib"])[compressed[0] % 4] )
                console.log("Original filesize: " + size +" bytes - New size: " + compressed.length + " bytes. Space saved: " + (1-(compressed.length / size)).toFixed(2) + "%");

            })
        }
    } else {
        console.log("Your supplied file does not exist.")
    }

}
