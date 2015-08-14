var FS = require('./../FamilySearch'),
    utils = require('./../utils'),
    maybe = utils.maybe;

/**********************************/
/**
 * @ngdoc function
 * @name discussions.types:constructor.Comment
 * @description
 *
 * Comment on a discussion
 * To create or update a comment, you must set text and either $discussionId or $memoryId.
 *
 * @param {Object=} data an object with optional attributes {text, $discussionId, $memoryId}
 **********************************/

var Comment = FS.Comment = function(client, data) {
  FS.BaseClass.call(this, client, data);
};

/**
 * @ngdoc function
 * @name discussions.functions:createComment
 * @param {Object} data [Comment](https://familysearch.org/developers/docs/api/fs/Comment_json) data
 * @return {Object} {@link discussions.types:constructor.Comment Comment}
 * @description Create a {@link discussions.types:constructor.Comment Comment} object. Use this method instead of calling the constructor directly.
 */
FS.prototype.createComment = function(data){
  return new Comment(this, data);
};

Comment.prototype = {
  constructor: Comment,
  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#id
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} Id of the comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#text
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} text of the comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#created
   * @propertyOf discussions.types:constructor.Comment
   * @return {Number} timestamp
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#$discussionId
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} Id of the discussion if this is a discussion comment
   */

  /**
   * @ngdoc property
   * @name discussions.types:constructor.Comment#$memoryId
   * @propertyOf discussions.types:constructor.Comment
   * @return {String} Id of the memory if this is a memory comment
   */

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getCommentUrl
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {String} URL of this comment; _NOTE_ however, that individual comments cannot be read
   */
  $getCommentUrl: function() { return this.$helpers.removeAccessToken(maybe(maybe(this.links).comment).href); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getAgentId
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {String} id of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentId: function() { return maybe(this.contributor).resourceId; },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getAgentUrl
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {String} URL of the contributor - pass into {@link user.functions:getAgent getAgent} for details
   */
  $getAgentUrl: function() { return this.$helpers.removeAccessToken(maybe(this.contributor).resource); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$getAgent
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @return {Object} promise for the {@link user.functions:getAgent getAgent} response
   */
  $getAgent: function() { return this.$client.getAgent(this.$getAgentUrl() || this.$getAgentId()); },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$save
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @description
   * Create a new comment or update an existing comment
   *
   * _NOTE_: there's no _refresh_ parameter because it's not possible to read individual comments;
   * however, the comment's id and URL is set when creating a new comment
   *
   * {@link http://jsfiddle.net/yr9zv5fw/ editable example}
   *
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise of the comment id
   */
  $save: function(changeMessage, opts) {
    var self = this;
    var template = this.$memoryId ? 'memory-comments-template' : 'discussion-comments-template';
    return self.$helpers.chainHttpPromises(
      self.$plumbing.getUrl(template, null, {did: self.$discussionId, mid: self.$memoryId}),
      function(url) {
        var payload = {discussions: [{ comments: [ self ] }] };
        return self.$plumbing.post(url, payload, {'Content-Type' : 'application/x-fs-v1+json'}, opts, function(data, promise) {
          if (!self.id) {
            self.id = promise.getResponseHeader('X-ENTITY-ID');
          }
          if (!self.$getCommentUrl()) {
            self.links = { comment: { href: promise.getResponseHeader('Location') } };
          }
          return self.id;
        });
      });
  },

  /**
   * @ngdoc function
   * @name discussions.types:constructor.Comment#$delete
   * @methodOf discussions.types:constructor.Comment
   * @function
   * @description delete this comment
   * @description delete this comment - see {@link discussions.functions:deleteDiscussionComment deleteDiscussionComment}
   * or {@link memories.functions:deleteMemoryComment deleteMemoryComment}
   * @param {string=} changeMessage change message (currently ignored)
   * @param {Object=} opts options to pass to the http function specified during init
   * @return {Object} promise for the comment url
   */
  $delete: function(changeMessage, opts) {
    if (this.$discussionId) {
      return this.$client.deleteDiscussionComment(this.$getCommentUrl() || this.$discussionId, this.id, changeMessage, opts);
    }
    else {
      return this.$client.deleteMemoryComment(this.$getCommentUrl() || this.$memoryId, this.id, changeMessage, opts);
    }
  }

};