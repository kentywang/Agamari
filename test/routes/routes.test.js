const request = require('supertest-as-promised')
const expect = require('chai').expect;
const { User, Room, Score, db, Bug } = require('../../server/db/index');
const app = require('../../server/index')
const agent = request.agent(app);



//*****************************************************************************
//TEST SPECS FOR ROOM MODEL
//*****************************************************************************
describe('Rooms Routes:', function () {

  /**
   * First we clear the database before beginning each run
   */
  before(function () {
    return db.sync({force: true});
  });

  afterEach(function () {
    return Promise.all([
      User.truncate({ cascade: true }),
      Room.truncate({ cascade: true }),
      Score.truncate({ cascade: true }),
      Bug.truncate({ cascade: true })
    ]);
  });

  describe('GET /api/rooms', function () {
    it('responds with an array via JSON', function () {

      return agent
      .get('/api/rooms')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(function (res) {
        // res.body is the JSON return object
        expect(res.body).to.be.an.instanceOf(Array);
        expect(res.body).to.have.length(0);
      });
       //console.log(res.body);
    });

    it('returns a room if there is one in the DB', function () {

      let room = Room.build({
        name: 'Test Room'
      });

      return room.save().then(function () {

        return agent
        .get('/api/rooms')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].name).to.equal('Test Room');
        });
        console.log(res.body);
      });

    });

    it('returns another room if there is another one in the DB', function () {

      let room1 = Room.build({
        name: 'Test Room1'
      });

      let room2 = Room.build({
        name: 'Test Room2'
      });

      return room1.save()
      .then(function () { return room2.save() })
      .then(function () {

        return agent
        .get('/api/rooms')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].name).to.equal('Test Room1');
          expect(res.body[1].name).to.equal('Test Room2');
        });

      });

    });

   });

  describe('GET api/rooms/:id', function () {

    let room;

    beforeEach(function () {
      

      var creatingRooms = [{
        name: 'test room1'
      }, {
        name: 'test room2'
      }, {
        name: 'test room3'
      }]
      .map(data => Room.create(data));

      return Promise.all(creatingRooms)
      .then(createdRooms => {
        room = createdRooms[0].dataValues;
        console.log(room);
      });

    });

    it('returns the JSON of the article based on the id', function () {
      console.log('api/rooms/'+room.id);
      return agent
      .get('api/rooms/')
      .expect(200)
      .expect(function (res) {
        if (typeof res.body === 'string') {
          res.body = JSON.parse(res.body);
        }
        expect(res.body.name).to.equal('Cool Article');
      });

    });

    xit('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('api/articles/76142896')
      .expect(404);

    });

  });

});

//*****************************************************************************
//TEST SPECS FOR USER MODEL
//*****************************************************************************
describe('Users Routes:', function () {

  /**
   * First we clear the database before beginning each run
   */
  before(function () {
    return db.sync({force: true});
  });

  afterEach(function () {
    return Promise.all([
      User.truncate({ cascade: true }),
      Room.truncate({ cascade: true }),
      Score.truncate({ cascade: true }),
      Bug.truncate({ cascade: true })
    ]);
  });

  describe('GET /api/users', function () {
    it('responds with an array via JSON', function () {

      return agent
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(function (res) {
        // res.body is the JSON return object
        expect(res.body).to.be.an.instanceOf(Array);
        expect(res.body).to.have.length(0);
      });
       //console.log(res.body);
    });

    it('returns a user if there is one in the DB', function () {

      let user = User.build({
        nickname: 'Test User'
      });

      return user.save().then(function () {

        return agent
        .get('/api/users')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].nickname).to.equal('Test User');
        });
        //console.log(res.body);
      });

    });

    it('returns another user if there is another one in the DB', function () {

      let user1 = User.build({
        nickname: 'Test user1'
      });

      let user2 = User.build({
        nickname: 'Test user2'
      });

      return user1.save()
      .then(function () { return user2.save() })
      .then(function () {

        return agent
        .get('/api/users')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].nickname).to.equal('Test user1');
          expect(res.body[1].nickname).to.equal('Test user2');
        });

      });

    });

   });

  describe('GET api/users/:id', function () {

    let user;

    beforeEach(function () {

      var creatingUsers = [{
        nickname: 'test user1'
      }, {
        nickname: 'test user2'
      }, {
        nickname: 'test user3'
      }]
      .map(data => User.create(data));

      return Promise.all(creatingUsers)
      .then(createdUsers => {
        user = createdUsers[1];
      });

    });

    xit('returns the JSON of the article based on the id', function () {
      //console.log(user);
      return agent
      .get('api/users/'+user.id)
      .expect(200)
      .expect(function (res) {
        if (typeof res.body === 'string') {
          res.body = JSON.parse(res.body);
        }
        expect(res.body.name).to.equal('Cool Article');
      });

    });

    xit('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('api/users/76142896')
      .expect(404);

    });

  });

});



//*****************************************************************************
//TEST SPECS FOR SCORE MODEL
//*****************************************************************************


describe('Scores Routes:', function () {

  /**
   * First we clear the database before beginning each run
   */
  before(function () {
    return db.sync({force: true});
  });

  afterEach(function () {
    return Promise.all([
      User.truncate({ cascade: true }),
      Room.truncate({ cascade: true }),
      Score.truncate({ cascade: true })
    ]);
  });

  describe('GET /api/scores', function () {
    it('responds with an array via JSON', function () {

      return agent
      .get('/api/scores')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(function (res) {
        // res.body is the JSON return object
        expect(res.body).to.be.an.instanceOf(Array);
        expect(res.body).to.have.length(0);
      });
       //console.log(res.body);
    });

    it('returns a score if there is one in the DB', function () {

      let score = Score.build({
        value: 100,
        time: Date.now()
      });

      return score.save().then(function () {

        return agent
        .get('/api/scores')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].value).to.equal(100);
        });
        //console.log(res.body);
      });

    });

    it('returns another score if there is another one in the DB', function () {

      let score1 = Score.build({
        value: 100,
        time: Date.now()
      });

      let score2 = Score.build({
        value: 200,
        time: Date.now()
      });

      return score1.save()
      .then(function () { return score2.save() })
      .then(function () {

        return agent
        .get('/api/scores')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].value).to.equal(100);
          expect(res.body[1].value).to.equal(200);
        });

      });

    });

   });

  describe('GET api/scores/:id', function () {

    let score;

    beforeEach(function () {

      var creatingScores = [{
        value: 2000,
        time: Date.now()
      }, {
        value: 4000,
        time: Date.now()
      }, {
        value: 6000,
        time: Date.now()
      }]
      .map(data => Score.create(data));

      return Promise.all(creatingScores)
      .then(createdScores => {
        //console.log(createdScores);
        score = createdScores[1];
      });

    });

    xit('returns the JSON of the article based on the id', function () {
      //console.log(room);
      return agent
      .get('api/scores/'+score.id)
      .expect(200)
      .expect(function (res) {
        if (typeof res.body === 'string') {
          res.body = JSON.parse(res.body);
        }
        expect(res.body.value).to.equal(4000);
      });

    });

    xit('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('/scores/76142896')
      .expect(404);

    });

  });

});




//*****************************************************************************
//TEST SPECS FOR BUG MODEL
//*****************************************************************************


describe('Bugs Routes:', function () {

  /**
   * First we clear the database before beginning each run
   */
  before(function () {
    return db.sync({force: true});
  });

  afterEach(function () {
    return Promise.all([
      User.truncate({ cascade: true }),
      Room.truncate({ cascade: true }),
      Score.truncate({ cascade: true }),
      Bug.truncate({ cascade: true })
    ]);
  });

  describe('GET /api/bugs', function () {
    it('responds with an array via JSON', function () {

      return agent
      .get('/api/bugs')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(function (res) {
        // res.body is the JSON return object
        expect(res.body).to.be.an.instanceOf(Array);
        expect(res.body).to.have.length(0);
      });
       //console.log(res.body);
    });

    it('returns a score if there is one in the DB', function () {

      let bug = Bug.build({
        name: 'test',
        email: 'test@gmail.com',
        subject: 'Bug',
        details: 'Bug on game physics.'
      });

      return bug.save().then(function () {

        return agent
        .get('/api/bugs')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].name).to.equal('test');
          expect(res.body[0].email).to.equal('test@gmail.com');
          expect(res.body[0].subject).to.equal('Bug');
          expect(res.body[0].details).to.equal('Bug on game physics.');
        });
        //console.log(res.body);
      });

    });

    it('returns another bug if there is another one in the DB', function () {

      let bug1 = Bug.build({
        name: 'test1'
      });

      let bug2 = Bug.build({
        name: 'test2'
      });

      return bug1.save()
      .then(function () { return bug2.save() })
      .then(function () {

        return agent
        .get('/api/bugs')
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body[0].name).to.equal('test1');
          expect(res.body[1].name).to.equal('test2');
        });

      });

    });

   });

  describe('GET api/bugs/:id', function () {

    let score;

    beforeEach(function () {

      var creatingScores = [{
        value: 2000,
        time: Date.now()
      }, {
        value: 4000,
        time: Date.now()
      }, {
        value: 6000,
        time: Date.now()
      }]
      .map(data => Score.create(data));

      return Promise.all(creatingScores)
      .then(createdScores => {
        //console.log(createdScores);
        score = createdScores[1];
      });

    });

    xit('returns the JSON of the article based on the id', function () {
      //console.log(room);
      return agent
      .get('api/scores/'+score.id)
      .expect(200)
      .expect(function (res) {
        if (typeof res.body === 'string') {
          res.body = JSON.parse(res.body);
        }
        expect(res.body.value).to.equal(4000);
      });

    });

    xit('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('/scores/76142896')
      .expect(404);

    });

  });


   describe('POST api/bugs', function () {


    xit('creates a new bug', function () {

      return agent
      .post('api/bugs')
      .send({
        name: 'test',
        email: 'test@gmail.com',
        subject: 'Bug',
        details: 'Bug on game physics.'
      })
      .expect(200)
      .expect(function (res) {
        expect(res.body.message).to.equal('Created successfully');
        expect(res.body.bug.id).to.not.be.an('undefined');
        expect(res.body.bug.title).to.equal('Awesome POST-Created Article');
        expect(res.body.bug.name).to.equal('test');
        expect(res.body.bug.email).to.equal('test@gmail.com');
        expect(res.body.bug.subject).to.equal('Bug');
        expect(res.body.bug.details).to.equal('Bug on game physics.');
      });

    });

    // This one should fail with a 500 because we don't set the article.content
    xit('does not create a new article without content', function () {

      return agent
      .post('/articles')
      .send({
        title: 'This Article Should Not Be Allowed'
      })
      .expect(500);

    });

    // Check if the articles were actually saved to the database
    xit('saves the article to the DB', function () {

      return agent
      .post('/articles')
      .send({
        title: 'Awesome POST-Created Article',
        content: 'Can you believe I did this in a test?'
      })
      .expect(200)
      .then(function () {
        return Article.findOne({
          where: { title: 'Awesome POST-Created Article' }
        });
      })
      .then(function (foundArticle) {
        expect(foundArticle).to.exist; // eslint-disable-line no-unused-expressions
        expect(foundArticle.content).to.equal('Can you believe I did this in a test?');
      });

    });

    // Do not assume async operations (like db writes) will work; always check
    xit('sends back JSON of the actual created article, not just the POSTed data', function () {

      return agent
      .post('/articles')
      .send({
        title: 'Coconuts',
        content: 'A full-sized coconut weighs about 1.44 kg (3.2 lb).',
        extraneous: 'Sequelize will quietly ignore this non-schema property'
      })
      .expect(200)
      .expect(function (res) {
        expect(res.body.article.extraneous).to.be.an('undefined');
        expect(res.body.article.createdAt).to.exist; // eslint-disable-line no-unused-expressions
      });

    });

  });

});















