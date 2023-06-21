# -- Hyphametrics challenge README --

This README provides a guide for setting up and running the project.

## Prerequisites

```sh
1. Node.js v14.x
2. Docker
```

## Step-by-Step Setup Guide

* ### Step 1: Install Node.js 14.x

Before you can run this project, you need to make sure that Node.js v14.x is installed on your computer. To install Node.js, you can download it from the official [Node.js website](https://nodejs.org/).

>Alternatively, you can use a version manager like `nvm` to install Node.js. Here's how you would install Node.js v14.x using `nvm`:

```sh
nvm install 14
nvm use 14
```

* ### Step 2: Install Docker

Docker is required to create and manage the containers in which the project runs. You can download Docker from the official [Docker website](https://www.docker.com/products/docker-desktop).

### Step 3: Install Project Dependencies

Once Node.js and Docker are installed, navigate to the project directory and run the following command to install the project dependencies:
```sh
npm install
```

* ### Step 4: Start Docker Containers

Now, you can use the provided npm script to start the Docker containers necessary for the project:

```sh
npm run start:stack
```

This command will build and start the Docker containers. Make sure Docker is running before executing this command.

* ### Step 5: Start the Application

Finally, you can start the application by running:
```sh
npm run start
```

This command will start the Node.js application. You should now be able to access the application through your web browser.


```sh
The response is stored in a JSON file located at the path "./output.json" and in the "viewershipPresences" collection within MongoDB
```


## Congratulations!

You have successfully set up and started the application. If you encounter any issues or have any questions, please refer to this email: kevincruces.zuloaga@gmail.com



