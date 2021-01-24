'use strict';

const express = require('express');
const { body,validationResult } = require('express-validator');
const stringifyObject = require('stringify-object');
const path = require('path','sep')
const fs = require('fs');
const { spawn } = require('child_process');


// Constants
const PORT = 9979;
const HOST = '0.0.0.0';

// App
const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


app.get('/', (req, res) => {
  let txthtml = "";
  txthtml += '<html>';
  txthtml += '<head>Remote remesher tool [Windows Version]:</head>';
  txthtml += '<body>';
  txthtml += '<br />';
  txthtml += '<br /><a href="/instant">Instant Meshes: Submit form...</a>';
  txthtml += '<br />';
  txthtml += '<br /><a href="/quad">Quad Remesher: Submit form...</a>';
  txthtml += '</body></html>';

  res.send(txthtml);
});

app.get('/quad', (req, res) => {
  res.send(' \
  <form action="/quad/" method="post"> \
  <label>File to Quad remesh:  </label> \
  <br /> \
  <input type="text" name="file_path" style="width: 400px;" value=""> \
  <br /> \
  <input type="file" id="myFile" name="filename"> \
  <br /> \
  <input type="submit" value="GO"> \
  </form> \
  <br /> \
  <a href="/">Back to remote remesher index.</a> \
  <br />');
});

app.get('/instant', (req, res) => {
  res.send(' \
  <form action="/instant/" method="post"> \
  <label>File to instant remesh:  </label> \
  <br /> \
  <input type="text" name="file_path" style="width: 400px;" value=""> \
  <br /> \
  <input type="file" id="myFile" name="filename"> \
  <br /> \
  <label>Number of faces:  </label> \
  <input type="text" name="faces" value="1000"> \
  <br /> \
  <label>Smoothness (default: 2): </label> \
  <input type="text" name="smooth" value="2"> \
  <br /> \
  <label>Output file name addition.extension: </label> \
  <br /> \
  <input type="text" name="file_out_ext" style="width: 400px;" value="_remeshed.obj"> \
  <br /> \
  <input type="submit" value="GO"> \
  </form> \
  <br /> \
  <a href="/">Back to remote remesher index.</a> \
  <br />');
});



app.post('/instant', [
  body('faces').isInt(),
  body('smooth').isInt()
], (req, res) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
      const err = stringifyObject(errors.array(), {
        indent: '  ',
        singleQuotes: false
      }); 
      return res.status(422).send("Error: Not a number.<br />" + err + "<br /><a href='/instant'>Try again...</a>");
    }

    if (req.body.filename.length == 0 && req.body.file_path.length == 0) {
      const txthtml = "No file selected.";
      return res.send(txthtml);
    }

    // Get the file name 
    //const remeshFolder = "Nomad/";
    var targetFilename = req.body.filename;
    if ( targetFilename.length == 0)
      targetFilename = req.body.file_path;

    var outputFilename = targetFilename.substring(0,targetFilename.length-4) + req.body.file_out_ext;
    
    const win_path = "\\\\OMVNAS2\\NAS\\FreeForAll\\Nomad\\"

    if (!fs.existsSync(win_path+targetFilename)){      
      const txthtml = "Target file not found: " + win_path + targetFilename;
      //return res.send(txthtml);
    }

    // Data from form is valid.

    // const txthtml = stringifyObject(req.body, {
    //   indent: '  ',
    //   singleQuotes: false
    // }); 
    // return res.send(txthtml); 


    //'-c', '0', '-v', '2000', '-S', '2', '-o', 'C:\\Users\\Lesley\\AppData\\Local\\Temp\\out.obj', 'C:\\Users\\Lesley\\AppData\\Local\\Temp\\original.obj']
    const options = ['-c','0', '-f', req.body.faces, '-S', req.body.smooth, '-o', win_path+outputFilename, win_path+targetFilename];
    
    const instantMeshes = spawn('Instant Meshes.exe', options);

    var stdout_html = "";
    stdout_html += '<html>';
    stdout_html += '<head>Remesher result:</head>';
    stdout_html += '<body>';
    stdout_html += '<br />';
    instantMeshes.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      stdout_html += data + '<br />';
    });
    
    instantMeshes.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    instantMeshes.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      
      stdout_html += '<br />'
      stdout_html += '<a href="/">Back to remote remesher index.</a>'
      stdout_html += '</body></html>';
      return res.send(stdout_html);
    });
});


function fixPermissions(uploader_folder) {
  var chmodr = require('chmodr');
  console.log('chmod-ing folder: ' + uploader_folder);
  chmodr(uploader_folder, 0o775, function (err) {
    if (err) { throw err; }
    console.log("\n Fixed Permissions");
  });
}


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);




function exitHandler( options, err ) {
  console.log( "exitHandler:: options: ", options );

  if ( err ) {
    console.log( 'Caught Exception:', err.stack )
    process.exit();
  }
  if ( options.exit ) {
    console.log( "ytdl - Closing Down !" );
  }
}
//do something when app is closing
process.on( 'exit', exitHandler.bind( null, {
  exit: true,
  source: 'exit'
} ) );

//catches ctrl+c event
process.on( 'SIGINT', exitHandler.bind( null, {
  source: 'SIGINT'
} ) );
process.on( 'SIGTERM', exitHandler.bind( null, {
  exit: true,
  source: 'SIGTERM'
} ) );
//catches uncaught exceptions
process.on( 'uncaughtException', exitHandler.bind( null, {
  exit: true,
  source: 'uncaughtException'
} ) );
//generated on Windows when the console window is closed
process.on( 'SIGHUP', exitHandler.bind( null, {
  exit: true,
  source: 'SIGHUP'
} ) );
// delivered on Windows when <Ctrl>+<Break> is pressed
process.on( 'SIGBREAK', exitHandler.bind( null, {
  exit: true,
  source: 'SIGBREAK'
} ) );