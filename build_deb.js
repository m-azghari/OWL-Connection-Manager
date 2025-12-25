const installer = require('electron-installer-debian');

const options = {
    src: 'dist/OWL-linux-x64/',
    dest: 'dist/installers/',
    arch: 'amd64',
    icon: 'owl_logo.png',
    name: 'owl',
    productName: 'OWL Connection Manager',
    genericName: 'Connection Manager',
    version: '1.0.0',
    description: 'A simple connection manager',
    categories: ['Network'],
    maintainer: 'Mazghari <mohamed.azghari99@gmail.com>', // Placeholder, required field
    homepage: 'https://github.com/mazghari/owl', // Placeholder
    bin: 'OWL', // Name of the binary in the src folder
    scripts: {
        postrm: 'debian_postrm.sh'
    }
};

console.log('Creating package (this may take a while)...');

installer(options)
    .then(data => console.log(`Successfully created package at ${data.packagePaths}`))
    .catch(err => {
        console.error(err, err.stack);
        process.exit(1);
    });
