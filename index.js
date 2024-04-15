import { readdirSync, rmSync, renameSync, mkdirSync } from "fs";
import { join, relative, resolve } from "path";
import { argv } from "process";

const { startLocation, skip, deleteFiles, moveFiles } = (argv &&
  argv[2] &&
  JSON.parse(argv[2])) || {
  startLocation: "C:\\Users\\Vincent\\My Drive",
  skip: [
    "DirksDrive",
    "JustForMe",
    "Elzbieta & Vincent",
    `.tmp.driveupload`,
    `Documents`,
    `Misc`,
    `Photos and Videos`,
  ],
  deleteFiles: [
    /\.dropbox( \(\d+\))?/,
    /\.DS_Store( \(\d+\))?/,
    /\.localized/,
    /Icon_/,
    /ATT\d+( \d+)?( \(\d+\))?\.c/,
    /\d+\.attr/,
    /desktop\.ini/,
    /.?\.thm/i,
    /.?\.ipmeta/,
    /.?\.plist/,
    /.?\.iMovieProj/,
    /.?\.db/,
    /.?\.AAE/,
    /.?\.data/,
    /.?\.ini/,
    /.?\.BUP/,
  ],
  moveFiles: [
    {
      src: /.+\.(?:jp(?:e)?g|bmp|mov|png|m4v|mp4|tif|mpg|AVI)/i,
      dest: `.\\Photos and Videos\\`,
    },
    {
      src: /.+\.(?:xls(?:x)?|pdf|doc(?:x)?|gif|csv|html|ppt|rtf|gdoc|gsheet|gpx)/i,
      dest: `.\\Documents\\`,
    },
    { src: /.+\.(?:ttf)/i, dest: `.\\Misc\\Fonts\\` },
    { src: /.+\.(?:zip)/i, dest: `.\\Misc\\Archives\\` },
  ],
};

// npm start "{\"startLocation\": \"C:\\\\Users\\\\Vincent\\\\My Drive\", \"skip\": [\"DirksDrive\", \"JustForMe\", \"Elzbieta & Vincent\"] }"

let counters = {
  directories: { processed: 0, moved: 0, deleted: 0 },
  files: { processed: 0, moved: 0, deleted: 0 },
};

process.chdir(startLocation);

processDirectory(startLocation, deleteFiles, moveFiles);

console.log(JSON.stringify(counters, null, ` `));

function processDirectory(directory, deleteFiles) {
  let contents = readdirSync(directory, { withFileTypes: true });

  counters.directories.processed += contents.filter((item) =>
    item.isDirectory()
  ).length;
  counters.files.processed += contents.filter((item) => item.isFile()).length;

  if (contents.length > 0) {
    // remove skips
    contents = contents.filter((item) => !skip.includes(item.name));

    // move files
    moveFiles.forEach((moveFile) => {
      contents
        .filter((item) => moveFile.src.test(item.name))
        .filter(
          (fileToMove) =>
            !resolve(fileToMove.path).startsWith(resolve(moveFile.dest))
        )
        .forEach((fileToMove) => {
          const relSrcPath = relative(startLocation, fileToMove.path);
          const srcPathName = join(relSrcPath, fileToMove.name);
          const destPathName = join(moveFile.dest, relSrcPath, fileToMove.name);
          console.log(`move file: ${srcPathName} to ${destPathName}`);

          mkdirSync(join(moveFile.dest, relSrcPath), { recursive: true });
          renameSync(srcPathName, destPathName);

          counters.files.moved++;
        });
    });

    // delete files
    contents
      .filter((item) =>
        deleteFiles.some((deleteFile) => deleteFile.test(item.name))
      )
      .map((item) => join(item.path, item.name))
      .forEach((fileToDelete) => {
        console.log(`delete file: ${fileToDelete}`);
        rmSync(fileToDelete, { recursive: true, force: true });
        counters.files.deleted++;
      });

    // process child direcotries
    contents
      .filter((item) => item.isDirectory())
      .map((childDirectory) => join(childDirectory.path, childDirectory.name))
      .forEach((childDirectory) => {
        processDirectory(childDirectory, deleteFiles);
      });
  }

  // recheck if directory is now empty
  contents = readdirSync(directory, { withFileTypes: true });
  if (contents.length === 0) {
    console.log(`${directory} is empty and will be deleted`);
    rmSync(directory, { recursive: true, force: true });
    counters.directories.deleted++;
  } else {
    console.log(
      `${directory} has remaining content \n\t${contents
        .slice(0, 6)
        .map((child) => child.name)
        .join("\n\t")}`
    );
    contents.length > 6 && console.log("\t...");
  }
}
