[![Build Status](https://travis-ci.org/panter/catladder-build.svg?branch=master)](https://travis-ci.org/panter/catladder-build) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# catladder-build 🐱 🔧

panter build & deploy tool for meteor apps

## Why another tool?

The most famous meteor deploy tool (meteor-up) uses docker and does not match our current setup.
So I decided to create a tool that integrates well in our setup and
reduces security issues with keys, app secrets, etc. by embracing `pass`.

Also building cordova apps needs some scripts (in particular android).

## gitlab CI integration

Some commands also work on gitlab ci and can be used to deploy the app there. (look for the cat 🐱🔧CI )

## Contribution

Check the docu [here](CONTRIBUTING.md).

## Usage

`npm install -g @panter/catladder-build`

### Preconditions:

- Server should be set up for current meteor apps (has node installed (version 4) and mongodb with oplog enabled).
- if you plan to build android apps, make sure that you have android build tools installed (min version 25)
- only tested on OS X atm.
- ** make sure that your pass is working! **

### Initialize new project & setup environments

in the root of your project invoke

`catladder init`

this will ask you for some params and create a `.catladder.yaml`-file which stores the configuration for the project.
You can (and should) safely add this file to git. Secrets will be stored in pass.

To create or update an environment (e.g. "staging"):

`catladder setup <environment>` (e.g. catladder setup staging)

This will ask for additional properties and create a new file in `pass` at "/customer/appname/environment/env.yaml"
which you can edit. This file can contain any secret that the server needs to know, e.g. amazon access keys, etc.

After saving `catladder` creates a env.sh on the server under `~/app/env.sh` which contains
environment-variables for the server. (Warning: this file gets overwritten!)

You need to restart the server if you want to apply these changes

### Restart server (🐱🔧CI)

`catladder restart <environment>`

### Deploy app (🐱🔧CI)

`catladder deploy <environment>`

this will create a bundle of the app (with `meteor build`), upload it to the server and restart the server.

## Mobile apps

### Preconditions

- add platforms to meteor: `meteor platform-add ios android` (in the meteor app directory)

- For android you first need to invoke

`catladder android-init <environment>`

this will create a keystore-file which you can checkin to git. The corresponding password will be created in pass.

### Build mobile apps

`catladder build-apps <environment>`

This will create and sign an android apk file and an xcode project, where you can upload the app to the app store.

## ROADMAP:

- integrate with meteor's mobile-config.js (maybe autocreate it)
- autogenerate gitlab-ci-config file
- allow to show logs on the server remotely
- Allow to specify multiple instances (load-balancing) and scale up and down
