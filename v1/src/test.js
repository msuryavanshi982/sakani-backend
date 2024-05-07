const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp = require("chaiHttp");

chai.use(chaiHttp);

describe('API Tests', function () {
    it('Response status code should be 200', function (done) {
        chai.request(app)
            .get('/routes/v1/sakani/settings/sub-admin/all/McCone Properties/+971509968704')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});

// pm.test('Response status code is 200', function () {
//     pm.response.to.have.status(200);
// });

// pm.test('Response has the required fields', function () {
//     const responseData = pm.response.json();
//     pm.expect(responseData).to.be.an('object');
//     pm.expect(responseData.statusCode).to.exist;
//     pm.expect(responseData.message).to.exist;
//     pm.expect(responseData.error).to.exist;
//     pm.expect(responseData.path).to.exist;
// });

// pm.test("Verify that the response body is an object", function () {
//     pm.expect(pm.response.json()).to.be.an('object');
// });

// pm.test("Verify that the error is a string and not empty", function () {
//     const responseData = pm.response.json();
//     pm.expect(responseData.error).to.be.a('string', "Error should be a string");
//     pm.expect(responseData.error).to.have.lengthOf.at.least(1, "Error should not be empty");
// });

// pm.test("Verify that the path is a string and not empty", function () {
//     const responseData = pm.response.json();
//     pm.expect(responseData.path).to.be.a('string', "Path should be a string");
//     pm.expect(responseData.path).to.have.lengthOf.at.least(1, "Path should not be empty");
// });