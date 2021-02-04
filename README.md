# MTA_App

## Overview
This application tracks the status of NYC subway trains (i.e. whether a train line is normal or delayed, shown in /status). It also tracks the cumulative delay time and the cumulative uptime of each train line (shwon in /uptime). With the uptime defined as 1 - (cumulative delay time/ total time).

## Instructions to Run
- In config.js, the config.MTA_API_KEY is omitted. A MTA API key needs to be put there for the application to run.
- Have the latest node.js version installed and run 'npm install' in the directory.

## Ideas for Improvement
Ideally, I should split the MTA polling to a separate service, which would fetch the data from source, parse and write the data into a database. The main web app will handle incoming traffic request and read from the database to show relevant information.
mtaUtils.js can also be re-factored into a module as it has more functionalities.