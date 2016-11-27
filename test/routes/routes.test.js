const request = require('supertest-as-promised')
const expect = require('chai').expect;
const { User, Room, Score, db } = require('../../server/db/index');
const app = require('../../server/index')
const agent = request.agent(app);

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

   // });

  //   it('returns an article if there is one in the DB', function () {

  //     var article = Article.build({
  //       title: 'Test Article',
  //       content: 'Test body'
  //     });

  //     return article.save().then(function () {

  //       return agent
  //       .get('/articles')
  //       .expect(200)
  //       .expect(function (res) {
  //         expect(res.body).to.be.an.instanceOf(Array);
  //         expect(res.body[0].content).to.equal('Test body');
  //       });

  //     });

  //   });

  //   it('returns another article if there is one in the DB', function () {

  //     var article1 = Article.build({
  //       title: 'Test Article',
  //       content: 'Test body'
  //     });

  //     var article2 = Article.build({
  //       title: 'Another Test Article',
  //       content: 'Another test body'
  //     });

  //     return article1.save()
  //     .then(function () { return article2.save() })
  //     .then(function () {

  //       return agent
  //       .get('/articles')
  //       .expect(200)
  //       .expect(function (res) {
  //         expect(res.body).to.be.an.instanceOf(Array);
  //         expect(res.body[0].content).to.equal('Test body');
  //         expect(res.body[1].content).to.equal('Another test body');
  //       });

  //     });

  //   });

   });

  // describe('GET /articles/:id', function () {

  //   var coolArticle;

  //   beforeEach(function () {

  //     var creatingArticles = [{
  //       title: 'Boring article',
  //       content: 'This article is boring'
  //     }, {
  //       title: 'Cool Article',
  //       content: 'This article is cool'
  //     }, {
  //       title: 'Riveting Article',
  //       content: 'This article is riveting'
  //     }]
  //     .map(data => Article.create(data));

  //     return Promise.all(creatingArticles)
  //     .then(createdArticles => {
  //       coolArticle = createdArticles[1];
  //     });

  //   });

  //   it('returns the JSON of the article based on the id', function () {

  //     return agent
  //     .get('/articles/' + coolArticle.id)
  //     .expect(200)
  //     .expect(function (res) {
  //       if (typeof res.body === 'string') {
  //         res.body = JSON.parse(res.body);
  //       }
  //       expect(res.body.title).to.equal('Cool Article');
  //     });

  //   });

  //   it('returns a 404 error if the ID is not correct', function () {

  //     return agent
  //     .get('/articles/76142896')
  //     .expect(404);

  //   });

  });

});




