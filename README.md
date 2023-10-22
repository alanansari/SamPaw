# Samriddhi Prawah
Backend for Samriddhi Prawah, a commodity sharing platform for the college VE CELL made in **Node.js** and **Express** using **MongoDB** as the Database.

## Backend Key Features ✨

- JWT Authentication with complete integration of Refresh and Access tokens.
- MongoDB for the DB because of its a source-available, document-oriented and flexible nature.
- Redis for caching static data making queries faster.
- Implemented CI/CD pipeline using GitHub Actions, automating the deployment to an AWS EC2 instance.
- Leveraged Cluster Nodes to support multiple instances, ensuring optimal resource utilisation.

## RUNNING THE SERVER ⚙️

*Get started on the local machine*

1. Clone the repository: 
   ```CMD
   git clone https://github.com/alanansari/SamPaw.git
   ```
*To run the server, you need to have NodeJS installed on your machine. If you don't have it installed, you can follow the instructions [here](https://nodejs.org/en//) to install it.*

2. Setup .env file in base directory:
   ```
   PORT = "" 
   DB_URI = ""

   JWT_ACCESS_KEY = ""
   JWT_REFRESH_KEY = ""
   JWT_ACCESS_EXP = ''
   JWT_REFRESH_EXP = ''
   JWT_TOKEN = ""
   ADMIN_JWT_ACCESS_KEY = ""
   ADMIN_JWT_REFRESH_KEY = ""
   ADMIN_JWT_ACCESS_EXP = ''
   ADMIN_JWT_REFRESH_EXP = ''

   MAIL_ID = "" 
   MAIL_PASS = ""
    
   cloud_name =  ""
   api_key =  ""
   api_secret =  ""
   ```
3. Running with local machine

   - Install dependencies

      ```CMD
      npm install
      ```
   - Run the server on localhost:
      ```CMD
      npm run start
      ```
   ---
    
*You can access the endpoints from your web browser following this url:*
   ```url
   http://localhost:[PORT]
   ```
