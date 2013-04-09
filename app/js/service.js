'use strict';
// 
BioASQ.Questions= function($rootScope,QuestionsRes,DetailRes) {
	this.scope = $rootScope;
	this.QuestionsRes = QuestionsRes;
	this.DetailRes = DetailRes;
};

//
BioASQ.Questions.prototype.getQuestions = function(callback) {
	//var self = this;
	this.QuestionsRes.get(
		function(data, headers) { // on success
			//self.scope.questions = data;
			callback(data);
		},
		function(response) { // on error
			//self.scope.questions = "error";
			callback(null);
		});
};
//
BioASQ.Questions.prototype.getDetail = function(id, callback) {
	
	this.DetailRes.get({id:id},
		function(data, headers) { // on success
			callback(data[0]);
		},
		function(response) { // on error
			callback(null);
		});
};
//
BioASQ.service('BioAsqService', BioASQ.Questions);
