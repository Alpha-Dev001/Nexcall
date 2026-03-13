#!/bin/bash

# Start MongoDB (if not running)
sudo systemctl start mongod

# Install dependencies
npm install

# Start the server
npm start
