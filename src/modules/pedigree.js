var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;
    
/**
 * @ngdoc overview
 * @name pedigree
 * @description
 * Get someone's ancestry or descendancy
 *
 * {@link https://familysearch.org/developers/docs/api/resources#pedigree FamilySearch API Docs}
 */

/**
 * Generate ancestry or descendancy convenience functions
 *
 * @param numberLabel ascendancyNumber or descendancyNumber
 * @returns {{getPersons: Function, exists: Function, getPerson: Function}}
 */
function pedigreeConvenienceFunctionGenerator(numberLabel) {
  return {
    getPersons:    function()    { return this.persons; },
    exists:        function(num) { return !!maybe(utils.find(this.persons, matchPersonNum(numberLabel, num))).id; },
    getPerson:     function(num) { return utils.find(this.persons, matchPersonNum(numberLabel, num)); }
  };
}

function matchPersonNum(numberLabel, num) {
  return function(p) {
    /*jshint eqeqeq:false */
    return p.display[numberLabel] == num; // == so users can pass in either numbers or strings for ascendancy numbers
  };
}

/**
 * @ngdoc function
 * @name pedigree.functions:getAncestry
 * @function
 *
 * @description
 * Get the ancestors of a specified person and optionally a specified spouse with the following convenience functions
 *
 * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
 * - `getPerson(ascendancyNumber)` - return a {@link person.types:constructor.Person Person}
 * - `exists(ascendancyNumber)` - return true if a person with ascendancy number exists
 * - `getDescendant(descendancyNumber)` - return a {@link person.types:constructor.Person Person} if the descendants parameter is true
 * - `existsDescendant(ascendancyNumber)` - return true if a person with descendancy number exists if the descendants parameter is true
 *
 * ### Notes
 *
 * * Each Person object has an additional `$getAscendancyNumber()` function that returns the person's ascendancy number,
 * and if the descendants parameter is true, a $getDescendancyNumber() function that returns the person's descendancy number
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Ancestry_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/15z6fzkf/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes `generations` to retrieve (max 8),
 * `spouse` id to get ancestry of person and spouse,
 * `personDetails` set to true to retrieve full person objects for each ancestor,
 * `descendants` set to true to retrieve one generation of descendants
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the ancestry
 */
FS.prototype.getAncestry = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('ancestry-query'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          utils.objectExtender(pedigreeConvenienceFunctionGenerator('ascendancyNumber')),
          !!params && !!params.descendants ? utils.objectExtender({
            getDescendant:    function(num) { return utils.find(this.persons, matchPersonNum('descendancyNumber', num)); },
            existsDescendant: function(num) { return !!maybe(utils.find(this.persons, matchPersonNum('descendancyNumber', num))).id; }
          }) : null,
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            return response;
          },
          utils.objectExtender({$getAscendancyNumber: function() { return this.display.ascendancyNumber; }}, function(response) {
            return maybe(response).persons;
          }),
          !!params && !!params.descendants ? utils.objectExtender({$getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
            return maybe(response).persons;
          }) : null
        ));
    });
};

/**
 * @ngdoc function
 * @name pedigree.functions:getDescendancy
 * @function
 *
 * @description
 * Get the descendants of a specified person and optionally a specified spouse with the following convenience functions
 * (similar convenience functions as getAncestry)
 *
 * - `getPersons()` - return an array of {@link person.types:constructor.Person Persons}
 * - `getPerson(descendancyNumber)` - return a {@link person.types:constructor.Person Person}
 * - `exists(descendancyNumber)` - return true if a person with ascendancy number exists
 *
 * ### Notes
 *
 * * Each Person object has an additional `$getDescendancyNumber()` function that returns the person's descendancy number.
 * * Some information on the Person objects is available only if `params` includes `personDetails`
 * * If `params` includes `marriageDetails`, then `person.display` includes `marriageDate` and `marriagePlace`.
 *
 * {@link https://familysearch.org/developers/docs/api/tree/Descendancy_resource FamilySearch API Docs}
 *
 * {@link http://jsfiddle.net/fbcppezv/ editable example}
 *
 * @param {string} pid id of the person
 * @param {Object=} params includes
 * `generations` to retrieve max 2,
 * `spouse` id to get descendency of person and spouse (set to null to get descendants of unknown spouse),
 * `marriageDetails` set to true to provide marriage details, and
 * `personDetails` set to true to provide person details.
 * @param {Object=} opts options to pass to the http function specified during init
 * @return {Object} promise for the descendancy
 */
FS.prototype.getDescendancy = function(pid, params, opts) {
  var self = this;
  return self.helpers.chainHttpPromises(
    self.plumbing.getUrl('descendancy-query'),
    function(url) {
      return self.plumbing.get(url, utils.extend({'person': pid}, params), {}, opts,
        utils.compose(
          utils.objectExtender(pedigreeConvenienceFunctionGenerator('descendancyNumber')),
          function(response){
            utils.forEach(response.persons, function(person, index, obj){
              obj[index] = self.createPerson(person);
            });
            return response;
          },
          utils.objectExtender({$getDescendancyNumber: function() { return this.display.descendancyNumber; }}, function(response) {
            return maybe(response).persons;
          })
        ));
    });
};
