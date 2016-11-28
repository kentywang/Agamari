const request = require('supertest-as-promised')
const expect = require('chai').expect;
const { User, Room, Score, db } = require('../../server/db/index');
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
      Score.truncate({ cascade: true })
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
        room = createdRooms[1];
      });

    });

    it('returns the JSON of the article based on the id', function () {
      console.log(room);
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

    it('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('/articles/76142896')
      .expect(404);

    });

  });

});

//*****************************************************************************
//TEST SPECS FOR USER MODEL
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
      Score.truncate({ cascade: true })
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
       console.log(res.body);
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
        room = createdRooms[1];
      });

    });

    it('returns the JSON of the article based on the id', function () {
      console.log(room);
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

    it('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('/articles/76142896')
      .expect(404);

    });

  });

});



//*****************************************************************************
//TEST SPECS FOR SCORE MODEL
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
      Score.truncate({ cascade: true })
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
       console.log(res.body);
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
        room = createdRooms[1];
      });

    });

    it('returns the JSON of the article based on the id', function () {
      console.log(room);
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

    it('returns a 404 error if the ID is not correct', function () {

      return agent
      .get('/articles/76142896')
      .expect(404);

    });

  });

});
















