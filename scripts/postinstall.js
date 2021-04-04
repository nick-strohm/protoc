const request = require('request');
const fs = require("fs");
const path = require("path");
const unzip = require("unzipper");
const mkdirp = require("mkdirp");
const protoc = require("../protoc.js");

const protoVersion = "3.15.7";

const releases = {
    "win32_x86_32": `https://github.com/google/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-win32.zip`,
    "win32_x86_64": `https://github.com/google/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-win32.zip`,
    "linux_x86_32": `https://github.com/google/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-x86_32.zip`,
    "linux_x86_64": `https://github.com/google/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-linux-x86_64.zip`,
    "darwin_x86_32": `https://github.com/google/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-osx-x86_32.zip`,
    "darwin_x86_64": `https://github.com/google/protobuf/releases/download/v${protoVersion}/protoc-${protoVersion}-osx-x86_64.zip`
};

const platform = process.platform;
const arch = process.arch === "x64" ? "x86_64" : "x86_32";
const release = platform + "_" + arch;

if (releases[release]) {
    request(releases[release])
        .pipe(unzip.Parse())
        .on("entry", function(entry) {
            let isFile = "File" === entry.type;
            let isDir = "Directory" === entry.type;
            let fullpath = path.join(__dirname, "..", "protoc", entry.path);
            let directory = isDir ? fullpath : path.dirname(fullpath);

            mkdirp(directory, function(err) {
                if (err) throw err;
                if (isFile) {
                    entry.pipe(fs.createWriteStream(fullpath))
                        .on("finish", function() {
                            if (protoc === fullpath) {
                                fs.chmod(fullpath, 0o755, function(err) {
                                    if (err) throw err;
                                });
                            }
                        });
                }
            });
        });
} else {
    throw new Error("Unsupported platform. Was not able to find a proper protoc version.");
}
