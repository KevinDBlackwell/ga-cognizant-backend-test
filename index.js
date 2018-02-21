const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      app = express();

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;

const sequelize = new Sequelize('database', 'username', null, {
  host: 'localhost',
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  storage: DB_PATH,
  }
);

// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });

// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
  const Recommendation = sequelize.define('recommendation', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    releaseDate: {
      type: Sequelize.STRING
    },
    genre: {
      type: Sequelize.STRING
    },
    averageRating: {
      type: Sequelize.INTEGER
    },
    reviews: {
      type: Sequelize.INTEGER
    }
  },
  {
    freezeTableName: true
  });

  Recommendation.sync({force: true})
  .then((req, res) => {
    return Recommendation
  })

  Recommendation.findAll({
    where: {
      genre: req.data.genre,
      reviews: {
        $gte: 5
      },
      averageRating: {
        $gte: 4
      },
      releaseDate: {
        $or: [
          {$gte: req.data.releaseDate - 15},
          {$lte: req.data.releaseDate + 15}
          
        ]
      }
    },
    order: [
      ['id', 'ASC']
    ] 
  })
  .then(res => {
    console.log(res)
  })
  res.status(500).send('Not Implemented');
}

module.exports = app;
