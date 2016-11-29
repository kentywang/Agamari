'use strict';

const expect = require('chai').expect;
const { User, Room, Score, db } = require('../../server/db/index');

//*****************************************************************************
//TEST SPECS FOR USER MODEL
//*****************************************************************************
describe('The `User` model', function () {
  before(function () {
    return db.sync({force: true});
  });
  let user;
  beforeEach(function(){
    user = User.build({
      email: 'nemo@gmail.com',
      password:"test",
      admin: true,
      username: 'nemo1',
      guest:false,
      nickname: 'nemo2'
    });
  });

  afterEach(function () {
    return Promise.all([
      User.truncate({ cascade: true })
    ]);
  });

  describe('attributes definition', function(){

    
    it('includes `email` and `username` fields', function () {

      return user.save()
      .then(function (savedUser) {
        expect(savedUser.email).to.equal('nemo@gmail.com');
        expect(savedUser.admin).to.equal(true);
        expect(savedUser.username).to.equal('nemo1');
        expect(savedUser.nickname).to.equal('nemo2');
        expect(savedUser.guest).to.equal(false);

      });

    });

    it('requires `nickname`', function () {

      user.nickname = null;

      return user.validate()
      .then(function(result) {
        expect(result).to.be.an.instanceOf(Error);
        expect(result.message).to.contain('notNull Violation: nickname cannot be null');
      });

    });


  });


  describe('options definition', function(){
    
    user = User.build({
      email: 'nemo@gmail.com',
      password:"test",
      admin: true,
      username: 'nemo1',
      guest:false,
      nickname: 'nemo2'
   });

        describe('`authenticate` instance method', function(){

           // it('succeeds with a valid username and password', () =>
          // request(app)
          //   .post('/api/auth/local/login')
          //   .send(alice)
          //   .expect(302)
          //   .expect('Set-Cookie', /session=.*/)
          //   .expect('Location', '/')
          // )

          // it('fails with an invalid username and password', () =>
          // request(app)
          //   .post('/api/auth/local/login')
          //   .send({username: alice.username, password: 'wrong'})
          //   .expect(401)
          // )      
        



        });

        describe('`setEmailAndPassword` hooks', function(){

          
         

        });
  });  

});
//*****************************************************************************
//TEST SPECS FOR SCORES MODEL
//*****************************************************************************

describe('The `Score` model', function () {
  before(function () {
    return db.sync({force: true});
  });
  let score;
  let time = new Date
  beforeEach(function(){
    score = Score.build({
      value: 100,
      time: time,
    });
  });

  afterEach(function () {
    return Promise.all([
      Score.truncate({ cascade: true })
    ]);
  });

  describe('attributes definition', function(){

    
    it('includes `value` and `time` fields', function () {

      return score.save()
      .then(function (savedScore) {
        expect(savedScore.value).to.equal(100);
        expect((savedScore.time).toString()).to.equal(time.toString());
      });

    });

    it('requires `value` and `date` and value should be non-negative integer', function () {
    	 
    	let validTime =Date.now();
    	let timeArray = [null, validTime];
    	let valueArray = [-20,null,30];
    	score.time = timeArray[Math.round(Math.random())];
	    	 (score.time===null) ? score.value = valueArray[2]: score.value = valueArray[Math.round(Math.random())] 
	   
	      	// console.log("test",score.time,score.value);
      return score.validate()
      .then(function(result) {
        expect(result).to.be.an.instanceOf(Error);
       
      });

    });
  });

});

//*****************************************************************************
//TEST SPECS FOR ROOM MODEL
//*****************************************************************************


describe('The `Room` model', function () {
  before(function () {
    return db.sync({force: true});
  });
  let room;
  beforeEach(function(){
    room = Room.build({
      name: 'room2'
    });
  });

  afterEach(function () {
    return Promise.all([
      Room.truncate({ cascade: true })
    ]);
  });

  describe('attributes definition', function(){  
    it('includes `name` fields', function () {

      return room.save()
      .then(function (savedRoom) {
        expect(savedRoom.name).to.equal('room2');
      });

    });

    // it('requires `value` and `date` and value should be non-negative integer', function () {

    //   let violationErr1 = 'notNull Violation: nickname cannot be null';
    //   let violationErr2 ='Validation error: Validation min failed';

    //   return score.validate()
    //   .then(function(result) {
    //     expect(result).to.be.an.instanceOf(Error);
    //     expect(result.message).to.contain(vviolationErr1);
    //   });

    // });

  });

});



























