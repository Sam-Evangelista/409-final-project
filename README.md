This code is structure as follows

frontend:
- React Front End
- possible installations
- npm install react-router
- npm install axios

Structured by pages and components
- If a file should be used multiple times make into a component

to run:
cd into frontend
install required dependencies
npm run start


backend:
- Express, Nodemon, MongoDB
- Need User Authentication
    - Probably use Firebase
- Spotify api working
- Probably make two additional schemas
- User
    - Probably contain the firebase id for each user
- Rating

dependencies:
- npm install express
- npm install mongoose
- npm install dotenv
- npm install cors
- npm install request

Also make a .env
I could lowkey just send it but best practice was to not commit a .env because it messes with our keys

DATABASE_URL=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

to run:
cd into backend
install required dependencies
npm run devStart